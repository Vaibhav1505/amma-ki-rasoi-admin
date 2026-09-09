import ProductForm from '../../ProductForm';
import dbConnect from '../../../../../lib/mongodb';
import Product from '../../../../../lib/models/Product';
import StockMovement from '../../../../../lib/models/StockMovement';
import { notFound } from 'next/navigation';
import { History } from 'lucide-react';
import { formatKg } from '../../../../../lib/weight';

export const metadata = {
  title: 'Edit Product | Amma Ki Rasoi Admin'
};

const REASON_LABELS = {
  order_placed: { label: 'Order placed', color: 'var(--danger-red)' },
  order_edited: { label: 'Order edited', color: 'var(--text-muted)' },
  order_cancelled: { label: 'Order cancelled', color: 'var(--success-green)' },
  order_returned: { label: 'Order returned', color: 'var(--success-green)' },
  manual_adjustment: { label: 'Manual adjustment', color: 'var(--text-muted)' },
};

export default async function EditProductPage({ params }) {
  const resolvedParams = await params;

  await dbConnect();

  let product;
  try {
    product = await Product.findById(resolvedParams.id).lean();
  } catch (e) {
    notFound();
  }

  if (!product) {
    notFound();
  }

  const movements = await StockMovement.find({ product: product._id })
    .sort({ createdAt: -1 })
    .limit(20)
    .populate('order', 'orderId')
    .lean();

  // Convert ObjectId to string for Client Component props
  const serializedProduct = {
    ...product,
    _id: product._id.toString()
  };

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 className="page-title" style={{ margin: 0 }}>Edit Product</h1>
      </div>
      <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start' }}>
        <div style={{ flex: '2' }}>
          <ProductForm initialData={serializedProduct} />
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
                        {m.order?.orderId ? ` · ${m.order.orderId}` : ''}
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
