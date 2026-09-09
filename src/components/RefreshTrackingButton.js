'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';

export default function RefreshTrackingButton({ orderId }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleClick = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/orders/${orderId}/track`, { method: 'POST' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to refresh tracking');
      }
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <span>
      <button
        onClick={handleClick}
        disabled={loading}
        className="btn"
        style={{ fontSize: '0.8rem', padding: '4px 10px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
      >
        <Search size={12} strokeWidth={2} /> {loading ? 'Checking...' : 'Track'}
      </button>
      {error && <div style={{ fontSize: '0.7rem', color: 'var(--danger-red)', marginTop: '4px' }}>{error}</div>}
    </span>
  );
}
