'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { STATUS_ICONS } from '@/components/StatusBadge';

const STATUS_LABELS = {
  pending:    { label: 'Pending',      color: '#D4A017' },
  confirmed:  { label: 'Confirmed',    color: '#2B6CB0' },
  packing:    { label: 'Packing',      color: '#DD6B20' },
  shipped:    { label: 'Shipped',      color: '#6B46C1' },
  delivered:  { label: 'Delivered',    color: '#4A7C59' },
  cancelled:  { label: 'Cancelled',    color: '#A61C00' },
  return:     { label: 'Return',       color: '#4A4A4A' },
  cod_pending:{ label: 'COD Pending',  color: '#B7791F' },
};

// The allowed next statuses from each current status
const NEXT_STATUSES = {
  pending:    ['confirmed', 'cancelled'],
  confirmed:  ['packing', 'cancelled'],
  packing:    ['shipped', 'cancelled'],
  shipped:    ['delivered', 'return', 'cod_pending'],
  delivered:  ['return'],
  cod_pending:['delivered'],
  cancelled:  [],
  return:     [],
};

export default function StatusUpdateButton({ orderId, currentStatus }) {
  const router = useRouter();
  const [showDialog, setShowDialog] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const nextStatuses = NEXT_STATUSES[currentStatus] || [];

  if (nextStatuses.length === 0) return null;

  const requiresReason = (status) => status === 'cancelled' || status === 'return';

  const handleSelect = (status) => {
    setSelectedStatus(status);
    setReason('');
    setShowDialog(true);
  };

  const handleConfirm = async () => {
    if (requiresReason(selectedStatus) && !reason.trim()) {
      setError('Please enter a reason.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: selectedStatus, reason: reason.trim() || undefined }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update status');
      }

      setShowDialog(false);
      router.refresh();
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {nextStatuses.map((status) => {
          const info = STATUS_LABELS[status];
          const Icon = STATUS_ICONS[status];
          return (
            <button
              key={status}
              onClick={() => handleSelect(status)}
              className="btn"
              style={{
                border: `2px solid ${info.color}`,
                color: info.color,
                fontWeight: '600',
                display: 'inline-flex', alignItems: 'center', gap: '6px',
              }}
            >
              <Icon size={14} strokeWidth={2} /> Mark as {info.label}
            </button>
          );
        })}
      </div>

      {/* Confirmation Dialog */}
      {showDialog && selectedStatus && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white', borderRadius: '12px', padding: '32px',
            maxWidth: '420px', width: '90%', boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              {(() => { const Icon = STATUS_ICONS[selectedStatus]; return <Icon size={20} strokeWidth={2} />; })()} Confirm Status Update
            </h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px', lineHeight: '1.6' }}>
              Are you sure you want to mark this order as{' '}
              <strong style={{ color: STATUS_LABELS[selectedStatus].color }}>
                {STATUS_LABELS[selectedStatus].label}
              </strong>?
              This action will update the order record immediately.
            </p>

            {requiresReason(selectedStatus) && (
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Reason *
                </label>
                <textarea
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows="3"
                  placeholder={selectedStatus === 'cancelled' ? 'e.g. Customer requested cancellation' : 'e.g. Damaged in transit'}
                  style={{ width: '100%', padding: '10px', border: '1px solid var(--border-cream)', borderRadius: '6px', fontFamily: 'inherit', fontSize: '0.875rem', resize: 'vertical' }}
                />
              </div>
            )}

            {error && (
              <div style={{ padding: '10px', backgroundColor: '#FEE2E2', color: 'var(--danger-red)', borderRadius: '4px', marginBottom: '16px' }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                className="btn"
                onClick={() => { setShowDialog(false); setError(null); }}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleConfirm}
                disabled={loading}
              >
                {loading ? 'Updating...' : 'Yes, Update Status'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
