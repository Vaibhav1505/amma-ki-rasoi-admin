import BusinessSettings from '@/lib/models/BusinessSettings';
import { getBusinessSettings } from '@/lib/settings';
import dbConnect from '@/lib/mongodb';
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';

export async function GET() {
  const authError = await requireAuth();
  if (authError) return authError;

  try {
    const settings = await getBusinessSettings();
    return NextResponse.json(settings, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  const authError = await requireAuth();
  if (authError) return authError;

  try {
    await dbConnect();
    const body = await request.json();
    delete body._id; // the singleton id is fixed, never client-supplied

    const settings = await BusinessSettings.findByIdAndUpdate(
      'business',
      { ...body, updatedAt: new Date() },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );

    return NextResponse.json(settings, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
