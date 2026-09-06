import dbConnect from '../../../lib/mongodb';
import Product from '../../../lib/models/Product';
import { NextResponse } from 'next/server';
import { requireAuth } from '../../../lib/auth';

export async function GET() {
  const authError = await requireAuth();
  if (authError) return authError;

  try {
    await dbConnect();
    const products = await Product.find().sort({ name: 1 }).lean();
    return NextResponse.json(products, { status: 200 });
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

    const product = await Product.create(body);
    
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    if (error.code === 11000) {
      return NextResponse.json({ error: 'A product with this slug already exists.' }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
