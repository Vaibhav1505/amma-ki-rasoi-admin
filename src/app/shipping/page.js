import dbConnect from '../../lib/mongodb';
import Order from '../../lib/models/Order';
import { isConfigured as isShipRocketConfigured } from '../../lib/shiprocket';
import Link from 'next/link';
import SchedulePickupButton from '@/components/SchedulePickupButton';
import RefreshTrackingButton from '@/components/RefreshTrackingButton';
import { Truck, AlertTriangle, Rocket, Printer, CheckCircle2, Coins, Circle } from 'lucide-react';

export const metadata = {
  title: 'Shipping & Logistics | Amma Ki Rasoi Admin'
};

const COURIERS = ['Delhivery', 'Shadowfax', 'Ekart', 'DTDC', 'Blue Dart'];

export default async function ShippingPage() {
  await dbConnect();

  const readyToShip = await Order.find({ status: 'packing' }).sort({ createdAt: -1 }).lean();
  const inTransit   = await Order.find({ status: 'shipped' }).sort({ createdAt: -1 }).lean();
  const shipRocketReady = isShipRocketConfigured();
  const readyToShipIds = readyToShip.map(o => o._id.toString()).join(',');

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h1 className="page-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}><Truck size={22} strokeWidth={2} /> Shipping & Logistics</h1>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {/* ShipRocket status banner */}
          {!shipRocketReady && (
            <div style={{ padding: '8px 16px', backgroundColor: '#FFFBEB', border: '1px solid #D4A017', borderRadius: '6px', fontSize: '0.8rem', color: '#92400E', display: 'flex', gap: '8px', alignItems: 'center' }}>
              <AlertTriangle size={14} strokeWidth={2} /> ShipRocket not connected —
              <Link href="/settings" style={{ color: 'var(--primary-terracotta)', fontWeight: '600' }}>Configure in Settings</Link>
            </div>
          )}
          {shipRocketReady && <SchedulePickupButton />}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid-4" style={{ marginBottom: '32px' }}>
        <div className="card">
          <div className="kpi-title">Ready to Ship</div>
          <div className="kpi-value">{readyToShip.length}</div>
          <div className="kpi-trend" style={{ color: readyToShip.length > 0 ? 'var(--danger-red)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px' }}>
            {readyToShip.length > 0 ? <><AlertTriangle size={13} strokeWidth={2} /> Needs pickup</> : <><CheckCircle2 size={13} strokeWidth={2} /> All clear</>}
          </div>
        </div>
        <div className="card">
          <div className="kpi-title">In Transit</div>
          <div className="kpi-value">{inTransit.length}</div>
          <div className="kpi-trend" style={{ color: 'var(--text-muted)' }}>With courier</div>
        </div>
        <div className="card">
          <div className="kpi-title">Total Shipments Today</div>
          <div className="kpi-value">{readyToShip.length + inTransit.length}</div>
        </div>
      </div>

      {/* ShipRocket Couriers */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 className="section-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}><Rocket size={17} strokeWidth={2} /> ShipRocket — Active Couriers</h2>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Auto-select: Best rate (when connected)</span>
        </div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {COURIERS.map(c => (
            <div key={c} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--border-cream)', backgroundColor: 'white', fontSize: '0.875rem', fontWeight: '500', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Circle size={8} strokeWidth={2} fill="currentColor" /> {c}
            </div>
          ))}
        </div>
      </div>

      {/* Ready to Ship */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 className="section-title" style={{ margin: 0 }}>Ready to Ship ({readyToShip.length})</h2>
          <Link
            href={readyToShipIds ? `/print/labels/bulk?ids=${readyToShipIds}` : '#'}
            className="btn"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', pointerEvents: readyToShipIds ? 'auto' : 'none', opacity: readyToShipIds ? 1 : 0.5 }}
          >
            <Printer size={14} strokeWidth={2} /> Print All Labels
          </Link>
        </div>
        <table>
          <thead>
            <tr>
              <th><input type="checkbox" /></th>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Destination</th>
              <th>Items</th>
              <th>Payment</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {readyToShip.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                  No orders ready to ship. Mark orders as "Packing" from the order detail page.
                </td>
              </tr>
            ) : (
              readyToShip.map(order => (
                <tr key={order._id.toString()}>
                  <td><input type="checkbox" /></td>
                  <td className="data-font" style={{ fontWeight: '700' }}>{order.orderId}</td>
                  <td>
                    <div style={{ fontWeight: '600' }}>{order.customerName}</div>
                    <div className="text-muted" style={{ fontSize: '0.75rem' }}>{order.customerPhone}</div>
                  </td>
                  <td className="text-muted" style={{ fontSize: '0.875rem', maxWidth: '180px' }}>
                    {order.shippingAddress?.split(',').slice(-2).join(',').trim() || '—'}
                  </td>
                  <td className="data-font">{order.items?.length || 0} items</td>
                  <td>
                    <span style={{ fontSize: '0.8rem', fontWeight: '600', color: order.paymentMethod === 'COD' ? 'var(--warning-gold)' : 'var(--success-green)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      {order.paymentMethod === 'COD' ? <><Coins size={13} strokeWidth={2} /> COD</> : <><CheckCircle2 size={13} strokeWidth={2} /> Prepaid</>}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <Link href={`/print/label/${order._id.toString()}`} className="btn" style={{ fontSize: '0.8rem', padding: '4px 10px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Printer size={12} strokeWidth={2} /> Label
                      </Link>
                      <Link href={`/orders/${order._id.toString()}`} className="btn" style={{ fontSize: '0.8rem', padding: '4px 10px' }}>View</Link>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* In Transit */}
      <div className="card">
        <h2 className="section-title" style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '8px' }}><Truck size={17} strokeWidth={2} /> In Transit ({inTransit.length})</h2>
        <table>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Courier</th>
              <th>AWB No.</th>
              <th>Expected</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {inTransit.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>No shipments in transit.</td>
              </tr>
            ) : (
              inTransit.map(order => (
                <tr key={order._id.toString()}>
                  <td className="data-font" style={{ fontWeight: '700' }}>{order.orderId}</td>
                  <td>
                    <div style={{ fontWeight: '600' }}>{order.customerName}</div>
                    <div className="text-muted" style={{ fontSize: '0.75rem' }}>{order.customerPhone}</div>
                  </td>
                  <td>{order.courierName || <span className="text-muted">—</span>}</td>
                  <td className="data-font">{order.awbNumber || <span className="text-muted">—</span>}</td>
                  <td className="text-muted">3-5 days</td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {order.trackingUrl && (
                        <a href={order.trackingUrl} target="_blank" className="btn" style={{ fontSize: '0.8rem', padding: '4px 10px' }}>Track →</a>
                      )}
                      {order.awbNumber && <RefreshTrackingButton orderId={order._id.toString()} />}
                      <Link href={`/orders/${order._id.toString()}`} className="btn" style={{ fontSize: '0.8rem', padding: '4px 10px' }}>View</Link>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
