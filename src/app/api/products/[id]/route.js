import dbConnect from '@/lib/mongodb';
import Product from '@/lib/models/Product';
import StockMovement from '@/lib/models/StockMovement';
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';

export async function PUT(request, { params }) {
  const authError = await requireAuth();
  if (authError) return authError;

  try {
    const resolvedParams = await params;
    await dbConnect();
    const body = await request.json();

    const before = await Product.findById(resolvedParams.id);
    if (!before) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const product = await Product.findByIdAndUpdate(
      resolvedParams.id,
      { ...body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    const stockChange = product.stock - before.stock;
    if (stockChange !== 0) {
      await StockMovement.create({ product: product._id, change: stockChange, reason: 'manual_adjustment' });
    }

    return NextResponse.json(product, { status: 200 });
  } catch (error) {
    if (error.code === 11000) {
      return NextResponse.json({ error: 'A product with this slug already exists.' }, { status: 400 });
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

    const product = await Product.findByIdAndDelete(resolvedParams.id);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Product deleted' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
