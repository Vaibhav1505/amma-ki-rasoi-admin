import { notFound } from 'next/navigation';
import dbConnect from '../../../../lib/mongodb';
import Order from '../../../../lib/models/Order';
import { getOrCreateInvoice } from '../../../../lib/invoicing';
import { getBusinessSettings } from '../../../../lib/settings';
import Link from 'next/link';

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

  const businessAddressLine = [business.address, [business.city, business.state, business.pincode].filter(Boolean).join(', ')]
    .filter(Boolean)
    .join(' — ');
  const businessContactLine = [business.phone, business.email].filter(Boolean).join(' | ');

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', backgroundColor: 'white' }}>
      {/* Non-printable controls */}
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px', paddingBottom: '16px', borderBottom: '1px solid #ccc' }}>
        <Link href="/print" className="btn">&larr; Back to Print Centre</Link>
        <button className="btn btn-primary" type="button">🖨️ Print Invoice</button>
      </div>

      {/* Printable Invoice Area */}
      <div id="invoice-area" style={{ fontFamily: 'var(--font-ui)', color: '#000' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #000', paddingBottom: '24px', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 8px 0' }}>{business.name}</h1>
            {business.tagline && <div style={{ fontSize: '14px', color: '#555' }}>{business.tagline}</div>}
            {businessAddressLine && <div style={{ fontSize: '13px', color: '#555', marginTop: '4px' }}>{businessAddressLine}</div>}
            {businessContactLine && <div style={{ fontSize: '14px', color: '#555', marginTop: '4px' }}>{businessContactLine}</div>}
            {business.gstNumber && <div style={{ fontSize: '13px', color: '#555', marginTop: '4px' }}>GSTIN: {business.gstNumber}</div>}
            {business.fssaiNumber && <div style={{ fontSize: '13px', color: '#555', marginTop: '2px' }}>FSSAI Lic. No: {business.fssaiNumber}</div>}
          </div>
          <div style={{ textAlign: 'right' }}>
            <h2 style={{ fontSize: '28px', color: '#C1440E', margin: '0 0 8px 0', textTransform: 'uppercase' }}>INVOICE</h2>
            <div style={{ fontSize: '14px', fontWeight: 'bold' }}>Invoice #: {invoice.invoiceNumber}</div>
            <div style={{ fontSize: '14px' }}>Order #: {order.orderId}</div>
            <div style={{ fontSize: '14px' }}>Date: {new Date(invoice.createdAt).toLocaleDateString()}</div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px' }}>
          <div style={{ width: '45%' }}>
            <h3 style={{ fontSize: '14px', textTransform: 'uppercase', color: '#666', borderBottom: '1px solid #ccc', paddingBottom: '4px', marginBottom: '8px' }}>Billed To:</h3>
            <div style={{ fontWeight: 'bold', fontSize: '16px' }}>{order.customerName}</div>
            <div style={{ fontSize: '14px', marginTop: '4px' }}>Phone: {order.customerPhone}</div>
            {order.customerEmail && <div style={{ fontSize: '14px', marginTop: '4px' }}>Email: {order.customerEmail}</div>}
          </div>
          <div style={{ width: '45%' }}>
            <h3 style={{ fontSize: '14px', textTransform: 'uppercase', color: '#666', borderBottom: '1px solid #ccc', paddingBottom: '4px', marginBottom: '8px' }}>Shipped To:</h3>
            <div style={{ fontSize: '14px', whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>
              {order.shippingAddress}
            </div>
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '32px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f5f5f5', borderBottom: '1px solid #ccc' }}>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Description</th>
              <th style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold', width: '100px' }}>Quantity</th>
              <th style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold', width: '120px' }}>Unit Price</th>
              <th style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold', width: '120px' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '12px', textAlign: 'left' }}>{item.productName}</td>
                <td style={{ padding: '12px', textAlign: 'center' }}>{item.quantity}</td>
                <td style={{ padding: '12px', textAlign: 'right' }}>₹{item.price.toFixed(2)}</td>
                <td style={{ padding: '12px', textAlign: 'right' }}>₹{(item.price * item.quantity).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '48px' }}>
          <div style={{ width: '300px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', borderBottom: '1px solid #eee' }}>
              <span>Subtotal:</span>
              <span>₹{order.totalAmount.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', borderBottom: '1px solid #eee' }}>
              <span>Shipping:</span>
              <span>₹0.00</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', borderBottom: '2px solid #000', fontWeight: 'bold', fontSize: '18px' }}>
              <span>Total:</span>
              <span>₹{order.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {business.upiId && (
          <div style={{ marginBottom: '32px', fontSize: '13px', color: '#555' }}>
            Pay via UPI: <strong>{business.upiId}</strong>
          </div>
        )}

        <div style={{ textAlign: 'center', color: '#666', fontSize: '14px', borderTop: '1px solid #ccc', paddingTop: '24px' }}>
          <p style={{ margin: '0 0 8px 0', fontWeight: 'bold', color: '#C1440E' }}>Thank you for bringing Amma's love to your kitchen!</p>
          <p style={{ margin: 0 }}>This is a computer generated invoice and does not require a physical signature.</p>
        </div>
      </div>

      {/* Client-side script to hook up the print button */}
      <script dangerouslySetInnerHTML={{ __html: `
        document.querySelector('button[type="button"]').addEventListener('click', function() {
          window.print();
        });
      `}} />
    </div>
  );
}
