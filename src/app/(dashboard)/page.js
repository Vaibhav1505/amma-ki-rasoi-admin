import dbConnect from '../../lib/mongodb';
import Order from '../../lib/models/Order';
import Product from '../../lib/models/Product';
import Link from 'next/link';
import StatusBadge from '@/components/StatusBadge';
import { Package, Truck, IndianRupee, AlertTriangle, Zap, CheckCircle2, Plus, Printer, Megaphone } from 'lucide-react';
import { formatKg } from '../../lib/weight';
import { LOW_STOCK_THRESHOLD_GRAMS } from '../../lib/inventory';

export const metadata = {
  title: 'Dashboard | Amma Ki Rasoi Admin'
};

const PIPELINE_STATUSES = ['pending', 'confirmed', 'packing', 'shipped', 'delivered'];
const TO_SHIP_STATUSES = ['confirmed', 'packing'];
const OVERDUE_MS = 2 * 24 * 60 * 60 * 1000; // 2 days

export default async function Home() {
  await dbConnect();

  const orders = await Order.find().sort({ createdAt: -1 }).lean();
  const products = await Product.find().sort({ stockGrams: 1 }).lean();

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const overdueBefore = new Date(Date.now() - OVERDUE_MS);

  const ordersToday = orders.filter(o => new Date(o.createdAt) >= todayStart);
  const todaysRevenue = ordersToday.reduce((sum, o) => sum + o.totalAmount, 0);

  const toShipOrders = orders.filter(o => TO_SHIP_STATUSES.includes(o.status));
  const overdueOrders = toShipOrders.filter(o => new Date(o.createdAt) < overdueBefore);

  const lowStockProducts = products.filter(p => (p.stockGrams ?? 0) < LOW_STOCK_THRESHOLD_GRAMS);

  const pipelineCounts = Object.fromEntries(
    PIPELINE_STATUSES.map(s => [s, orders.filter(o => o.status === s).length])
  );

  const recentOrders = orders.slice(0, 5);

  // Build the "needs attention" queue from real data
  const oldestOverdue = overdueOrders[overdueOrders.length - 1]; // oldest first since orders are sorted desc
  const readyToPack = [...orders]
    .filter(o => o.status === 'confirmed' && o.paymentStatus === 'Paid')
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))[0];
  const packingCount = orders.filter(o => o.status === 'packing').length;
  const lowestStockProduct = lowStockProducts[0];
  const lowestStockProductStock = lowestStockProduct?.stockGrams ?? 0;

  const attentionItems = [];
  if (oldestOverdue) {
    const daysAgo = Math.floor((Date.now() - new Date(oldestOverdue.createdAt)) / (24 * 60 * 60 * 1000));
    attentionItems.push({
      key: 'overdue',
      color: 'var(--danger-red)',
      title: <><strong style={{ color: 'var(--danger-red)' }}>Order {oldestOverdue.orderId}</strong> — {oldestOverdue.customerName} — {oldestOverdue.paymentMethod} ₹{oldestOverdue.totalAmount} — OVERDUE</>,
      subtitle: `Ordered ${daysAgo} day${daysAgo !== 1 ? 's' : ''} ago. Not yet shipped.`,
      actions: (
        <>
          <Link href={`/orders/${oldestOverdue._id}`} className="btn">View Order</Link>
          <a href={`tel:${oldestOverdue.customerPhone}`} className="btn">Call</a>
        </>
      ),
    });
  }
  if (readyToPack) {
    attentionItems.push({
      key: 'ready-to-pack',
      color: 'var(--warning-gold)',
      title: <><strong style={{ color: 'var(--warning-gold)' }}>Order {readyToPack.orderId}</strong> — {readyToPack.customerName} — {readyToPack.paymentMethod} ₹{readyToPack.totalAmount} — PAID</>,
      subtitle: 'Payment confirmed. Ready to pack.',
      actions: <Link href={`/orders/${readyToPack._id}`} className="btn btn-primary">Start Packing</Link>,
    });
  }
  if (lowestStockProduct) {
    attentionItems.push({
      key: 'low-stock',
      color: 'var(--primary-terracotta)',
      title: <><strong style={{ color: 'var(--primary-terracotta)' }}>{lowestStockProduct.name}</strong> — Only {formatKg(lowestStockProductStock)}kg left in stock</>,
      subtitle: lowestStockProductStock === 0 ? 'Out of stock — restock as soon as possible.' : 'Running low — consider restocking soon.',
      actions: <Link href={`/products/${lowestStockProduct._id}/edit`} className="btn">Update Stock</Link>,
    });
  }
  if (packingCount > 0) {
    attentionItems.push({
      key: 'ready-to-ship',
      color: '#6B46C1',
      title: <><strong style={{ color: '#6B46C1' }}>{packingCount} order{packingCount !== 1 ? 's' : ''} ready to ship</strong></>,
      subtitle: 'Packed and waiting for courier pickup.',
      actions: (
        <>
          <Link href="/print" className="btn">Print Labels</Link>
          <Link href="/shipping" className="btn">View</Link>
        </>
      ),
    });
  }

  return (
    <div>
      {/* TODAY AT A GLANCE - Top KPI Cards */}
      <div className="grid-4" style={{ marginBottom: '32px' }}>
        <div className="card">
          <div className="kpi-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Package size={14} strokeWidth={2} /> New Orders Today</div>
          <div className="kpi-value">{ordersToday.length}</div>
          <div className="kpi-trend">since midnight</div>
        </div>
        <div className="card">
          <div className="kpi-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Truck size={14} strokeWidth={2} /> To Ship</div>
          <div className="kpi-value">{toShipOrders.length}</div>
          <div className="kpi-trend" style={{ color: overdueOrders.length > 0 ? 'var(--danger-red)' : 'var(--text-muted)' }}>
            {overdueOrders.length > 0 ? `${overdueOrders.length} overdue` : 'all on track'}
          </div>
        </div>
        <div className="card">
          <div className="kpi-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><IndianRupee size={14} strokeWidth={2} /> Today's Rev</div>
          <div className="kpi-value">₹{todaysRevenue.toLocaleString('en-IN')}</div>
          <div className="kpi-trend">{ordersToday.length} order{ordersToday.length !== 1 ? 's' : ''}</div>
        </div>
        <div className="card">
          <div className="kpi-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><AlertTriangle size={14} strokeWidth={2} /> Low Stock</div>
          <div className="kpi-value">{lowStockProducts.length} item{lowStockProducts.length !== 1 ? 's' : ''}</div>
          <Link href="/products" className="kpi-trend" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>View →</Link>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '32px' }}>
        {/* Main Column */}
        <div style={{ flex: '2' }}>
          {/* ACTION REQUIRED - Priority Queue */}
          <div className="card" style={{ marginBottom: '32px' }}>
            <h2 className="section-title" style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Zap size={18} strokeWidth={2} /> Needs Your Attention Right Now
            </h2>
            {attentionItems.length === 0 ? (
              <div className="text-muted" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={16} strokeWidth={2} /> All caught up — nothing urgent right now.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {attentionItems.map((item, idx) => (
                  <div key={item.key}>
                    <div style={{ borderLeft: `4px solid ${item.color}`, paddingLeft: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                      <div>
                        {item.title}
                        <div className="text-muted" style={{ fontSize: '0.875rem', marginTop: '4px' }}>{item.subtitle}</div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>{item.actions}</div>
                    </div>
                    {idx < attentionItems.length - 1 && <hr style={{ border: 'none', borderTop: '1px solid var(--border-cream)', marginTop: '16px' }} />}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* RECENT ORDERS TABLE */}
          <h2 className="section-title">Recent Orders</h2>
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '32px' }}>
                    <div className="text-muted">No orders yet.</div>
                  </td>
                </tr>
              ) : (
                recentOrders.map(order => (
                  <tr key={order._id.toString()}>
                    <td className="data-font">{order.orderId}</td>
                    <td>{order.customerName}</td>
                    <td>{order.items.reduce((acc, i) => acc + i.quantity, 0)} items</td>
                    <td className="data-font">₹{order.totalAmount}</td>
                    <td><StatusBadge status={order.status} /></td>
                    <td><Link href={`/orders/${order._id}`} className="btn">View →</Link></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <div style={{ textAlign: 'right', marginTop: '16px' }}>
            <Link href="/orders" style={{ color: 'var(--primary-terracotta)', fontWeight: '600', textDecoration: 'none' }}>View All Orders →</Link>
          </div>
        </div>

        {/* Sidebar Column */}
        <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {/* ORDER PIPELINE - Visual Flow */}
          <div className="card">
            <h2 className="section-title" style={{ marginTop: 0 }}>Order Pipeline</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {PIPELINE_STATUSES.map(status => (
                <div key={status} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <StatusBadge status={status} style={{ width: '100px', justifyContent: 'center' }} />
                  <strong className="data-font" style={{ fontSize: '1.25rem' }}>{pipelineCounts[status]}</strong>
                </div>
              ))}
            </div>
          </div>

          {/* QUICK ACTIONS */}
          <div className="card">
            <h2 className="section-title" style={{ marginTop: 0 }}>Quick Actions</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Link href="/orders/new" className="btn btn-primary" style={{ textAlign: 'center', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <Plus size={16} strokeWidth={2} /> New Order
              </Link>
              <Link href="/print" className="btn" style={{ textAlign: 'center', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <Printer size={16} strokeWidth={2} /> Print Labels
              </Link>
              <Link href="/products" className="btn" style={{ textAlign: 'center', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <Package size={16} strokeWidth={2} /> Update Stock
              </Link>
              <Link href="/marketing" className="btn" style={{ textAlign: 'center', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <Megaphone size={16} strokeWidth={2} /> Send Broadcast
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
