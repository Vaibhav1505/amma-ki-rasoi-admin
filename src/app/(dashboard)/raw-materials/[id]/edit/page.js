import RawMaterialForm from '../../RawMaterialForm';
import dbConnect from '@/lib/mongodb';
import RawMaterial from '@/lib/models/RawMaterial';
import RawMaterialMovement from '@/lib/models/RawMaterialMovement';
import Supplier from '@/lib/models/Supplier';
import Product from '@/lib/models/Product'; // eslint-disable-line no-unused-vars -- registers the Product model so .populate('product') can resolve it
import { notFound } from 'next/navigation';
import { History } from 'lucide-react';
import { formatKg } from '@/lib/weight';

export const metadata = {
  title: 'Edit Raw Material | Amma Ki Rasoi Admin'
};

const REASON_LABELS = {
  restock: { label: 'Restocked', color: 'var(--success-green)' },
  production_batch: { label: 'Used in production', color: 'var(--danger-red)' },
  manual_adjustment: { label: 'Manual adjustment', color: 'var(--text-muted)' },
};

export default async function EditRawMaterialPage({ params }) {
  const resolvedParams = await params;

  await dbConnect();

  let rawMaterial;
  try {
    rawMaterial = await RawMaterial.findById(resolvedParams.id).lean();
  } catch (e) {
    notFound();
  }

  if (!rawMaterial) {
    notFound();
  }

  const movements = await RawMaterialMovement.find({ rawMaterial: rawMaterial._id })
    .sort({ createdAt: -1 })
    .limit(20)
    .populate('product', 'name')
    .lean();

  const suppliers = await Supplier.find({}).sort({ name: 1 }).lean();
  const serializedSuppliers = suppliers.map(s => ({ ...s, _id: s._id.toString() }));

  const serializedRawMaterial = {
    ...rawMaterial,
    _id: rawMaterial._id.toString(),
    supplier: rawMaterial.supplier ? rawMaterial.supplier.toString() : ''
  };

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 className="page-title" style={{ margin: 0 }}>Edit Raw Material</h1>
      </div>
      <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start' }}>
        <div style={{ flex: '2' }}>
          <RawMaterialForm initialData={serializedRawMaterial} suppliers={serializedSuppliers} />
        </div>
        <div className="card" style={{ flex: '1' }}>
          <h2 className="section-title" style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '8px' }}><History size={17} strokeWidth={2} /> Stock History</h2>
          {movements.length === 0 ? (
            <div className="text-muted" style={{ fontSize: '0.875rem' }}>No stock movements recorded yet.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {movements.map((m) => {
                const info = REASON_LABELS[m.reason] || { label: m.reason, color: 'var(--text-muted)' };
                return (
                  <div key={m._id.toString()} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '10px', borderBottom: '1px solid var(--border-cream)' }}>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: '500' }}>{info.label}</div>
                      <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                        {new Date(m.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
                        {m.product?.name ? ` · ${m.product.name}` : ''}
                      </div>
                    </div>
                    <div className="data-font" style={{ fontWeight: '700', color: m.change > 0 ? 'var(--success-green)' : 'var(--danger-red)' }}>
                      {m.change > 0 ? '+' : ''}{formatKg(m.change)}kg
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
