import { Star, Repeat, Sparkles } from 'lucide-react';

export function getSegment(totalOrders) {
  if (totalOrders >= 5) return { label: 'VIP', color: 'var(--warning-gold)', bg: '#FFFBEB', icon: Star };
  if (totalOrders >= 2) return { label: 'Repeat', color: '#2B6CB0', bg: '#EBF8FF', icon: Repeat };
  return { label: 'New', color: '#4A7C59', bg: '#F0FFF4', icon: Sparkles };
}

export default function CustomerSegmentBadge({ totalOrders, style }) {
  const seg = getSegment(totalOrders);
  const Icon = seg.icon;
  return (
    <span style={{ padding: '3px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '700', backgroundColor: seg.bg, color: seg.color, display: 'inline-flex', alignItems: 'center', gap: '4px', ...style }}>
      <Icon size={12} strokeWidth={2.5} /> {seg.label}
    </span>
  );
}
