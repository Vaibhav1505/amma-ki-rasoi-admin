import dbConnect from '../../../lib/mongodb';
import Order from '../../../lib/models/Order';
import Customer from '../../../lib/models/Customer';
import { normalizePhone } from '../../../lib/customers';
import Link from 'next/link';
import MergeDuplicateCustomers from '@/components/MergeDuplicateCustomers';

export const metadata = {
  title: 'Customers | Amma Ki Rasoi Admin'
};

export default async function CustomersPage() {
  await dbConnect();

  // Aggregate orders to create a "Customer CRM" view
  const orders = await Order.find().lean();
  const customerDocs = await Customer.find().lean();
  const tagsByPhone = new Map(customerDocs.map(c => [c.phone, c.tags || []]));

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

  // Group by normalized phone to surface likely duplicates (same person,
  // differently formatted number across orders)
  const byNormalized = new Map();
  customers.forEach(c => {
    const key = normalizePhone(c.phone);
    if (!key) return;
    if (!byNormalized.has(key)) byNormalized.set(key, []);
    byNormalized.get(key).push(c);
  });
  const duplicateGroups = Array.from(byNormalized.values()).filter(g => g.length > 1);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h1 className="page-title" style={{ margin: 0 }}>👥 Customers Rolodex</h1>
        <a href="/api/customers/export" className="btn btn-primary">Export CSV</a>
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

      {duplicateGroups.length > 0 && (
        <div className="card" style={{ marginBottom: '24px' }}>
          <h2 className="section-title" style={{ marginTop: 0 }}>⚠️ Possible Duplicate Customers</h2>
          <p className="text-muted" style={{ fontSize: '0.875rem', marginBottom: '16px' }}>
            These phone numbers look like the same person, formatted differently across orders.
          </p>
          {duplicateGroups.map((group, idx) => (
            <MergeDuplicateCustomers key={idx} candidates={group} />
          ))}
        </div>
      )}

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Customer</th>
              <th>Contact</th>
              <th>Segment</th>
              <th>Tags</th>
              <th>Orders</th>
              <th>Lifetime Value</th>
              <th>Last Order</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
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
                const tags = tagsByPhone.get(cust.phone) || [];
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
                    <td>
                      {tags.length === 0 ? (
                        <span className="text-muted" style={{ fontSize: '0.75rem' }}>—</span>
                      ) : (
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          {tags.map(t => (
                            <span key={t} style={{ padding: '2px 8px', borderRadius: '10px', fontSize: '0.7rem', fontWeight: '700', backgroundColor: 'rgba(193,68,14,0.1)', color: 'var(--primary-terracotta)' }}>{t}</span>
                          ))}
                        </div>
                      )}
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
