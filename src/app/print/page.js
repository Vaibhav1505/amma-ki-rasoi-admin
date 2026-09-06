import dbConnect from '../../lib/mongodb';
import Order from '../../lib/models/Order';
import Link from 'next/link';

export const metadata = {
  title: 'Print Centre | Amma Ki Rasoi'
};

export default async function PrintCentrePage() {
  await dbConnect();
  
  // Fetch recent orders that need printing
  const orders = await Order.find({ status: { $in: ['confirmed', 'packing'] } }).sort({ createdAt: -1 }).lean();

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h1 className="page-title" style={{ margin: 0 }}>🖨️ Print Centre</h1>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn">Print Product Stickers</button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '32px' }}>
        {/* Bulk Actions */}
        <div className="card" style={{ flex: '1' }}>
          <h2 className="section-title" style={{ marginTop: 0 }}>Bulk Actions</h2>
          <p className="text-muted" style={{ marginBottom: '24px' }}>Print documents for all currently pending shipments.</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button className="btn btn-primary" style={{ padding: '12px', fontSize: '1rem' }}>
              Print All Invoices ({orders.length})
            </button>
            <button className="btn" style={{ padding: '12px', fontSize: '1rem', border: '1px solid var(--primary-terracotta)', color: 'var(--primary-terracotta)', backgroundColor: 'transparent' }}>
              Print All Shipping Labels
            </button>
          </div>
        </div>

        {/* Individual Orders to Print */}
        <div className="card" style={{ flex: '2' }}>
          <h2 className="section-title" style={{ marginTop: 0 }}>Orders Ready to Print</h2>
          
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Status</th>
                <th>Print Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                    No orders currently need printing.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order._id.toString()}>
                    <td className="data-font" style={{ fontWeight: '600' }}>{order.orderId}</td>
                    <td>{order.customerName}</td>
                    <td><span className={`badge badge-${order.status}`}>{order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <Link href={`/print/invoice/${order._id}`} className="btn">Invoice</Link>
                        <Link href={`/print/label/${order._id}`} className="btn">Label</Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
