import dbConnect from '@/lib/mongodb';
import Order from '@/lib/models/Order';
import Customer from '@/lib/models/Customer';
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';

// Merges one or more duplicate phone numbers (different formatting of the
// same person, e.g. "+91 98765 43210" vs "9876543210") into a single
// canonical phone: reassigns their orders and unions their CRM tags/notes.
export async function POST(request) {
  const authError = await requireAuth();
  if (authError) return authError;

  try {
    await dbConnect();
    const { primaryPhone, duplicatePhones } = await request.json();

    if (!primaryPhone || !Array.isArray(duplicatePhones) || duplicatePhones.length === 0) {
      return NextResponse.json({ error: 'primaryPhone and duplicatePhones[] are required' }, { status: 400 });
    }

    const phonesToMerge = duplicatePhones.filter(p => p && p !== primaryPhone);
    if (phonesToMerge.length === 0) {
      return NextResponse.json({ error: 'No distinct duplicate phones to merge' }, { status: 400 });
    }

    await Order.updateMany(
      { customerPhone: { $in: phonesToMerge } },
      { $set: { customerPhone: primaryPhone } }
    );

    const duplicateCustomers = await Customer.find({ phone: { $in: phonesToMerge } });
    const primaryCustomer = await Customer.findOne({ phone: primaryPhone });

    const mergedTags = new Set(primaryCustomer?.tags || []);
    const noteParts = [primaryCustomer?.internalNote].filter(Boolean);
    duplicateCustomers.forEach(c => {
      (c.tags || []).forEach(t => mergedTags.add(t));
      if (c.internalNote) noteParts.push(c.internalNote);
    });

    await Customer.findOneAndUpdate(
      { phone: primaryPhone },
      { phone: primaryPhone, tags: [...mergedTags], internalNote: noteParts.join('\n') },
      { upsert: true }
    );

    await Customer.deleteMany({ phone: { $in: phonesToMerge } });

    return NextResponse.json({ mergedInto: primaryPhone, mergedFrom: phonesToMerge }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
