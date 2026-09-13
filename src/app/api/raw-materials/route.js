import dbConnect from '@/lib/mongodb';
import RawMaterial from '@/lib/models/RawMaterial';
import Supplier from '@/lib/models/Supplier'; // eslint-disable-line no-unused-vars -- registers the Supplier model so .populate('supplier') can resolve it
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';

export async function GET() {
  const authError = await requireAuth();
  if (authError) return authError;

  try {
    await dbConnect();
    const rawMaterials = await RawMaterial.find().sort({ name: 1 }).populate('supplier', 'name').lean();
    return NextResponse.json(rawMaterials, { status: 200 });
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

    const rawMaterial = await RawMaterial.create({ ...body, supplier: body.supplier || null });

    return NextResponse.json(rawMaterial, { status: 201 });
  } catch (error) {
    if (error.code === 11000) {
      return NextResponse.json({ error: 'A raw material with this name already exists.' }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
