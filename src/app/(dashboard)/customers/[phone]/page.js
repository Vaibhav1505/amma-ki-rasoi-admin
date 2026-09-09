import dbConnect from '@/lib/mongodb';
import Order from '@/lib/models/Order';
import Customer from '@/lib/models/Customer';
import Link from 'next/link';
import CustomerCrmEditor from '@/components/CustomerCrmEditor';
import CustomerSegmentBadge from '@/components/CustomerSegmentBadge';
import StatusBadge from '@/components/StatusBadge';
import { Phone, Mail, MessageCircle, Package, BarChart3, Heart, MapPin } from 'lucide-react';


export const metadata = {
  title: 'Customer Profile | Amma Ki Rasoi Admin'
};

export default async function CustomerProfilePage({ params }) {
  const resolvedParams = await params;
  const phone = decodeURIComponent(resolvedParams.phone);

  await dbConnect();

  const orders = await Order.find({ customerPhone: phone }).sort({ createdAt: -1 }).lean();
  const customerDoc = await Customer.findOne({ phone }).lean();

  if (orders.length === 0) {
    return (
      <div>
        <Link href="/customers" style={{ color: 'var(--primary-terracotta)', textDecoration: 'none' }}>← Back to Customers</Link>
        <div style={{ textAlign: 'center', padding: '80px', color: 'var(--text-muted)' }}>Customer not found.</div>
      </div>
    );
  }

  const customer = orders[0];
  const totalSpent = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const avgOrder = Math.round(totalSpent / orders.length);

  // Compute favourite products
  const productCounts = {};
  orders.forEach(order => {
    order.items?.forEach(item => {
      productCounts[item.productName] = (productCounts[item.productName] || 0) + (item.quantity || 1);
    });
  });
  const favProducts = Object.entries(productCounts).sort((a, b) => b[1] - a[1]).slice(0, 3);

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <Link href="/customers" style={{ color: 'var(--primary-terracotta)', textDecoration: 'none', fontWeight: '500' }}>← Back to Customers</Link>
      </div>

      {/* Header */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'var(--primary-terracotta)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', color: 'white', fontWeight: '700' }}>
              {customer.customerName?.charAt(0) || '?'}
            </div>
            <div>
              <h1 style={{ margin: '0 0 4px', fontFamily: 'var(--font-heading)', fontSize: '1.6rem' }}>{customer.customerName}</h1>
              <div className="text-muted" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Phone size={13} strokeWidth={2} /> {customer.customerPhone}</div>
              {customer.customerEmail && <div className="text-muted" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Mail size={13} strokeWidth={2} /> {customer.customerEmail}</div>}
              <div className="text-muted" style={{ marginTop: '4px' }}>Customer since {new Date(orders[orders.length - 1].createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <CustomerSegmentBadge totalOrders={orders.length} style={{ padding: '6px 16px', fontSize: '0.9rem', border: '1px solid currentColor' }} />
            <a href={`https://wa.me/${phone?.replace(/\D/g, '')}`} target="_blank" className="btn" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <MessageCircle size={14} strokeWidth={2} /> WhatsApp
            </a>
            <a href={`tel:${phone}`} className="btn" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Phone size={14} strokeWidth={2} /> Call
            </a>
            <Link href="/orders/new" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Package size={14} strokeWidth={2} /> New Order
            </Link>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '24px' }}>
        {/* Left: Stats + Favourites */}
        <div style={{ width: '280px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Stats */}
          <div className="card">
            <h2 className="section-title" style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '8px' }}><BarChart3 size={17} strokeWidth={2} /> Stats</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                { label: 'Total Orders', value: orders.length },
                { label: 'Total Spent', value: `₹${totalSpent.toLocaleString('en-IN')}` },
                { label: 'Avg Order Value', value: `₹${avgOrder}` },
                { label: 'Last Order', value: new Date(orders[0].createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid var(--border-cream)' }}>
                  <span className="text-muted" style={{ fontSize: '0.875rem' }}>{label}</span>
                  <span className="data-font" style={{ fontWeight: '700' }}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Favourite Products */}
          {favProducts.length > 0 && (
            <div className="card">
              <h2 className="section-title" style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '8px' }}><Heart size={17} strokeWidth={2} /> Favourites</h2>
              {favProducts.map(([name, count]) => (
                <div key={name} style={{ padding: '10px 0', borderBottom: '1px solid var(--border-cream)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>{name}</span>
                  <span className="data-font" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>×{count}</span>
                </div>
              ))}
            </div>
          )}

          {/* Address */}
          <div className="card">
            <h2 className="section-title" style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '8px' }}><MapPin size={17} strokeWidth={2} /> Address</h2>
            <div style={{ fontSize: '0.875rem', lineHeight: '1.7', color: 'var(--text-muted)' }}>
              {orders[0].shippingAddress || 'No address saved.'}
            </div>
          </div>

          <CustomerCrmEditor phone={phone} initialTags={customerDoc?.tags} initialNote={customerDoc?.internalNote} />
        </div>

        {/* Right: Order History */}
        <div style={{ flex: 1 }}>
          <div className="card">
            <h2 className="section-title" style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '8px' }}><Package size={17} strokeWidth={2} /> Order History ({orders.length})</h2>
            <table>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Date</th>
                  <th>Items</th>
                  <th>Amount</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order._id.toString()}>
                    <td className="data-font" style={{ fontWeight: '600' }}>{order.orderId}</td>
                    <td className="text-muted" style={{ fontSize: '0.875rem' }}>{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}</td>
                    <td className="text-muted">{order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''}</td>
                    <td className="data-font" style={{ fontWeight: '700' }}>₹{order.totalAmount}</td>
                    <td className="text-muted" style={{ fontSize: '0.8rem' }}>{order.paymentMethod}</td>
                    <td>
                      <StatusBadge status={order.status} />
                    </td>
                    <td>
                      <Link href={`/orders/${order._id.toString()}`} style={{ color: 'var(--primary-terracotta)', textDecoration: 'none', fontSize: '0.85rem', fontWeight: '600' }}>View →</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
