import dbConnect from '../../lib/mongodb';
import Order from '../../lib/models/Order';
import Link from 'next/link';

export const metadata = {
  title: 'Orders | Amma Ki Rasoi Admin'
};

const PAGE_SIZE = 20;

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export default async function OrdersPage({ searchParams }) {
  await dbConnect();

  const params = await searchParams;
  const statusFilter = params.status || 'All';
  const q = (params.q || '').trim();
  const page = Math.max(1, parseInt(params.page || '1', 10) || 1);

  const query = {};
  if (statusFilter !== 'All') query.status = statusFilter;
  if (q) {
    const rx = new RegExp(escapeRegex(q), 'i');
    query.$or = [{ orderId: rx }, { customerName: rx }, { customerPhone: rx }];
  }

  const total = await Order.countDocuments(query);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  const orders = await Order.find(query)
    .sort({ createdAt: -1 })
    .skip((currentPage - 1) * PAGE_SIZE)
    .limit(PAGE_SIZE)
    .lean();

  const statuses = ['All', 'pending', 'confirmed', 'packing', 'shipped', 'delivered', 'cancelled', 'return', 'cod_pending'];
  const statusLabel = (s) => s === 'cod_pending' ? 'COD Pending' : s.charAt(0).toUpperCase() + s.slice(1);

  // Builds a link that preserves the current filters while changing one param
  const linkFor = (overrides) => {
    const p = new URLSearchParams();
    const next = { status: statusFilter !== 'All' ? statusFilter : undefined, q: q || undefined, page: currentPage > 1 ? String(currentPage) : undefined, ...overrides };
    Object.entries(next).forEach(([k, v]) => { if (v) p.set(k, v); });
    const qs = p.toString();
    return `/orders${qs ? `?${qs}` : ''}`;
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h1 className="page-title" style={{ margin: 0 }}>Orders Management</h1>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Link href="/orders/bulk" className="btn">📋 Bulk Requests</Link>
          <Link href="/orders/new" className="btn btn-primary">+ Create Manual Order</Link>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            {statuses.map(status => (
              <Link
                key={status}
                href={linkFor({ status: status !== 'All' ? status : undefined, page: undefined })}
                style={{
                  padding: '8px 16px',
                  borderRadius: '20px',
                  textDecoration: 'none',
                  fontWeight: '600',
                  fontSize: '0.875rem',
                  backgroundColor: statusFilter === status ? 'var(--primary-terracotta)' : '#f0f0f0',
                  color: statusFilter === status ? 'white' : 'var(--text-charcoal)',
                }}
              >
                {status === 'All' ? 'All' : statusLabel(status)}
              </Link>
            ))}
          </div>

          <form action="/orders" method="get" style={{ display: 'flex', gap: '8px' }}>
            {statusFilter !== 'All' && <input type="hidden" name="status" value={statusFilter} />}
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="Search order ID, name, or phone..."
              style={{ padding: '8px 14px', border: '1px solid var(--border-cream)', borderRadius: '20px', fontSize: '0.875rem', minWidth: '260px' }}
            />
            <button type="submit" className="btn">🔍 Search</button>
            {q && <Link href={linkFor({ q: undefined, page: undefined })} className="btn">✕ Clear</Link>}
          </form>
        </div>
      </div>

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Date</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Total</th>
              <th>Payment</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '32px' }}>
                  <div className="text-muted">No orders found.</div>
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order._id.toString()}>
                  <td className="data-font" style={{ fontWeight: '600' }}>{order.orderId}</td>
                  <td className="data-font">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div style={{ fontWeight: '600' }}>{order.customerName}</div>
                    <div className="text-muted" style={{ fontSize: '0.75rem' }}>{order.customerPhone}</div>
                  </td>
                  <td>{order.items.reduce((acc, item) => acc + item.quantity, 0)} items</td>
                  <td className="data-font" style={{ fontWeight: '600' }}>₹{order.totalAmount}</td>
                  <td>
                    <span className="text-muted" style={{ fontSize: '0.875rem' }}>{order.paymentMethod}</span>
                    <div style={{ fontSize: '0.75rem', color: order.paymentStatus === 'Paid' ? 'var(--success-green)' : 'var(--danger-red)' }}>
                      {order.paymentStatus}
                    </div>
                  </td>
                  <td>
                    <span className={`badge badge-${order.status}`}>
                      {statusLabel(order.status)}
                    </span>
                  </td>
                  <td>
                    <Link href={`/orders/${order._id}`} className="btn">View Details</Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
            <div className="text-muted" style={{ fontSize: '0.875rem' }}>
              Page {currentPage} of {totalPages} · {total} order{total !== 1 ? 's' : ''}
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Link
                href={linkFor({ page: String(currentPage - 1) })}
                className="btn"
                style={{ pointerEvents: currentPage <= 1 ? 'none' : 'auto', opacity: currentPage <= 1 ? 0.4 : 1 }}
              >
                ← Prev
              </Link>
              <Link
                href={linkFor({ page: String(currentPage + 1) })}
                className="btn"
                style={{ pointerEvents: currentPage >= totalPages ? 'none' : 'auto', opacity: currentPage >= totalPages ? 0.4 : 1 }}
              >
                Next →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
