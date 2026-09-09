import { notFound } from 'next/navigation';
import dbConnect from '../../../../lib/mongodb';
import Order from '../../../../lib/models/Order';
import { getOrCreateInvoice } from '../../../../lib/invoicing';
import { getBusinessSettings } from '../../../../lib/settings';
import InvoiceDocument from '@/components/print/InvoiceDocument';
import Link from 'next/link';
import { ArrowLeft, Printer } from 'lucide-react';

export default async function InvoicePrintPage({ params }) {
  const resolvedParams = await params;

  await dbConnect();

  let order;
  try {
    order = await Order.findById(resolvedParams.orderId).lean();
  } catch (e) {
    notFound();
  }

  if (!order) {
    notFound();
  }

  const [invoice, business] = await Promise.all([
    getOrCreateInvoice(order._id),
    getBusinessSettings(),
  ]);

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', backgroundColor: 'white' }}>
      {/* Non-printable controls */}
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px', paddingBottom: '16px', borderBottom: '1px solid #ccc' }}>
        <Link href="/print" className="btn" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <ArrowLeft size={14} strokeWidth={2} /> Back to Print Centre
        </Link>
        <button className="btn btn-primary" type="button" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <Printer size={14} strokeWidth={2} /> Print Invoice
        </button>
      </div>

      <InvoiceDocument order={order} invoice={invoice} business={business} />

      {/* Client-side script to hook up the print button */}
      <script dangerouslySetInnerHTML={{ __html: `
        document.querySelector('button[type="button"]').addEventListener('click', function() {
          window.print();
        });
      `}} />
    </div>
  );
}
