'use client';

import { useState, useEffect } from 'react';
import { Settings, Store, Rocket, MessageCircle, Printer, Check, AlertTriangle } from 'lucide-react';

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [loaded, setLoaded] = useState(false);

  const [business, setBusiness] = useState({
    name: 'Amma Ki Rasoi',
    tagline: 'घर के स्वाद की परंपरा',
    ownerName: '',
    phone: '',
    email: '',
    address: '',
    city: 'Lucknow',
    state: 'Uttar Pradesh',
    pincode: '',
    fssaiNumber: '',
    gstNumber: '',
    gstRegistered: false,
    gstRatePercent: 0,
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    upiId: '',
  });

  const [integrations, setIntegrations] = useState({
    shiprocketEmail: '',
    shiprocketPassword: '',
    whatsappProvider: 'interakt',
    whatsappApiKey: '',
    whatsappPhoneId: '',
  });

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) {
          const { _id, createdAt, updatedAt, __v, ...rest } = data;
          setBusiness(prev => ({ ...prev, ...rest }));
        }
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(business),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save settings');
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = { width: '100%', padding: '10px 12px', border: '1px solid var(--border-cream)', borderRadius: '6px', fontFamily: 'inherit', fontSize: '0.9rem' };
  const labelStyle = { display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' };
  const sectionStyle = { fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '12px 0 8px', borderBottom: '1px solid var(--border-cream)', marginBottom: '20px' };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h1 className="page-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}><Settings size={22} strokeWidth={2} /> Settings</h1>
        <button onClick={handleSave} disabled={saving || !loaded} className="btn btn-primary">
          {saving ? 'Saving...' : saved ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><Check size={15} strokeWidth={2} /> Saved!</span> : 'Save Changes'}
        </button>
      </div>

      {error && <div style={{ padding: '12px', backgroundColor: '#FEE2E2', color: 'var(--danger-red)', marginBottom: '24px', borderRadius: '6px' }}>{error}</div>}

      <div style={{ display: 'flex', gap: '32px' }}>
        <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: '24px' }}>

          {/* Business Profile */}
          <div className="card">
            <h2 className="section-title" style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '8px' }}><Store size={17} strokeWidth={2} /> Business Profile</h2>
            <div className="text-muted" style={{ fontSize: '0.8rem', marginBottom: '20px', marginTop: '-12px' }}>
              This information appears on invoices and shipping labels.
            </div>

            <div style={sectionStyle}>Brand</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div>
                <label style={labelStyle}>Business Name</label>
                <input value={business.name} onChange={e => setBusiness(p => ({...p, name: e.target.value}))} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Tagline</label>
                <input value={business.tagline} onChange={e => setBusiness(p => ({...p, tagline: e.target.value}))} style={inputStyle} />
              </div>
            </div>

            <div style={sectionStyle}>Contact</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div>
                <label style={labelStyle}>Owner Name</label>
                <input value={business.ownerName} onChange={e => setBusiness(p => ({...p, ownerName: e.target.value}))} style={inputStyle} placeholder="Your name" />
              </div>
              <div>
                <label style={labelStyle}>Phone Number</label>
                <input value={business.phone} onChange={e => setBusiness(p => ({...p, phone: e.target.value}))} style={inputStyle} placeholder="+91 98765 43210" />
              </div>
              <div>
                <label style={labelStyle}>Email</label>
                <input type="email" value={business.email} onChange={e => setBusiness(p => ({...p, email: e.target.value}))} style={inputStyle} placeholder="your@email.com" />
              </div>
              <div>
                <label style={labelStyle}>UPI ID</label>
                <input value={business.upiId} onChange={e => setBusiness(p => ({...p, upiId: e.target.value}))} style={inputStyle} placeholder="yourname@upi" />
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>Business Address</label>
              <textarea value={business.address} onChange={e => setBusiness(p => ({...p, address: e.target.value}))} rows="2" style={{ ...inputStyle, resize: 'vertical' }} placeholder="Full address..." />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div>
                <label style={labelStyle}>City</label>
                <input value={business.city} onChange={e => setBusiness(p => ({...p, city: e.target.value}))} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>State</label>
                <input value={business.state} onChange={e => setBusiness(p => ({...p, state: e.target.value}))} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Pincode</label>
                <input value={business.pincode} onChange={e => setBusiness(p => ({...p, pincode: e.target.value}))} style={inputStyle} placeholder="226001" />
              </div>
            </div>

            <div style={sectionStyle}>Legal & Compliance</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div>
                <label style={labelStyle}>FSSAI Registration No.</label>
                <input value={business.fssaiNumber} onChange={e => setBusiness(p => ({...p, fssaiNumber: e.target.value}))} style={inputStyle} placeholder="Applied / Pending" />
              </div>
              <div>
                <label style={labelStyle}>GST Number (if applicable)</label>
                <input value={business.gstNumber} onChange={e => setBusiness(p => ({...p, gstNumber: e.target.value}))} style={inputStyle} placeholder="Not registered" />
              </div>
            </div>

            <div style={{ padding: '14px 16px', backgroundColor: '#FFF9F0', border: '1px solid #F1DEB8', borderRadius: '6px', marginBottom: '20px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600', cursor: 'pointer', marginBottom: business.gstRegistered ? '14px' : 0 }}>
                <input type="checkbox" checked={!!business.gstRegistered} onChange={e => setBusiness(p => ({...p, gstRegistered: e.target.checked}))} />
                Registered for GST — charge and show GST on invoices
              </label>
              {business.gstRegistered && (
                <>
                  <div style={{ maxWidth: '220px', marginBottom: '10px' }}>
                    <label style={labelStyle}>GST Rate (%)</label>
                    <input type="number" min="0" max="28" step="0.1" value={business.gstRatePercent} onChange={e => setBusiness(p => ({...p, gstRatePercent: e.target.value}))} style={inputStyle} placeholder="e.g. 12" />
                  </div>
                  <div className="text-muted" style={{ fontSize: '0.78rem', lineHeight: 1.5 }}>
                    Product prices you set in the Products section don't change — they're treated as <strong>GST-inclusive</strong> (the price shown to customers already includes tax). This rate is only used to back the GST amount out of that price for display as a separate line on invoices. Rates can differ by product category (pickles, namkeen, sweets, honey) — confirm the correct one(s) with a CA/accountant before relying on this for actual tax filing; this shows one combined GST line, not a compliant CGST/SGST/IGST split.
                  </div>
                </>
              )}
              {!business.gstRegistered && (
                <div className="text-muted" style={{ fontSize: '0.78rem', lineHeight: 1.5 }}>
                  Off — invoices won't show any GST line or claim prices include tax. Turn this on once you're actually registered.
                </div>
              )}
            </div>

            <div style={sectionStyle}>Bank Details (for COD Remittance)</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={labelStyle}>Bank Name</label>
                <input value={business.bankName} onChange={e => setBusiness(p => ({...p, bankName: e.target.value}))} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Account Number</label>
                <input value={business.accountNumber} onChange={e => setBusiness(p => ({...p, accountNumber: e.target.value}))} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>IFSC Code</label>
                <input value={business.ifscCode} onChange={e => setBusiness(p => ({...p, ifscCode: e.target.value}))} style={inputStyle} />
              </div>
            </div>
          </div>
        </div>

        {/* Right column: API Integrations */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>

          {/* ShipRocket */}
          <div className="card">
            <h2 className="section-title" style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '8px' }}><Rocket size={17} strokeWidth={2} /> ShipRocket</h2>
            <div style={{ padding: '8px 12px', backgroundColor: '#FFF5F0', borderRadius: '6px', marginBottom: '16px', fontSize: '0.8rem', color: 'var(--primary-terracotta)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertTriangle size={14} strokeWidth={2} /> Configure via SHIPROCKET_EMAIL / SHIPROCKET_PASSWORD in .env.local
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Email</label>
              <input type="email" value={integrations.shiprocketEmail} onChange={e => setIntegrations(p => ({...p, shiprocketEmail: e.target.value}))} style={inputStyle} placeholder="your@shiprocket.com" disabled />
            </div>
            <div>
              <label style={labelStyle}>Password</label>
              <input type="password" value={integrations.shiprocketPassword} onChange={e => setIntegrations(p => ({...p, shiprocketPassword: e.target.value}))} style={inputStyle} placeholder="••••••••" disabled />
            </div>
          </div>

          {/* WhatsApp */}
          <div className="card">
            <h2 className="section-title" style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '8px' }}><MessageCircle size={17} strokeWidth={2} /> WhatsApp API</h2>
            <div style={{ padding: '8px 12px', backgroundColor: '#FFF5F0', borderRadius: '6px', marginBottom: '16px', fontSize: '0.8rem', color: 'var(--primary-terracotta)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertTriangle size={14} strokeWidth={2} /> Configure via WHATSAPP_* variables in .env.local
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Provider</label>
              <select value={integrations.whatsappProvider} onChange={e => setIntegrations(p => ({...p, whatsappProvider: e.target.value}))} style={inputStyle} disabled>
                <option value="interakt">Interakt (Recommended for India)</option>
                <option value="meta">Meta Cloud API</option>
                <option value="wati">WATI</option>
              </select>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>API Key</label>
              <input type="password" value={integrations.whatsappApiKey} onChange={e => setIntegrations(p => ({...p, whatsappApiKey: e.target.value}))} style={inputStyle} placeholder="••••••••••••" disabled />
            </div>
          </div>

          {/* Printer */}
          <div className="card">
            <h2 className="section-title" style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '8px' }}><Printer size={17} strokeWidth={2} /> Printer Settings</h2>
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Invoice Paper Size</label>
              <select style={inputStyle}>
                <option>A4</option>
                <option>A5</option>
                <option>Thermal 3-inch</option>
              </select>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Shipping Label Size</label>
              <select style={inputStyle}>
                <option>4×6 inches (Standard)</option>
                <option>A4 (2-per-page)</option>
                <option>A4 (4-per-page)</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
