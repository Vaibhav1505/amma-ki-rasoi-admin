import dbConnect from '@/lib/mongodb';
import Supplier from '@/lib/models/Supplier';
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';

export async function GET() {
  const authError = await requireAuth();
  if (authError) return authError;

  try {
    await dbConnect();
    const suppliers = await Supplier.find().sort({ name: 1 }).lean();
    return NextResponse.json(suppliers, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  const authError = await requireAuth();
  if (authError) return authError;

  try {
    await dbConnect();
    const body = await request.json();

    const supplier = await Supplier.create(body);

    return NextResponse.json(supplier, { status: 201 });
  } catch (error) {
    if (error.code === 11000) {
      return NextResponse.json({ error: 'A supplier with this name already exists.' }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
