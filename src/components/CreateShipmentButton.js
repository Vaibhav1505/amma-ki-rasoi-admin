'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Rocket } from 'lucide-react';

export default function CreateShipmentButton({ orderId }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleClick = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/orders/${orderId}/ship`, { method: 'POST' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create shipment');
      }
      router.refresh();
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={loading}
        className="btn btn-primary"
        style={{ fontSize: '0.875rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
      >
        <Rocket size={14} strokeWidth={2} /> {loading ? 'Creating shipment...' : 'Create Shipment via ShipRocket'}
      </button>
      {error && <div style={{ marginTop: '8px', fontSize: '0.8rem', color: 'var(--danger-red)' }}>{error}</div>}
    </div>
  );
}
