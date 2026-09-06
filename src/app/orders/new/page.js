'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewOrderPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.ok ? res.json() : [])
      .then(setProducts)
      .catch(() => {});
  }, []);

  const [form, setForm] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    shippingAddress: '',
    orderSource: 'WhatsApp',
    paymentMethod: 'UPI',
    paymentStatus: 'Paid',
    customerNote: '',
  });

  const [items, setItems] = useState([
    { product: '', productName: '', quantity: 1, price: 0 }
  ]);

  const handleFormChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleItemChange = (idx, field, value) => {
    setItems(prev => prev.map((item, i) => i === idx ? { ...item, [field]: field === 'quantity' || field === 'price' ? Number(value) : value } : item));
  };

  const handleProductSelect = (idx, productId) => {
    const product = products.find(p => p._id === productId);
    setItems(prev => prev.map((item, i) => {
      if (i !== idx) return item;
      if (!product) return { ...item, product: '', productName: '' };
      return { ...item, product: product._id, productName: product.name, price: product.price };
    }));
  };

  const addItem = () => setItems(prev => [...prev, { product: '', productName: '', quantity: 1, price: 0 }]);
  const removeItem = (idx) => setItems(prev => prev.filter((_, i) => i !== idx));

  const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        ...form,
        items: items.map(({ product, productName, quantity, price }) => ({
          ...(product ? { product } : {}),
          productName, quantity, price
        })),
        totalAmount,
        status: 'pending',
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create order');
      }

      const order = await res.json();
      router.push(`/orders/${order._id}`);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const inputStyle = { width: '100%', padding: '10px 12px', border: '1px solid var(--border-cream)', borderRadius: '6px', fontFamily: 'inherit', fontSize: '0.9rem' };
  const labelStyle = { display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <Link href="/orders" style={{ color: 'var(--primary-terracotta)', textDecoration: 'none', fontWeight: '500' }}>← Back to Orders</Link>
      </div>
      <h1 className="page-title" style={{ marginBottom: '32px' }}>Create New Order</h1>

      <form onSubmit={handleSubmit}>
        {error && <div style={{ padding: '12px', backgroundColor: '#FEE2E2', color: 'var(--danger-red)', marginBottom: '24px', borderRadius: '6px' }}>{error}</div>}

        <div style={{ display: 'flex', gap: '32px' }}>
          {/* Left: Customer + Items */}
          <div style={{ flex: '2', display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {/* Customer Details */}
            <div className="card">
              <h2 className="section-title" style={{ marginTop: 0 }}>👤 Customer Details</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div>
                  <label style={labelStyle}>Full Name *</label>
                  <input required name="customerName" value={form.customerName} onChange={handleFormChange} style={inputStyle} placeholder="e.g. Meena Devi" />
                </div>
                <div>
                  <label style={labelStyle}>Phone *</label>
                  <input required name="customerPhone" value={form.customerPhone} onChange={handleFormChange} style={inputStyle} placeholder="+91 98765 43210" />
                </div>
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Email (Optional)</label>
                <input name="customerEmail" value={form.customerEmail} onChange={handleFormChange} style={inputStyle} placeholder="customer@email.com" />
              </div>
              <div>
                <label style={labelStyle}>Shipping Address *</label>
                <textarea required name="shippingAddress" value={form.shippingAddress} onChange={handleFormChange} rows="3" style={{ ...inputStyle, resize: 'vertical' }} placeholder="Full address with city, state, pincode..." />
              </div>
            </div>

            {/* Order Items */}
            <div className="card">
              <h2 className="section-title" style={{ marginTop: 0 }}>📦 Order Items</h2>
              <table style={{ border: 'none', boxShadow: 'none', marginBottom: '16px' }}>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Description</th>
                    <th style={{ width: '70px' }}>Qty</th>
                    <th style={{ width: '110px' }}>Unit Price (₹)</th>
                    <th style={{ width: '90px' }}>Total</th>
                    <th style={{ width: '40px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => {
                    const linkedProduct = products.find(p => p._id === item.product);
                    return (
                      <tr key={idx}>
                        <td>
                          <select
                            value={item.product}
                            onChange={(e) => handleProductSelect(idx, e.target.value)}
                            style={{ ...inputStyle, padding: '8px 10px' }}
                          >
                            <option value="">Custom item</option>
                            {products.map(p => (
                              <option key={p._id} value={p._id} disabled={p.stock <= 0}>
                                {p.name} ({p.weight}) — ₹{p.price}{p.stock <= 0 ? ' — OUT OF STOCK' : p.stock < 10 ? ` — ${p.stock} left` : ''}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <input
                            required
                            value={item.productName}
                            onChange={(e) => handleItemChange(idx, 'productName', e.target.value)}
                            style={{ ...inputStyle, padding: '8px 10px' }}
                            placeholder="e.g. Aam Ka Achaar 500g"
                          />
                        </td>
                        <td>
                          <input
                            type="number" min="1"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                            style={{ ...inputStyle, padding: '8px 10px' }}
                          />
                          {linkedProduct && item.quantity > linkedProduct.stock && (
                            <div style={{ fontSize: '0.7rem', color: 'var(--danger-red)', marginTop: '4px' }}>Only {linkedProduct.stock} in stock</div>
                          )}
                        </td>
                        <td>
                          <input
                            type="number" min="0"
                            value={item.price}
                            onChange={(e) => handleItemChange(idx, 'price', e.target.value)}
                            style={{ ...inputStyle, padding: '8px 10px' }}
                          />
                        </td>
                        <td className="data-font" style={{ fontWeight: '600' }}>₹{item.quantity * item.price}</td>
                        <td>
                          {items.length > 1 && (
                            <button type="button" onClick={() => removeItem(idx)} style={{ background: 'none', border: 'none', color: 'var(--danger-red)', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              <button type="button" onClick={addItem} className="btn" style={{ marginBottom: '16px' }}>+ Add Item</button>

              <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '16px', borderTop: '1px solid var(--border-cream)' }}>
                <div style={{ width: '240px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', fontSize: '1.2rem' }}>
                    <span>Total</span>
                    <span className="data-font" style={{ color: 'var(--primary-terracotta)' }}>₹{totalAmount}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Order Meta */}
          <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="card">
              <h2 className="section-title" style={{ marginTop: 0 }}>📋 Order Details</h2>
              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Order Source</label>
                <select name="orderSource" value={form.orderSource} onChange={handleFormChange} style={inputStyle}>
                  <option>WhatsApp</option>
                  <option>Website</option>
                  <option>Phone</option>
                  <option>Walk-in</option>
                  <option>Instagram</option>
                </select>
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Payment Method</label>
                <select name="paymentMethod" value={form.paymentMethod} onChange={handleFormChange} style={inputStyle}>
                  <option value="UPI">UPI</option>
                  <option value="COD">Cash on Delivery</option>
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                </select>
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Payment Status</label>
                <select name="paymentStatus" value={form.paymentStatus} onChange={handleFormChange} style={inputStyle}>
                  <option value="Paid">Paid</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Customer Note</label>
                <textarea name="customerNote" value={form.customerNote} onChange={handleFormChange} rows="3" style={{ ...inputStyle, resize: 'vertical' }} placeholder="Any special instructions..." />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', padding: '14px', fontSize: '1rem' }}>
              {loading ? 'Creating Order...' : '✓ Create Order'}
            </button>
            <Link href="/orders" className="btn" style={{ width: '100%', padding: '12px', textAlign: 'center' }}>Cancel</Link>
          </div>
        </div>
      </form>
    </div>
  );
}
