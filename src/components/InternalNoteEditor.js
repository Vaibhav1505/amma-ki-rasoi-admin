'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function InternalNoteEditor({ orderId, initialNote }) {
  const router = useRouter();
  const [note, setNote] = useState(initialNote || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch(`/api/orders/${orderId}/note`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ internalNote: note }),
      });
      if (!res.ok) throw new Error('Failed to save note');
      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <textarea
        placeholder="Add internal note..."
        rows="3"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        style={{ width: '100%', padding: '10px', border: '1px solid var(--border-cream)', borderRadius: '4px', resize: 'vertical', fontFamily: 'inherit', fontSize: '0.875rem' }}
      />
      <button onClick={handleSave} disabled={saving} className="btn" style={{ marginTop: '8px', width: '100%' }}>
        {saving ? 'Saving...' : saved ? '✅ Saved' : 'Save Note'}
      </button>
    </>
  );
}
