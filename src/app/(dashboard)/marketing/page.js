'use client';

import { useState } from 'react';
import Link from 'next/link';

const TEMPLATES = [
  {
    id: 'order_confirmed',
    label: '✅ Order Confirmation',
    description: 'Send to customers after their order is placed',
    preview: `🏺 *Amma Ki Rasoi*\n\n✅ *Order Confirmed!*\nOrder ID: *#AKR-XXXX*\n\n📦 *Items:*\n• Aam Ka Achaar 500g × 1 = ₹380\n\n💰 *Total: ₹380*\nPayment: UPI (Paid)\n\nWe'll notify you once your order is packed and shipped.\nThank you! 🙏`,
  },
  {
    id: 'order_shipped',
    label: '🚚 Order Shipped',
    description: 'Send when the order is handed to courier',
    preview: `🏺 *Amma Ki Rasoi*\n\n🚚 *Your Order is on its way!*\nOrder ID: *#AKR-XXXX*\n\n📦 Courier: Delhivery\n🔖 AWB: DL89XXXXX\n\nExpected delivery in 3-5 business days.\nThank you for your patience! 🙏`,
  },
  {
    id: 'order_delivered',
    label: '🎉 Delivered — Request Review',
    description: 'Send after delivery to ask for a Google review',
    preview: `🏺 *Amma Ki Rasoi*\n\n✅ *Order Delivered!*\nOrder ID: *#AKR-XXXX*\n\nWe hope you love the flavours! 😊\nPlease share your feedback — it means the world to us.\n\n⭐ Rate us on Google: [Link]\n\nWith love,\n_Amma Ki Rasoi_ 🏺`,
  },
  {
    id: 'broadcast_festival',
    label: '🎉 Festival Broadcast',
    description: 'Announce special products for festivals',
    preview: `🎉 *Diwali Special — Amma Ki Rasoi!*\n_घर के स्वाद की परंपरा_\n\nCelebrate Diwali with authentic homemade flavours! 🪔\n\n🛍️ *Special Products:*\n• Diwali Gift Box — ₹999\n• Mixed Achaar Pack — ₹599\n\n📞 Reply to order!\n⚡ Limited stock!\n\n_Amma Ki Rasoi_ 🏺`,
  },
];

export default function MarketingPage() {
  const [activeTab, setActiveTab] = useState('broadcast');
  const [selectedTemplate, setSelectedTemplate] = useState(TEMPLATES[0]);
  const [customMessage, setCustomMessage] = useState('');
  const [recipients, setRecipients] = useState('');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);

  const handleSend = async () => {
    setSending(true);
    setResult(null);
    // Simulate — in production this calls /api/marketing/broadcast
    await new Promise(r => setTimeout(r, 1200));
    setResult({ 
      success: true, 
      message: `Message copied! Since WhatsApp API is not yet configured, please paste this message manually into WhatsApp. Add your API key in .env.local to enable automated sending.` 
    });
    setSending(false);
  };

  const messageToShow = customMessage || selectedTemplate.preview;

  const handleCopy = () => {
    navigator.clipboard.writeText(messageToShow);
  };

  const tabStyle = (tab) => ({
    padding: '10px 20px', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem',
    borderBottom: activeTab === tab ? '3px solid var(--primary-terracotta)' : '3px solid transparent',
    color: activeTab === tab ? 'var(--primary-terracotta)' : 'var(--text-muted)',
    background: 'none', border: 'none', borderBottom: activeTab === tab ? '3px solid var(--primary-terracotta)' : '3px solid transparent',
  });

  return (
    <div>
      <h1 className="page-title" style={{ marginBottom: '8px' }}>📣 Marketing</h1>
      <p className="text-muted" style={{ marginBottom: '32px' }}>Send WhatsApp messages to your customers directly from here.</p>

      {/* API Key Banner */}
      <div style={{ padding: '16px 20px', backgroundColor: '#FFFBEB', border: '1px solid #D4A017', borderRadius: '8px', marginBottom: '32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontWeight: '600', color: '#92400E' }}>⚙️ WhatsApp API not configured yet</div>
          <div style={{ color: '#92400E', fontSize: '0.875rem', marginTop: '4px' }}>Add <code style={{ backgroundColor: '#FEF3C7', padding: '2px 6px', borderRadius: '4px' }}>WHATSAPP_API_KEY</code> to your <code style={{ backgroundColor: '#FEF3C7', padding: '2px 6px', borderRadius: '4px' }}>.env.local</code> file to enable automated sending.</div>
        </div>
        <Link href="/settings" className="btn" style={{ fontSize: '0.85rem', whiteSpace: 'nowrap' }}>Go to Settings</Link>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '2px solid var(--border-cream)', marginBottom: '32px' }}>
        <button style={tabStyle('broadcast')} onClick={() => setActiveTab('broadcast')}>📢 Broadcast</button>
        <button style={tabStyle('coupons')} onClick={() => setActiveTab('coupons')}>🎁 Coupons</button>
      </div>

      {activeTab === 'broadcast' && (
        <div style={{ display: 'flex', gap: '32px' }}>
          {/* Left: Template selector */}
          <div style={{ width: '280px', flexShrink: 0 }}>
            <h2 className="section-title">Message Templates</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {TEMPLATES.map(t => (
                <button
                  key={t.id}
                  onClick={() => { setSelectedTemplate(t); setCustomMessage(''); }}
                  style={{
                    padding: '12px 16px', textAlign: 'left', borderRadius: '8px', cursor: 'pointer',
                    border: selectedTemplate.id === t.id ? '2px solid var(--primary-terracotta)' : '2px solid var(--border-cream)',
                    backgroundColor: selectedTemplate.id === t.id ? '#FFF5F0' : 'white',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ fontWeight: '600', fontSize: '0.9rem', marginBottom: '4px' }}>{t.label}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Right: Preview + Recipients */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="card">
              <h2 className="section-title" style={{ marginTop: 0 }}>Message Preview</h2>
              <div style={{ backgroundColor: '#ECF8EF', borderRadius: '12px', padding: '20px', marginBottom: '16px', fontFamily: 'monospace', fontSize: '0.875rem', whiteSpace: 'pre-wrap', lineHeight: '1.6', borderTopLeftRadius: '0' }}>
                {messageToShow}
              </div>
              <textarea
                placeholder="Customize this message..."
                value={customMessage}
                onChange={e => setCustomMessage(e.target.value)}
                rows="4"
                style={{ width: '100%', padding: '12px', border: '1px solid var(--border-cream)', borderRadius: '6px', fontFamily: 'inherit', fontSize: '0.875rem', resize: 'vertical' }}
              />
              <button onClick={handleCopy} className="btn" style={{ marginTop: '12px' }}>📋 Copy Message</button>
            </div>

            <div className="card">
              <h2 className="section-title" style={{ marginTop: 0 }}>Recipients</h2>
              <p className="text-muted" style={{ marginBottom: '16px', fontSize: '0.875rem' }}>Enter phone numbers (comma separated) or choose a customer segment.</p>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                {['All Customers', 'VIP (5+ orders)', 'New Customers', 'COD Customers'].map(seg => (
                  <button key={seg} className="btn" style={{ fontSize: '0.8rem', padding: '6px 12px' }}>{seg}</button>
                ))}
              </div>
              <textarea
                placeholder="+91 98765 43210, +91 87654 32109, ..."
                value={recipients}
                onChange={e => setRecipients(e.target.value)}
                rows="3"
                style={{ width: '100%', padding: '12px', border: '1px solid var(--border-cream)', borderRadius: '6px', fontFamily: 'monospace', fontSize: '0.875rem', resize: 'vertical' }}
              />

              {result && (
                <div style={{ padding: '12px 16px', backgroundColor: result.success ? '#F0FFF4' : '#FEF2F2', borderRadius: '6px', marginTop: '16px', fontSize: '0.875rem', color: result.success ? 'var(--success-green)' : 'var(--danger-red)' }}>
                  {result.message}
                </div>
              )}

              <div style={{ marginTop: '16px', display: 'flex', gap: '12px' }}>
                <button onClick={handleSend} className="btn btn-primary" disabled={sending}>
                  {sending ? 'Sending...' : '📨 Send Broadcast'}
                </button>
                <button onClick={handleCopy} className="btn">📋 Copy & Send Manually</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'coupons' && (
        <div className="card">
          <h2 className="section-title" style={{ marginTop: 0 }}>🎁 Coupon / Discount Codes</h2>
          <p className="text-muted" style={{ marginBottom: '24px' }}>Create coupon codes to share with customers on WhatsApp or Instagram.</p>
          <table>
            <thead>
              <tr>
                <th>Code</th>
                <th>Discount</th>
                <th>Uses</th>
                <th>Expires</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="data-font" style={{ fontWeight: '700' }}>DIWALI25</td>
                <td>25% off</td>
                <td className="data-font">12 / 50</td>
                <td>31 Oct 2026</td>
                <td><span className="badge badge-delivered">Active</span></td>
                <td><button className="btn" style={{ fontSize: '0.8rem', padding: '4px 10px' }}>Edit</button></td>
              </tr>
              <tr>
                <td className="data-font" style={{ fontWeight: '700' }}>WELCOME50</td>
                <td>₹50 flat</td>
                <td className="data-font">3 / ∞</td>
                <td>Never</td>
                <td><span className="badge badge-delivered">Active</span></td>
                <td><button className="btn" style={{ fontSize: '0.8rem', padding: '4px 10px' }}>Edit</button></td>
              </tr>
            </tbody>
          </table>
          <button className="btn btn-primary" style={{ marginTop: '24px' }}>+ Create New Coupon</button>
        </div>
      )}
    </div>
  );
}
