import dbConnect from '@/lib/mongodb';
import Supplier from '@/lib/models/Supplier';
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';

export async function GET(request, { params }) {
  const authError = await requireAuth();
  if (authError) return authError;

  try {
    const resolvedParams = await params;
    await dbConnect();

    const supplier = await Supplier.findById(resolvedParams.id);
    if (!supplier) {
      return NextResponse.json({ error: 'Supplier not found' }, { status: 404 });
    }

    return NextResponse.json(supplier, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  const authError = await requireAuth();
  if (authError) return authError;

  try {
    const resolvedParams = await params;
    await dbConnect();
    const body = await request.json();

    const supplier = await Supplier.findByIdAndUpdate(
      resolvedParams.id,
      { ...body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!supplier) {
      return NextResponse.json({ error: 'Supplier not found' }, { status: 404 });
    }

    return NextResponse.json(supplier, { status: 200 });
  } catch (error) {
    if (error.code === 11000) {
      return NextResponse.json({ error: 'A supplier with this name already exists.' }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(request, { params }) {
  const authError = await requireAuth();
  if (authError) return authError;

  try {
    const resolvedParams = await params;
    await dbConnect();

    const supplier = await Supplier.findByIdAndDelete(resolvedParams.id);
    if (!supplier) {
      return NextResponse.json({ error: 'Supplier not found' }, { status: 404 });
    }

    // Raw materials that pointed at this supplier just lose the reference
    // (populate returns null) rather than being blocked or cascade-deleted.
    return NextResponse.json({ message: 'Supplier deleted' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
