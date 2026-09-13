import dbConnect from '@/lib/mongodb';
import RawMaterial from '@/lib/models/RawMaterial';
import RawMaterialMovement from '@/lib/models/RawMaterialMovement';
import Supplier from '@/lib/models/Supplier'; // eslint-disable-line no-unused-vars -- registers the Supplier model so .populate('supplier') can resolve it
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';

export async function GET(request, { params }) {
  const authError = await requireAuth();
  if (authError) return authError;

  try {
    const resolvedParams = await params;
    await dbConnect();

    const rawMaterial = await RawMaterial.findById(resolvedParams.id).populate('supplier', 'name');
    if (!rawMaterial) {
      return NextResponse.json({ error: 'Raw material not found' }, { status: 404 });
    }

    return NextResponse.json(rawMaterial, { status: 200 });
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

    const before = await RawMaterial.findById(resolvedParams.id);
    if (!before) {
      return NextResponse.json({ error: 'Raw material not found' }, { status: 404 });
    }

    const rawMaterial = await RawMaterial.findByIdAndUpdate(
      resolvedParams.id,
      { ...body, supplier: body.supplier || null, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    const beforeStock = before.stockGrams ?? 0;
    const afterStock = rawMaterial.stockGrams ?? 0;
    const stockChange = afterStock - beforeStock;
    if (stockChange !== 0) {
      // Editing the stock field directly is almost always "we bought more
      // from the supplier" (restock); a decrease is treated as a manual
      // correction (spoilage, counting error, etc.) so the stock history
      // reads sensibly either way.
      const reason = stockChange > 0 ? 'restock' : 'manual_adjustment';
      await RawMaterialMovement.create({ rawMaterial: rawMaterial._id, change: stockChange, reason });
    }

    return NextResponse.json(rawMaterial, { status: 200 });
  } catch (error) {
    if (error.code === 11000) {
      return NextResponse.json({ error: 'A raw material with this name already exists.' }, { status: 400 });
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

    const rawMaterial = await RawMaterial.findByIdAndDelete(resolvedParams.id);
    if (!rawMaterial) {
      return NextResponse.json({ error: 'Raw material not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Raw material deleted' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
