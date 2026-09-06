import dbConnect from '../../../lib/mongodb';
import Order from '../../../lib/models/Order';
import Link from 'next/link';

export const metadata = {
  title: 'Customers | Amma Ki Rasoi Admin'
};

export default async function CustomersPage() {
  await dbConnect();
  
  // Aggregate orders to create a "Customer CRM" view
  const orders = await Order.find().lean();
  
  const customerMap = new Map();
  
  orders.forEach(order => {
    // We use phone as the unique identifier for a customer
    const phone = order.customerPhone;
    if (!customerMap.has(phone)) {
      customerMap.set(phone, {
        name: order.customerName,
        phone: phone,
        email: order.customerEmail || '-',
        address: order.shippingAddress,
        totalOrders: 0,
        totalSpent: 0,
        firstOrderDate: order.createdAt,
        lastOrderDate: order.createdAt
      });
    }
    
    const cust = customerMap.get(phone);
    cust.totalOrders += 1;
    cust.totalSpent += order.totalAmount;
    
    if (new Date(order.createdAt) < new Date(cust.firstOrderDate)) {
      cust.firstOrderDate = order.createdAt;
    }
    if (new Date(order.createdAt) > new Date(cust.lastOrderDate)) {
      cust.lastOrderDate = order.createdAt;
    }
  });

  const customers = Array.from(customerMap.values()).sort((a, b) => b.totalSpent - a.totalSpent);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h1 className="page-title" style={{ margin: 0 }}>👥 Customers Rolodex</h1>
        <button className="btn btn-primary">Export CSV</button>
      </div>

      <div className="grid-4" style={{ marginBottom: '32px' }}>
        <div className="card">
          <div className="kpi-title">Total Customers</div>
          <div className="kpi-value">{customers.length}</div>
        </div>
        <div className="card">
          <div className="kpi-title">Repeat Customers</div>
          <div className="kpi-value">{customers.filter(c => c.totalOrders > 1).length}</div>
        </div>
        <div className="card">
          <div className="kpi-title">Avg Lifetime Value</div>
          <div className="kpi-value">
            ₹{customers.length > 0 ? Math.round(customers.reduce((sum, c) => sum + c.totalSpent, 0) / customers.length) : 0}
          </div>
        </div>
      </div>

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Customer</th>
              <th>Contact</th>
              <th>Segment</th>
              <th>Orders</th>
              <th>Lifetime Value</th>
              <th>Last Order</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                  No customers yet. Orders will create customer profiles automatically.
                </td>
              </tr>
            ) : (
              customers.map((cust, idx) => {
                const segment = cust.totalOrders >= 5
                  ? { label: '⭐ VIP', color: 'var(--warning-gold)', bg: '#FFFBEB' }
                  : cust.totalOrders >= 2
                  ? { label: '🔁 Repeat', color: '#2B6CB0', bg: '#EBF8FF' }
                  : { label: '🆕 New', color: '#4A7C59', bg: '#F0FFF4' };
                return (
                  <tr key={idx}>
                    <td>
                      <Link href={`/customers/${encodeURIComponent(cust.phone)}`} style={{ fontWeight: '600', color: 'var(--text-charcoal)', textDecoration: 'none' }}>
                        {cust.name}
                      </Link>
                    </td>
                    <td>
                      <div className="data-font" style={{ fontSize: '0.875rem' }}>{cust.phone}</div>
                      {cust.email !== '-' && <div className="text-muted" style={{ fontSize: '0.75rem' }}>{cust.email}</div>}
                    </td>
                    <td>
                      <span style={{ padding: '3px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '700', backgroundColor: segment.bg, color: segment.color }}>
                        {segment.label}
                      </span>
                    </td>
                    <td className="data-font" style={{ fontWeight: '700', textAlign: 'center' }}>{cust.totalOrders}</td>
                    <td className="data-font" style={{ fontWeight: '700', color: 'var(--primary-terracotta)' }}>₹{cust.totalSpent.toLocaleString('en-IN')}</td>
                    <td className="text-muted" style={{ fontSize: '0.875rem' }}>{new Date(cust.lastOrderDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <Link href={`/customers/${encodeURIComponent(cust.phone)}`} className="btn" style={{ padding: '4px 10px', fontSize: '0.8rem' }}>View</Link>
                        <a href={`https://wa.me/${cust.phone?.replace(/\D/g, '')}`} target="_blank" className="btn" style={{ padding: '4px 10px', fontSize: '0.8rem' }}>💬</a>
                        <a href={`tel:${cust.phone}`} className="btn" style={{ padding: '4px 10px', fontSize: '0.8rem' }}>📞</a>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
