'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SupplierForm({ initialData = null }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    contactPerson: initialData?.contactPerson || '',
    phone: initialData?.phone || '',
    email: initialData?.email || '',
    address: initialData?.address || '',
    notes: initialData?.notes || ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const url = initialData
        ? `/api/suppliers/${initialData._id}`
        : '/api/suppliers';

      const method = initialData ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Something went wrong');
      }

      router.push('/suppliers');
      router.refresh();
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const inputStyle = { width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' };
  const labelStyle = { display: 'block', marginBottom: '8px', fontWeight: '500' };

  return (
    <form onSubmit={handleSubmit} className="card" style={{ maxWidth: '800px' }}>
      {error && <div style={{ padding: '12px', backgroundColor: '#FEE2E2', color: 'var(--danger-red)', marginBottom: '16px', borderRadius: '4px' }}>{error}</div>}

      <div style={{ marginBottom: '24px' }}>
        <label style={labelStyle}>Supplier Name</label>
        <input required name="name" value={formData.name} onChange={handleChange} placeholder="e.g. XYZ Pvt Ltd" style={inputStyle} />
      </div>

      <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
        <div>
          <label style={labelStyle}>Contact Person</label>
          <input name="contactPerson" value={formData.contactPerson} onChange={handleChange} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Phone</label>
          <input name="phone" value={formData.phone} onChange={handleChange} style={inputStyle} />
        </div>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <label style={labelStyle}>Email</label>
        <input type="email" name="email" value={formData.email} onChange={handleChange} style={inputStyle} />
      </div>

      <div style={{ marginBottom: '24px' }}>
        <label style={labelStyle}>Address</label>
        <textarea name="address" value={formData.address} onChange={handleChange} rows="2" style={inputStyle} />
      </div>

      <div style={{ marginBottom: '32px' }}>
        <label style={labelStyle}>Notes (Optional)</label>
        <input name="notes" value={formData.notes} onChange={handleChange} style={inputStyle} />
      </div>

      <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end' }}>
        <button type="button" onClick={() => router.push('/suppliers')} className="btn" disabled={loading}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Saving...' : (initialData ? 'Update Supplier' : 'Add Supplier')}
        </button>
      </div>
    </form>
  );
}
