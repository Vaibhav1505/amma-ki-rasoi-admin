import dbConnect from '@/lib/mongodb';
import { logProductionBatch } from '@/lib/rawMaterials';
import { kgToGrams } from '@/lib/weight';
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';

// Logs a production batch for a product: "I just made 20kg of Thekua."
// Deducts the recipe's raw materials (if any) and adds the batch to the
// product's finished stock, all-or-nothing — see lib/rawMaterials.js.
export async function POST(request, { params }) {
  const authError = await requireAuth();
  if (authError) return authError;

  try {
    const resolvedParams = await params;
    await dbConnect();
    const body = await request.json();

    const batchGrams = kgToGrams(body.batchKg);
    if (!batchGrams || batchGrams <= 0) {
      return NextResponse.json({ error: 'Enter a batch size greater than 0.' }, { status: 400 });
    }

    await logProductionBatch({ productId: resolvedParams.id, batchGrams });

    return NextResponse.json({ message: 'Production batch logged' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
