import SupplierForm from '../../SupplierForm';
import dbConnect from '@/lib/mongodb';
import Supplier from '@/lib/models/Supplier';
import RawMaterial from '@/lib/models/RawMaterial';
import { notFound } from 'next/navigation';
import { Package2 } from 'lucide-react';
import { formatKg } from '@/lib/weight';
import Link from 'next/link';

export const metadata = {
  title: 'Edit Supplier | Amma Ki Rasoi Admin'
};

export default async function EditSupplierPage({ params }) {
  const resolvedParams = await params;

  await dbConnect();

  let supplier;
  try {
    supplier = await Supplier.findById(resolvedParams.id).lean();
  } catch (e) {
    notFound();
  }

  if (!supplier) {
    notFound();
  }

  const suppliedMaterials = await RawMaterial.find({ supplier: supplier._id }).sort({ name: 1 }).lean();

  const serializedSupplier = {
    ...supplier,
    _id: supplier._id.toString()
  };

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 className="page-title" style={{ margin: 0 }}>Edit Supplier</h1>
      </div>
      <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start' }}>
        <div style={{ flex: '2' }}>
          <SupplierForm initialData={serializedSupplier} />
        </div>
        <div className="card" style={{ flex: '1' }}>
          <h2 className="section-title" style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '8px' }}><Package2 size={17} strokeWidth={2} /> Raw Materials Supplied</h2>
          {suppliedMaterials.length === 0 ? (
            <div className="text-muted" style={{ fontSize: '0.875rem' }}>No raw materials linked to this supplier yet. Set it as the supplier on a raw material to see it here.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {suppliedMaterials.map((rm) => (
                <div key={rm._id.toString()} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '10px', borderBottom: '1px solid var(--border-cream)' }}>
                  <Link href={`/raw-materials/${rm._id.toString()}/edit`} style={{ fontSize: '0.85rem', fontWeight: '500' }}>{rm.name}</Link>
                  <div className="data-font text-muted" style={{ fontSize: '0.8125rem' }}>{formatKg(rm.stockGrams)}kg</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
