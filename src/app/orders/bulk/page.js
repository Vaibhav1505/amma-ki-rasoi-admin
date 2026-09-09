import Link from 'next/link';
import { ClipboardList, MessageCircle, Plus, Clock, CheckCircle2, Archive, PackageCheck } from 'lucide-react';

export const metadata = {
  title: 'Bulk & Festival Orders | Amma Ki Rasoi Admin'
};

const MOCK_BULK = [
  { id: 'B-001', customer: 'Sharma Family', event: 'Wedding', value: '₹8,000+', status: 'discussing', phone: '+91 98765 43210', date: '10 Aug 2026', note: 'Wants 50 jars of mixed achaar for wedding favours.' },
  { id: 'B-002', customer: 'TechCorp Office', event: 'Diwali Gifting', value: '₹5,500', status: 'confirmed', phone: '+91 87654 32109', date: '31 Oct 2026', note: '25 Diwali gift boxes.' },
  { id: 'B-003', customer: 'Shri Ram Temple Trust', event: 'Chhath Puja', value: '₹12,000', status: 'in_prep', phone: '+91 76543 21098', date: '28 Oct 2026', note: 'Prasad preparation — achaar and sweets.' },
];

const STATUS_STYLE = {
  discussing: { label: 'Discussing', color: '#D4A017', bg: '#FFFBEB', icon: Clock },
  confirmed:  { label: 'Confirmed',  color: '#2B6CB0', bg: '#EBF8FF', icon: CheckCircle2 },
  in_prep:    { label: 'In Prep',    color: '#DD6B20', bg: '#FFF3EB', icon: Archive },
  completed:  { label: 'Completed',  color: '#4A7C59', bg: '#F0FFF4', icon: PackageCheck },
};

export default function BulkOrdersPage() {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 className="page-title" style={{ margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ClipboardList size={22} strokeWidth={2} /> Bulk & Festival Orders
          </h1>
          <p className="text-muted" style={{ margin: 0 }}>Track large and custom orders for events, weddings, and corporate gifting.</p>
        </div>
        <button className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <Plus size={15} strokeWidth={2} /> New Bulk Request
        </button>
      </div>

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Ref #</th>
              <th>Customer / Org.</th>
              <th>Event</th>
              <th>Est. Value</th>
              <th>Delivery Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_BULK.map(req => {
              const statusInfo = STATUS_STYLE[req.status];
              const StatusIcon = statusInfo.icon;
              return (
                <tr key={req.id}>
                  <td className="data-font" style={{ fontWeight: '700' }}>{req.id}</td>
                  <td>
                    <div style={{ fontWeight: '600' }}>{req.customer}</div>
                    <div className="text-muted" style={{ fontSize: '0.8rem' }}>{req.phone}</div>
                  </td>
                  <td>{req.event}</td>
                  <td className="data-font" style={{ fontWeight: '700', color: 'var(--primary-terracotta)' }}>{req.value}</td>
                  <td className="text-muted">{req.date}</td>
                  <td>
                    <span style={{ padding: '4px 12px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '700', backgroundColor: statusInfo.bg, color: statusInfo.color, display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                      <StatusIcon size={12} strokeWidth={2.5} /> {statusInfo.label}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button className="btn" style={{ fontSize: '0.8rem', padding: '4px 10px' }}>View</button>
                      <a href={`https://wa.me/${req.phone?.replace(/\D/g, '')}`} target="_blank" className="btn" style={{ fontSize: '0.8rem', padding: '4px 10px', display: 'inline-flex', alignItems: 'center' }}><MessageCircle size={14} strokeWidth={2} /></a>
                      <Link href="/orders/new" className="btn" style={{ fontSize: '0.8rem', padding: '4px 10px' }}>+ Order</Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Details card for first entry */}
      <div className="card" style={{ marginTop: '24px' }}>
        <h2 className="section-title" style={{ marginTop: 0 }}>Notes</h2>
        {MOCK_BULK.map(req => (
          <div key={req.id} style={{ padding: '12px 16px', backgroundColor: 'var(--bg-cream, #FDF8F3)', borderRadius: '8px', marginBottom: '12px', borderLeft: '3px solid var(--border-cream)' }}>
            <div style={{ fontWeight: '600', marginBottom: '4px' }}>{req.id} — {req.customer}</div>
            <div className="text-muted" style={{ fontSize: '0.875rem' }}>{req.note}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
