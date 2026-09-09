import { notFound } from 'next/navigation';
import dbConnect from '../../../../lib/mongodb';
import Order from '../../../../lib/models/Order';
import { getBusinessSettings } from '../../../../lib/settings';
import { generateBarcodeDataUri } from '../../../../lib/barcode';
import ShippingLabelDocument from '@/components/print/ShippingLabelDocument';
import Link from 'next/link';
import { ArrowLeft, Printer } from 'lucide-react';

export default async function ShippingLabelPage({ params }) {
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

  const [business, barcodeDataUri] = await Promise.all([
    getBusinessSettings(),
    generateBarcodeDataUri(order.orderId),
  ]);

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', backgroundColor: '#f9f9f9', minHeight: '100vh' }}>
      {/* Non-printable controls */}
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px', paddingBottom: '16px', borderBottom: '1px solid #ccc' }}>
        <Link href="/print" className="btn" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <ArrowLeft size={14} strokeWidth={2} /> Back to Print Centre
        </Link>
        <button className="btn btn-primary" type="button" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <Printer size={14} strokeWidth={2} /> Print Label (4x6)
        </button>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page { margin: 0; size: 4in 6in; }
          body { background: white; margin: 0; }
          .label-area { border: none !important; width: 100% !important; height: 100% !important; margin: 0 !important; }
        }
      `}} />

      <ShippingLabelDocument order={order} business={business} barcodeDataUri={barcodeDataUri} />

      <script dangerouslySetInnerHTML={{ __html: `
        document.querySelector('button[type="button"]').addEventListener('click', function() {
          window.print();
        });
      `}} />
    </div>
  );
}
