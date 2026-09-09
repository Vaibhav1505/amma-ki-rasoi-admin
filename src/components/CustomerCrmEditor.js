'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Tag, X, Check } from 'lucide-react';

const SUGGESTED_TAGS = ['VIP', 'No COD', 'Blocked', 'Wholesale'];

export default function CustomerCrmEditor({ phone, initialTags, initialNote }) {
  const router = useRouter();
  const [tags, setTags] = useState(initialTags || []);
  const [newTag, setNewTag] = useState('');
  const [note, setNote] = useState(initialNote || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const addTag = (tag) => {
    const t = tag.trim();
    if (!t || tags.includes(t)) return;
    setTags(prev => [...prev, t]);
    setNewTag('');
  };
  const removeTag = (tag) => setTags(prev => prev.filter(t => t !== tag));

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch(`/api/customers/${encodeURIComponent(phone)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tags, internalNote: note }),
      });
      if (!res.ok) throw new Error('Failed to save');
      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card">
      <h2 className="section-title" style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '8px' }}><Tag size={17} strokeWidth={2} /> Tags & Notes</h2>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
        {tags.map(tag => (
          <span key={tag} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '700', backgroundColor: 'rgba(193,68,14,0.1)', color: 'var(--primary-terracotta)' }}>
            {tag}
            <button onClick={() => removeTag(tag)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 0, display: 'inline-flex', alignItems: 'center' }}><X size={12} strokeWidth={2.5} /></button>
          </span>
        ))}
        {tags.length === 0 && <span className="text-muted" style={{ fontSize: '0.8rem' }}>No tags yet.</span>}
      </div>

      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
        {SUGGESTED_TAGS.filter(t => !tags.includes(t)).map(t => (
          <button key={t} onClick={() => addTag(t)} className="btn" style={{ fontSize: '0.75rem', padding: '4px 10px' }}>+ {t}</button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <input
          value={newTag}
          onChange={e => setNewTag(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(newTag); } }}
          placeholder="Custom tag..."
          style={{ flex: 1, padding: '8px 10px', border: '1px solid var(--border-cream)', borderRadius: '6px', fontSize: '0.85rem' }}
        />
        <button onClick={() => addTag(newTag)} className="btn" style={{ fontSize: '0.8rem' }}>Add</button>
      </div>

      <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Internal Note
      </label>
      <textarea
        value={note}
        onChange={e => setNote(e.target.value)}
        rows="3"
        placeholder="e.g. Prefers evening delivery, always pays UPI..."
        style={{ width: '100%', padding: '10px', border: '1px solid var(--border-cream)', borderRadius: '4px', resize: 'vertical', fontFamily: 'inherit', fontSize: '0.875rem', marginBottom: '12px' }}
      />

      <button onClick={handleSave} disabled={saving} className="btn btn-primary" style={{ width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
        {saving ? 'Saving...' : saved ? <><Check size={14} strokeWidth={2} /> Saved</> : 'Save Tags & Note'}
      </button>
    </div>
  );
}
