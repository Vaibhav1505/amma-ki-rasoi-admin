import dbConnect from '../../../lib/mongodb';
import Order from '../../../lib/models/Order';
import Link from 'next/link';

export const metadata = {
  title: 'Finance & Revenue | Amma Ki Rasoi Admin'
};

export default async function FinancePage() {
  await dbConnect();
  
  const orders = await Order.find().lean();
  
  let totalRevenue = 0;
  let totalCOD = 0;
  let totalPrepaid = 0;
  let pendingCOD = 0;
  
  orders.forEach(order => {
    totalRevenue += order.totalAmount;
    if (order.paymentMethod === 'COD') {
      totalCOD += order.totalAmount;
      if (order.paymentStatus === 'Pending') {
        pendingCOD += order.totalAmount;
      }
    } else {
      totalPrepaid += order.totalAmount;
    }
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h1 className="page-title" style={{ margin: 0 }}>💰 Financial Overview</h1>
        <button className="btn btn-primary">Generate Tax Report</button>
      </div>

      <div className="grid-4" style={{ marginBottom: '32px' }}>
        <div className="card" style={{ borderLeft: '4px solid var(--success-green)' }}>
          <div className="kpi-title">Total Revenue</div>
          <div className="kpi-value" style={{ color: 'var(--success-green)' }}>₹{totalRevenue.toFixed(2)}</div>
          <div className="kpi-trend">All Time</div>
        </div>
        
        <div className="card">
          <div className="kpi-title">Prepaid Revenue</div>
          <div className="kpi-value">₹{totalPrepaid.toFixed(2)}</div>
          <div className="kpi-trend">Already collected</div>
        </div>
        
        <div className="card">
          <div className="kpi-title">COD Revenue</div>
          <div className="kpi-value">₹{totalCOD.toFixed(2)}</div>
          <div className="kpi-trend">Cash on Delivery</div>
        </div>
        
        <div className="card" style={{ borderLeft: '4px solid var(--danger-red)', backgroundColor: pendingCOD > 0 ? '#fff5f5' : 'white' }}>
          <div className="kpi-title">Pending COD Collection</div>
          <div className="kpi-value" style={{ color: 'var(--danger-red)' }}>₹{pendingCOD.toFixed(2)}</div>
          <div className="kpi-trend">To be collected by courier</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '32px' }}>
        {/* Pending Collections Table */}
        <div className="card" style={{ flex: '1' }}>
          <h2 className="section-title" style={{ marginTop: 0 }}>Pending COD Collections</h2>
          
          <table style={{ border: 'none', boxShadow: 'none' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-cream)' }}>
                <th>Order ID</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.filter(o => o.paymentMethod === 'COD' && o.paymentStatus === 'Pending').length === 0 ? (
                <tr>
                  <td colSpan="3" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                    No pending collections.
                  </td>
                </tr>
              ) : (
                orders.filter(o => o.paymentMethod === 'COD' && o.paymentStatus === 'Pending').map((order, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--border-cream)' }}>
                    <td className="data-font" style={{ fontWeight: '600' }}>
                      <Link href={`/orders/${order._id}`} style={{ color: 'var(--primary-terracotta)' }}>{order.orderId}</Link>
                    </td>
                    <td className="data-font" style={{ fontWeight: 'bold' }}>₹{order.totalAmount}</td>
                    <td><span className={`badge badge-${order.status}`}>{order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Quick Insights Placeholder */}
        <div className="card" style={{ flex: '1', backgroundColor: 'var(--bg-cream)' }}>
           <h2 className="section-title" style={{ marginTop: 0 }}>Quick Insights</h2>
           <ul style={{ paddingLeft: '20px', lineHeight: '1.8' }}>
             <li><strong>Average Order Value (AOV):</strong> ₹{orders.length > 0 ? (totalRevenue / orders.length).toFixed(2) : 0}</li>
             <li><strong>COD vs Prepaid Ratio:</strong> {totalRevenue > 0 ? Math.round((totalCOD / totalRevenue) * 100) : 0}% COD</li>
             <li><strong>Best Selling Price Point:</strong> ₹300 - ₹500 range</li>
           </ul>
        </div>
      </div>
    </div>
  );
}
