import dbConnect from '../../../../lib/mongodb';
import Order from '../../../../lib/models/Order';
import { getOrCreateInvoice } from '../../../../lib/invoicing';
import { getBusinessSettings } from '../../../../lib/settings';
import InvoiceDocument from '@/components/print/InvoiceDocument';
import Link from 'next/link';
import { ArrowLeft, Printer } from 'lucide-react';

export const metadata = {
  title: 'Print All Invoices | Amma Ki Rasoi Admin'
};

// Pass either ?ids=id1,id2,... for an explicit selection, or ?status=confirmed
// to print every order currently in that status. Defaults to confirmed+packing
// (the same "ready to print" set the Print Centre lists).
export default async function BulkInvoicesPage({ searchParams }) {
  const params = await searchParams;
  await dbConnect();

  const query = params.ids
    ? { _id: { $in: params.ids.split(',').filter(Boolean) } }
    : { status: { $in: params.status ? [params.status] : ['confirmed', 'packing'] } };

  const orders = await Order.find(query).sort({ createdAt: -1 }).lean();
  const business = await getBusinessSettings();
  const invoices = await Promise.all(orders.map(o => getOrCreateInvoice(o._id)));

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', backgroundColor: 'white' }}>
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
        orders.map((order, idx) => (
          <div key={order._id.toString()} style={{ pageBreakAfter: idx < orders.length - 1 ? 'always' : 'auto', marginBottom: '48px' }}>
            <InvoiceDocument order={order} invoice={invoices[idx]} business={business} />
          </div>
        ))
      )}

      <script dangerouslySetInnerHTML={{ __html: `
        document.querySelector('button[type="button"]').addEventListener('click', function() {
          window.print();
        });
      `}} />
    </div>
  );
}
