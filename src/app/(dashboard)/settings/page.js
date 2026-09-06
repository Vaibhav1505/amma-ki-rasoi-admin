'use client';

import { useState } from 'react';

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);

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

  const handleSave = async () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const inputStyle = { width: '100%', padding: '10px 12px', border: '1px solid var(--border-cream)', borderRadius: '6px', fontFamily: 'inherit', fontSize: '0.9rem' };
  const labelStyle = { display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' };
  const sectionStyle = { fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '12px 0 8px', borderBottom: '1px solid var(--border-cream)', marginBottom: '20px' };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h1 className="page-title" style={{ margin: 0 }}>⚙️ Settings</h1>
        <button onClick={handleSave} className="btn btn-primary">
          {saved ? '✅ Saved!' : 'Save Changes'}
        </button>
      </div>

      <div style={{ display: 'flex', gap: '32px' }}>
        <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: '24px' }}>

          {/* Business Profile */}
          <div className="card">
            <h2 className="section-title" style={{ marginTop: 0 }}>🏪 Business Profile</h2>

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
            <h2 className="section-title" style={{ marginTop: 0 }}>🚀 ShipRocket</h2>
            <div style={{ padding: '8px 12px', backgroundColor: '#FFF5F0', borderRadius: '6px', marginBottom: '16px', fontSize: '0.8rem', color: 'var(--primary-terracotta)' }}>
              ⚠️ Not connected — add credentials below
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Email</label>
              <input type="email" value={integrations.shiprocketEmail} onChange={e => setIntegrations(p => ({...p, shiprocketEmail: e.target.value}))} style={inputStyle} placeholder="your@shiprocket.com" />
            </div>
            <div>
              <label style={labelStyle}>Password</label>
              <input type="password" value={integrations.shiprocketPassword} onChange={e => setIntegrations(p => ({...p, shiprocketPassword: e.target.value}))} style={inputStyle} placeholder="••••••••" />
            </div>
          </div>

          {/* WhatsApp */}
          <div className="card">
            <h2 className="section-title" style={{ marginTop: 0 }}>💬 WhatsApp API</h2>
            <div style={{ padding: '8px 12px', backgroundColor: '#FFF5F0', borderRadius: '6px', marginBottom: '16px', fontSize: '0.8rem', color: 'var(--primary-terracotta)' }}>
              ⚠️ Not connected — add credentials below
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Provider</label>
              <select value={integrations.whatsappProvider} onChange={e => setIntegrations(p => ({...p, whatsappProvider: e.target.value}))} style={inputStyle}>
                <option value="interakt">Interakt (Recommended for India)</option>
                <option value="meta">Meta Cloud API</option>
                <option value="wati">WATI</option>
              </select>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>API Key</label>
              <input type="password" value={integrations.whatsappApiKey} onChange={e => setIntegrations(p => ({...p, whatsappApiKey: e.target.value}))} style={inputStyle} placeholder="••••••••••••" />
            </div>
            {integrations.whatsappProvider === 'meta' && (
              <div>
                <label style={labelStyle}>Phone Number ID</label>
                <input value={integrations.whatsappPhoneId} onChange={e => setIntegrations(p => ({...p, whatsappPhoneId: e.target.value}))} style={inputStyle} placeholder="From Meta Business Suite" />
              </div>
            )}
          </div>

          {/* Printer */}
          <div className="card">
            <h2 className="section-title" style={{ marginTop: 0 }}>🖨️ Printer Settings</h2>
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
