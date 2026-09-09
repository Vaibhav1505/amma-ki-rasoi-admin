import dbConnect from '../../../../lib/mongodb';
import Order from '../../../../lib/models/Order';
import { getBusinessSettings } from '../../../../lib/settings';
import { generateBarcodeDataUri } from '../../../../lib/barcode';
import ShippingLabelDocument from '@/components/print/ShippingLabelDocument';
import Link from 'next/link';
import { ArrowLeft, Printer } from 'lucide-react';

export const metadata = {
  title: 'Print All Labels | Amma Ki Rasoi Admin'
};

// Pass either ?ids=id1,id2,... for an explicit selection, or ?status=packing
// to print every order currently in that status. Defaults to "packing".
export default async function BulkLabelsPage({ searchParams }) {
  const params = await searchParams;
  await dbConnect();

  const query = params.ids
    ? { _id: { $in: params.ids.split(',').filter(Boolean) } }
    : { status: params.status || 'packing' };

  const orders = await Order.find(query).sort({ createdAt: -1 }).lean();
  const business = await getBusinessSettings();
  const barcodes = await Promise.all(orders.map(o => generateBarcodeDataUri(o.orderId)));

  return (
    <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto', backgroundColor: '#f9f9f9', minHeight: '100vh' }}>
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px', paddingBottom: '16px', borderBottom: '1px solid #ccc' }}>
        <Link href="/print" className="btn" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <ArrowLeft size={14} strokeWidth={2} /> Back to Print Centre
        </Link>
        <button className="btn btn-primary" type="button" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <Printer size={14} strokeWidth={2} /> Print All ({orders.length})
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="no-print" style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
          No orders match this selection.
        </div>
      ) : (
        <div>
          {orders.map((order, idx) => (
            <div key={order._id.toString()} style={{ pageBreakAfter: idx < orders.length - 1 ? 'always' : 'auto', marginBottom: '24px' }}>
              <ShippingLabelDocument order={order} business={business} barcodeDataUri={barcodes[idx]} />
            </div>
          ))}
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page { margin: 0; size: 4in 6in; }
          body { background: white; margin: 0; }
          .label-area { border: none !important; }
        }
      `}} />

      <script dangerouslySetInnerHTML={{ __html: `
        document.querySelector('button[type="button"]').addEventListener('click', function() {
          window.print();
        });
      `}} />
    </div>
  );
}
