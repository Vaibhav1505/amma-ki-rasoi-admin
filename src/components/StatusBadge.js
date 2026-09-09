import { Clock, CheckCircle2, Archive, Truck, PackageCheck, Ban, RotateCcw, Coins } from 'lucide-react';

export const STATUS_ICONS = {
  pending: Clock,
  confirmed: CheckCircle2,
  packing: Archive,
  shipped: Truck,
  delivered: PackageCheck,
  cancelled: Ban,
  return: RotateCcw,
  cod_pending: Coins,
};

export function statusLabel(status) {
  return status === 'cod_pending' ? 'COD Pending' : status.charAt(0).toUpperCase() + status.slice(1);
}

export default function StatusBadge({ status, style }) {
  const Icon = STATUS_ICONS[status] || Clock;
  return (
    <span className={`badge badge-${status}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', ...style }}>
      <Icon size={12} strokeWidth={2.5} />
      {statusLabel(status)}
    </span>
  );
}
