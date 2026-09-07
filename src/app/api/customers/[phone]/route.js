import dbConnect from '@/lib/mongodb';
import Customer from '@/lib/models/Customer';
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';

export async function PATCH(request, { params }) {
  const authError = await requireAuth();
  if (authError) return authError;

  try {
    const resolvedParams = await params;
    const phone = decodeURIComponent(resolvedParams.phone);
    await dbConnect();
    const { tags, internalNote } = await request.json();

    const customer = await Customer.findOneAndUpdate(
      { phone },
      { tags, internalNote, updatedAt: new Date() },
      { new: true, upsert: true, runValidators: true }
    );

    return NextResponse.json(customer, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
