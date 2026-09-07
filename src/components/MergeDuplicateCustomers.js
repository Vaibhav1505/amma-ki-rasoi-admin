'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function MergeDuplicateCustomers({ candidates }) {
  const router = useRouter();
  // Default to the phone with the most orders as the likely canonical one
  const [primaryPhone, setPrimaryPhone] = useState(
    [...candidates].sort((a, b) => b.totalOrders - a.totalOrders)[0].phone
  );
  const [merging, setMerging] = useState(false);
  const [error, setError] = useState(null);

  const handleMerge = async () => {
    setMerging(true);
    setError(null);
    try {
      const duplicatePhones = candidates.map(c => c.phone).filter(p => p !== primaryPhone);
      const res = await fetch('/api/customers/merge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ primaryPhone, duplicatePhones }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to merge');
      }
      router.refresh();
    } catch (err) {
      setError(err.message);
      setMerging(false);
    }
  };

  return (
    <div style={{ padding: '12px 16px', backgroundColor: '#FFFBEB', borderRadius: '8px', marginBottom: '12px', border: '1px solid #F0E0B0' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {candidates.map(c => (
            <label key={c.phone} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', cursor: 'pointer' }}>
              <input
                type="radio"
                name={`primary-${candidates[0].phone}`}
                checked={primaryPhone === c.phone}
                onChange={() => setPrimaryPhone(c.phone)}
              />
              <span className="data-font">{c.phone}</span>
              <span className="text-muted">— {c.name} ({c.totalOrders} order{c.totalOrders !== 1 ? 's' : ''})</span>
            </label>
          ))}
          <div className="text-muted" style={{ fontSize: '0.75rem', marginTop: '2px' }}>Selected number becomes the canonical phone; the others' orders and tags merge into it.</div>
        </div>
        <button onClick={handleMerge} disabled={merging} className="btn btn-primary" style={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
          {merging ? 'Merging...' : 'Merge into selected'}
        </button>
      </div>
      {error && <div style={{ marginTop: '8px', fontSize: '0.8rem', color: 'var(--danger-red)' }}>{error}</div>}
    </div>
  );
}
