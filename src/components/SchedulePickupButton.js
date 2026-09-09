'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Rocket } from 'lucide-react';

export default function SchedulePickupButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleClick = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch('/api/shipping/pickup', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to schedule pickup');
      setMessage(data.message || `Pickup requested for ${data.scheduled} shipment${data.scheduled !== 1 ? 's' : ''}.`);
      router.refresh();
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
      <button onClick={handleClick} disabled={loading} className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
        <Rocket size={15} strokeWidth={2} /> {loading ? 'Scheduling...' : 'Schedule Pickup'}
      </button>
      {message && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{message}</div>}
    </div>
  );
}
