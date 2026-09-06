import dbConnect from '../../../lib/mongodb';
import Order from '../../../lib/models/Order';
import Product from '../../../lib/models/Product';
import Link from 'next/link';
import CopyLowStockAlert from '@/components/CopyLowStockAlert';

export const metadata = {
  title: 'Reports & Analytics | Amma Ki Rasoi Admin'
};

export default async function ReportsPage() {
  await dbConnect();
  
  const orders = await Order.find().lean();
  const products = await Product.find().lean();
  
  // Aggregate sales by product
  const productSales = {};
  orders.forEach(order => {
    order.items.forEach(item => {
      if (!productSales[item.productName]) {
        productSales[item.productName] = 0;
      }
      productSales[item.productName] += item.quantity;
    });
  });

  const topProducts = Object.entries(productSales)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const lowStockProducts = products.filter(p => p.stock < 10);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h1 className="page-title" style={{ margin: 0 }}>📊 Reports & Analytics</h1>
        <div style={{ display: 'flex', gap: '12px' }}>
          <select className="btn" style={{ padding: '8px 16px', border: '1px solid var(--border-cream)' }}>
            <option>Last 30 Days</option>
            <option>This Year</option>
            <option>All Time</option>
          </select>
          <button className="btn btn-primary">Download PDF</button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '32px', marginBottom: '32px' }}>
        {/* Top Selling Products */}
        <div className="card" style={{ flex: '1' }}>
          <h2 className="section-title" style={{ marginTop: 0 }}>Top Selling Products</h2>
          <table style={{ border: 'none', boxShadow: 'none' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-cream)' }}>
                <th>Product Name</th>
                <th style={{ textAlign: 'right' }}>Units Sold</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.length === 0 ? (
                <tr>
                  <td colSpan="2" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                    No sales data yet.
                  </td>
                </tr>
              ) : (
                topProducts.map(([name, qty], idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--border-cream)' }}>
                    <td style={{ fontWeight: '500' }}>{name}</td>
                    <td className="data-font" style={{ textAlign: 'right', fontWeight: 'bold', color: 'var(--primary-terracotta)' }}>{qty}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Inventory Alerts */}
        <div className="card" style={{ flex: '1' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 className="section-title" style={{ margin: 0 }}>Low Stock Alerts</h2>
            <CopyLowStockAlert products={lowStockProducts} />
          </div>
          <table style={{ border: 'none', boxShadow: 'none' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-cream)' }}>
                <th>Product Name</th>
                <th style={{ textAlign: 'right' }}>Current Stock</th>
              </tr>
            </thead>
            <tbody>
              {lowStockProducts.length === 0 ? (
                <tr>
                  <td colSpan="2" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                    All stock levels are healthy.
                  </td>
                </tr>
              ) : (
                lowStockProducts.map((prod, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--border-cream)' }}>
                    <td style={{ fontWeight: '500' }}>{prod.name}</td>
                    <td className="data-font" style={{ textAlign: 'right', fontWeight: 'bold', color: prod.stock <= 0 ? 'var(--danger-red)' : 'var(--warning-yellow)' }}>
                      {prod.stock} units
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <h2 className="section-title" style={{ marginTop: 0 }}>Expense Tracker (Raw Materials)</h2>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
          <p className="text-muted">Track bulk purchases for ingredients, packaging, and logistics.</p>
          <button className="btn">+ Log Expense</button>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Category</th>
              <th>Description</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="data-font">12/07/2026</td>
              <td><span className="badge badge-packing">Ingredients</span></td>
              <td>Mustard Oil (15 Liters)</td>
              <td className="data-font" style={{ fontWeight: 'bold', color: 'var(--danger-red)' }}>-₹2,400</td>
            </tr>
            <tr>
              <td className="data-font">10/07/2026</td>
              <td><span className="badge badge-confirmed">Packaging</span></td>
              <td>Glass Jars (100 pcs)</td>
              <td className="data-font" style={{ fontWeight: 'bold', color: 'var(--danger-red)' }}>-₹1,500</td>
            </tr>
            <tr>
              <td className="data-font">05/07/2026</td>
              <td><span className="badge badge-shipped">Logistics</span></td>
              <td>Bubble wrap roll</td>
              <td className="data-font" style={{ fontWeight: 'bold', color: 'var(--danger-red)' }}>-₹450</td>
            </tr>
          </tbody>
        </table>
      </div>

    </div>
  );
}
