'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { kgToGrams, formatKg } from '@/lib/weight';

export default function RawMaterialForm({ initialData = null, suppliers = [] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    stockKg: formatKg(initialData?.stockGrams ?? 0),
    supplier: initialData?.supplier || '',
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
      const payload = {
        name: formData.name,
        stockGrams: kgToGrams(formData.stockKg),
        supplier: formData.supplier || null,
        notes: formData.notes
      };

      const url = initialData
        ? `/api/raw-materials/${initialData._id}`
        : '/api/raw-materials';

      const method = initialData ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Something went wrong');
      }

      router.push('/raw-materials');
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
        <label style={labelStyle}>Name</label>
        <input required name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Mustard Oil" style={inputStyle} />
      </div>

      <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '8px' }}>
        <div>
          <label style={labelStyle}>Total Stock (kg)</label>
          <input required type="number" step="0.01" min="0" name="stockKg" value={formData.stockKg} onChange={handleChange} style={inputStyle} />
        </div>
      </div>
      <p className="text-muted" style={{ fontSize: '0.75rem', marginTop: 0, marginBottom: '24px' }}>
        How much of this ingredient you have on hand right now. Logging a production batch on a product that uses this ingredient deducts from this total automatically.
      </p>

      <div style={{ marginBottom: '8px' }}>
        <label style={labelStyle}>Supplier</label>
      </div>
      {suppliers.length === 0 ? (
        <p className="text-muted" style={{ fontSize: '0.8125rem', marginTop: 0, marginBottom: '32px' }}>
          No suppliers added yet — <Link href="/suppliers/new">add one</Link> first if you want to link it here.
        </p>
      ) : (
        <div style={{ marginBottom: '32px' }}>
          <select name="supplier" value={formData.supplier} onChange={handleChange} style={inputStyle}>
            <option value="">— No supplier set —</option>
            {suppliers.map(s => (
              <option key={s._id} value={s._id}>{s.name}</option>
            ))}
          </select>
          <p className="text-muted" style={{ fontSize: '0.75rem', marginTop: '8px', marginBottom: 0 }}>
            Manage supplier contact details on the <Link href="/suppliers">Suppliers</Link> page.
          </p>
        </div>
      )}

      <div style={{ marginBottom: '32px' }}>
        <label style={labelStyle}>Notes (Optional)</label>
        <input name="notes" value={formData.notes} onChange={handleChange} style={inputStyle} />
      </div>

      <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end' }}>
        <button type="button" onClick={() => router.push('/raw-materials')} className="btn" disabled={loading}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Saving...' : (initialData ? 'Update Raw Material' : 'Add Raw Material')}
        </button>
      </div>
    </form>
  );
}
