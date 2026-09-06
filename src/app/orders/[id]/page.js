import { notFound } from 'next/navigation';
import dbConnect from '../../../lib/mongodb';
import Order from '../../../lib/models/Order';
import Link from 'next/link';
import StatusUpdateButton from '@/components/StatusUpdateButton';
import InternalNoteEditor from '@/components/InternalNoteEditor';

const STATUS_LABELS = {
  pending:    { label: 'Pending',      color: '#D4A017', bg: '#FFFBEB', emoji: '🟡' },
  confirmed:  { label: 'Confirmed',    color: '#2B6CB0', bg: '#EBF8FF', emoji: '🔵' },
  packing:    { label: 'Packing',      color: '#DD6B20', bg: '#FFF3EB', emoji: '🟠' },
  shipped:    { label: 'Shipped',      color: '#6B46C1', bg: '#FAF5FF', emoji: '🚚' },
  delivered:  { label: 'Delivered',    color: '#4A7C59', bg: '#F0FFF4', emoji: '✅' },
  cancelled:  { label: 'Cancelled',    color: '#A61C00', bg: '#FFF5F5', emoji: '❌' },
  return:     { label: 'Return',       color: '#4A4A4A', bg: '#F7F7F7', emoji: '↩️' },
  cod_pending:{ label: 'COD Pending',  color: '#B7791F', bg: '#FFFBEB', emoji: '💰' },
};

const TIMELINE_STEPS = ['pending', 'confirmed', 'packing', 'shipped', 'delivered'];

export default async function OrderDetailsPage({ params }) {
  const resolvedParams = await params;
  await dbConnect();

  let order;
  try {
    order = await Order.findById(resolvedParams.id).lean();
  } catch (e) {
    notFound();
  }
  if (!order) notFound();

  const statusInfo = STATUS_LABELS[order.status] || STATUS_LABELS.pending;
  const orderId = order._id.toString();
  
  const currentStepIdx = TIMELINE_STEPS.indexOf(order.status);

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <Link href="/orders" style={{ color: 'var(--primary-terracotta)', textDecoration: 'none', fontWeight: '500' }}>
          ← Back to Orders
        </Link>
      </div>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="page-title" style={{ margin: '0 0 8px' }}>Order {order.orderId}</h1>
          <div className="text-muted">Placed on {new Date(order.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</div>
          {!['shipped', 'delivered', 'cancelled', 'return'].includes(order.status) && (
            <Link href={`/orders/${orderId}/edit`} style={{ color: 'var(--primary-terracotta)', textDecoration: 'none', fontWeight: '600', fontSize: '0.875rem', display: 'inline-block', marginTop: '8px' }}>
              ✏️ Edit Order
            </Link>
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px' }}>
          {/* Current Status Badge */}
          <span style={{ padding: '6px 16px', borderRadius: '20px', fontWeight: '700', fontSize: '0.9rem', backgroundColor: statusInfo.bg, color: statusInfo.color, border: `1px solid ${statusInfo.color}` }}>
            {statusInfo.emoji} {statusInfo.label}
          </span>
          {/* Status Update Buttons */}
          <StatusUpdateButton orderId={orderId} currentStatus={order.status} />
        </div>
      </div>

      {/* Cancellation / Return Reason */}
      {['cancelled', 'return'].includes(order.status) && order.cancelReason && (
        <div className="card" style={{ marginBottom: '32px', borderLeft: `4px solid ${statusInfo.color}` }}>
          <div className="text-muted" style={{ fontSize: '0.8rem', marginBottom: '6px' }}>
            {order.status === 'cancelled' ? 'CANCELLATION REASON' : 'RETURN REASON'}
          </div>
          <div>{order.cancelReason}</div>
        </div>
      )}

      {/* Order Pipeline */}
      {!['cancelled', 'return', 'cod_pending'].includes(order.status) && (
        <div className="card" style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {TIMELINE_STEPS.map((step, idx) => {
              const info = STATUS_LABELS[step];
              const isDone = currentStepIdx > idx;
              const isCurrent = currentStepIdx === idx;
              return (
                <div key={step} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1.2rem',
                      backgroundColor: isDone ? 'var(--success-green)' : isCurrent ? info.color : '#eee',
                      color: (isDone || isCurrent) ? 'white' : '#999',
                      fontWeight: 'bold',
                      border: isCurrent ? `3px solid ${info.color}` : 'none',
                      transition: 'all 0.3s',
                    }}>
                      {isDone ? '✓' : info.emoji}
                    </div>
                    <div style={{ fontSize: '0.75rem', fontWeight: isCurrent ? '700' : '500', color: isCurrent ? info.color : isDone ? 'var(--success-green)' : 'var(--text-muted)' }}>
                      {info.label}
                    </div>
                  </div>
                  {idx < TIMELINE_STEPS.length - 1 && (
                    <div style={{ flex: 1, height: '3px', backgroundColor: isDone ? 'var(--success-green)' : '#eee', margin: '0 8px', marginBottom: '24px', transition: 'all 0.3s' }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '32px' }}>
        {/* Left Column */}
        <div style={{ flex: '2', display: 'flex', flexDirection: 'column', gap: '24px' }}>

          {/* Packing Checklist */}
          <div className="card">
            <h2 className="section-title" style={{ marginTop: 0 }}>📦 Packing Checklist</h2>
            <table style={{ border: 'none', boxShadow: 'none' }}>
              <thead>
                <tr>
                  <th style={{ width: '40px' }}>✔</th>
                  <th>Item</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, idx) => (
                  <tr key={idx}>
                    <td><input type="checkbox" style={{ width: '18px', height: '18px', cursor: 'pointer' }} /></td>
                    <td style={{ fontWeight: '500' }}>{item.productName}</td>
                    <td className="data-font">{item.quantity}</td>
                    <td className="data-font">₹{item.price}</td>
                    <td className="data-font" style={{ fontWeight: '600' }}>₹{item.price * item.quantity}</td>
                  </tr>
                ))}
                {/* Packing steps */}
                {['Bubble wrap all jars', 'Insert printed invoice inside box', 'Paste shipping label on box', 'Mark as Ready to Ship'].map((step, idx) => (
                  <tr key={`step-${idx}`} style={{ backgroundColor: 'var(--bg-cream, #FDF8F3)' }}>
                    <td><input type="checkbox" style={{ width: '18px', height: '18px', cursor: 'pointer' }} /></td>
                    <td colSpan={4} style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>{step}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Order Total */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-cream)' }}>
              <div style={{ width: '260px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span className="text-muted">Subtotal</span>
                  <span className="data-font">₹{order.totalAmount}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span className="text-muted">Shipping</span>
                  <span className="data-font">₹0</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', fontSize: '1.2rem', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border-cream)' }}>
                  <span>Total</span>
                  <span className="data-font">₹{order.totalAmount}</span>
                </div>
              </div>
            </div>

            {/* Quick Print Actions */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-cream)' }}>
              <Link href={`/print/invoice/${orderId}`} className="btn">🖨️ Print Invoice</Link>
              <Link href={`/print/label/${orderId}`} className="btn">📦 Print Shipping Label</Link>
            </div>
          </div>

          {/* Shipping Info */}
          <div className="card">
            <h2 className="section-title" style={{ marginTop: 0 }}>🚚 Shipping Info</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <div className="text-muted" style={{ fontSize: '0.8rem', marginBottom: '4px' }}>COURIER</div>
                <div style={{ fontWeight: '500' }}>{order.courierName || '—'}</div>
              </div>
              <div>
                <div className="text-muted" style={{ fontSize: '0.8rem', marginBottom: '4px' }}>AWB NUMBER</div>
                <div className="data-font" style={{ fontWeight: '500' }}>{order.awbNumber || '—'}</div>
              </div>
              <div>
                <div className="text-muted" style={{ fontSize: '0.8rem', marginBottom: '4px' }}>TRACKING LINK</div>
                <div style={{ fontWeight: '500' }}>{order.trackingUrl ? <a href={order.trackingUrl} target="_blank" style={{ color: 'var(--primary-terracotta)' }}>Track Package →</a> : '—'}</div>
              </div>
              <div>
                <div className="text-muted" style={{ fontSize: '0.8rem', marginBottom: '4px' }}>SOURCE</div>
                <div style={{ fontWeight: '500' }}>{order.orderSource || 'Website'}</div>
              </div>
            </div>
            <div style={{ marginTop: '16px' }}>
              <Link href="/shipping" className="btn btn-primary" style={{ fontSize: '0.875rem' }}>🚀 Create Shipment via ShipRocket</Link>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Customer Info */}
          <div className="card">
            <h2 className="section-title" style={{ marginTop: 0 }}>👤 Customer Info</h2>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontWeight: '700', fontSize: '1.1rem' }}>{order.customerName}</div>
              {order.customerPhone && <div className="text-muted" style={{ marginTop: '6px' }}>📞 {order.customerPhone}</div>}
              {order.customerEmail && <div className="text-muted" style={{ marginTop: '4px' }}>✉️ {order.customerEmail}</div>}
            </div>

            <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-cream)' }}>
              <div className="text-muted" style={{ fontSize: '0.8rem', marginBottom: '8px' }}>SHIPPING ADDRESS</div>
              <div style={{ lineHeight: '1.7' }}>{order.shippingAddress}</div>
            </div>

            <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-cream)', display: 'flex', gap: '8px' }}>
              <a href={`https://wa.me/${order.customerPhone?.replace(/\D/g, '')}`} target="_blank" className="btn" style={{ flex: 1, textAlign: 'center', fontSize: '0.85rem' }}>💬 WhatsApp</a>
              <a href={`tel:${order.customerPhone}`} className="btn" style={{ flex: 1, textAlign: 'center', fontSize: '0.85rem' }}>📞 Call</a>
            </div>
          </div>

          {/* Payment Info */}
          <div className="card">
            <h2 className="section-title" style={{ marginTop: 0 }}>💰 Payment Info</h2>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span className="text-muted">Method</span>
              <strong>{order.paymentMethod || '—'}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span className="text-muted">Status</span>
              <span style={{ fontWeight: '700', color: order.paymentStatus === 'Paid' ? 'var(--success-green)' : 'var(--warning-gold)' }}>
                {order.paymentStatus === 'Paid' ? '✅ Paid' : '⏳ ' + (order.paymentStatus || 'Pending')}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span className="text-muted">Amount</span>
              <strong className="data-font" style={{ fontSize: '1.2rem' }}>₹{order.totalAmount}</strong>
            </div>
          </div>

          {/* Notes */}
          <div className="card">
            <h2 className="section-title" style={{ marginTop: 0 }}>📝 Notes</h2>
            {order.customerNote ? (
              <div style={{ padding: '12px', backgroundColor: '#FFFBEB', borderRadius: '8px', borderLeft: '3px solid var(--warning-gold)', marginBottom: '12px', fontSize: '0.9rem', fontStyle: 'italic' }}>
                "{order.customerNote}"
                <div className="text-muted" style={{ fontSize: '0.75rem', marginTop: '4px', fontStyle: 'normal' }}>— Customer note</div>
              </div>
            ) : (
              <div className="text-muted" style={{ fontSize: '0.875rem', marginBottom: '12px' }}>No customer note.</div>
            )}
            <InternalNoteEditor orderId={orderId} initialNote={order.internalNote} />
          </div>
        </div>
      </div>
    </div>
  );
}
