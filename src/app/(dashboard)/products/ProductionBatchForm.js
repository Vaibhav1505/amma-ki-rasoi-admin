'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Factory } from 'lucide-react';

// A dedicated action, separate from editing the product's own fields:
// "I just made a batch of this." Deducts the recipe's raw materials (if the
// product has one) and adds the batch straight to finished stock. Blocked
// (with a clear error, nothing changed) if any ingredient doesn't have
// enough stock — see /api/products/[id]/produce and lib/rawMaterials.js.
export default function ProductionBatchForm({ productId, hasRecipe }) {
  const router = useRouter();
  const [batchKg, setBatchKg] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const res = await fetch(`/api/products/${productId}/produce`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ batchKg })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      setSuccess(`Logged a ${batchKg}kg batch. Stock updated.`);
      setBatchKg('');
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = { width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' };
  const labelStyle = { display: 'block', marginBottom: '8px', fontWeight: '500' };

  return (
    <form onSubmit={handleSubmit} className="card">
      <h2 className="section-title" style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Factory size={17} strokeWidth={2} /> Log Production Batch
      </h2>
      <p className="text-muted" style={{ fontSize: '0.875rem', marginTop: 0, marginBottom: '16px' }}>
        {hasRecipe
          ? 'Record a fresh batch you just made. This adds to finished stock above and deducts the raw materials this recipe uses — blocked automatically if any ingredient is running short.'
          : 'Record a fresh batch you just made. This product has no recipe set, so this only adds to finished stock — no raw materials will be deducted.'}
      </p>

      {error && <div style={{ padding: '12px', backgroundColor: '#FEE2E2', color: 'var(--danger-red)', marginBottom: '16px', borderRadius: '4px' }}>{error}</div>}
      {success && <div style={{ padding: '12px', backgroundColor: '#DCFCE7', color: 'var(--success-green)', marginBottom: '16px', borderRadius: '4px' }}>{success}</div>}

      <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-end' }}>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Batch Size (kg)</label>
          <input
            required
            type="number"
            step="0.01"
            min="0"
            value={batchKg}
            onChange={e => setBatchKg(e.target.value)}
            placeholder="e.g. 20"
            style={inputStyle}
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Logging...' : 'Log Batch'}
        </button>
      </div>
    </form>
  );
}
