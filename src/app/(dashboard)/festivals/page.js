import Link from 'next/link';

export const metadata = {
  title: 'Festival Planning | Amma Ki Rasoi Admin'
};

export default function FestivalsPage() {
  const upcomingFestivals = [
    {
      name: 'Diwali',
      date: 'Oct 31, 2026',
      daysLeft: 110,
      status: 'Planning Phase',
      color: 'var(--warning-yellow)'
    },
    {
      name: 'Holi',
      date: 'Mar 15, 2027',
      daysLeft: 245,
      status: 'Upcoming',
      color: '#ccc'
    },
    {
      name: 'Makar Sankranti',
      date: 'Jan 14, 2027',
      daysLeft: 185,
      status: 'Upcoming',
      color: '#ccc'
    }
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h1 className="page-title" style={{ margin: 0 }}>🎉 Festival Planning</h1>
        <button className="btn btn-primary">+ Add Campaign</button>
      </div>

      <div style={{ display: 'flex', gap: '32px' }}>
        
        {/* Left Column - Upcoming Festivals */}
        <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="card">
            <h2 className="section-title" style={{ marginTop: 0 }}>Upcoming Events</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {upcomingFestivals.map(fest => (
                <div key={fest.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', border: '1px solid var(--border-cream)', borderRadius: '8px', backgroundColor: fest.status === 'Planning Phase' ? '#fffaf0' : 'white' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: fest.color }}></div>
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '1.1rem' }}>{fest.name}</div>
                      <div className="text-muted" style={{ fontSize: '0.875rem' }}>{fest.date}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 'bold', color: 'var(--primary-terracotta)' }}>{fest.daysLeft} days</div>
                    <div className="text-muted" style={{ fontSize: '0.75rem' }}>{fest.status}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Active Campaign Details */}
        <div style={{ flex: '2' }}>
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 className="section-title" style={{ margin: 0 }}>Diwali 2026 Campaign</h2>
              <span className="badge badge-packing">Planning</span>
            </div>

            <div className="grid-3" style={{ marginBottom: '32px' }}>
              <div style={{ padding: '16px', backgroundColor: 'var(--bg-cream)', borderRadius: '8px' }}>
                <div className="text-muted" style={{ marginBottom: '8px' }}>Target Revenue</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>₹50,000</div>
              </div>
              <div style={{ padding: '16px', backgroundColor: 'var(--bg-cream)', borderRadius: '8px' }}>
                <div className="text-muted" style={{ marginBottom: '8px' }}>Special Products</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>3 items</div>
              </div>
              <div style={{ padding: '16px', backgroundColor: 'var(--bg-cream)', borderRadius: '8px' }}>
                <div className="text-muted" style={{ marginBottom: '8px' }}>Early Bird Opens</div>
                <div style={{ fontSize: '1.25rem', fontWeight: '600', marginTop: '6px' }}>Oct 1, 2026</div>
              </div>
            </div>

            <h3 className="section-title" style={{ fontSize: '1rem', marginTop: '32px' }}>Checklist</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                <input type="checkbox" defaultChecked style={{ width: '18px', height: '18px' }} />
                <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)' }}>Finalize special product menu</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                <input type="checkbox" style={{ width: '18px', height: '18px' }} />
                <span>Source packaging materials (Gift boxes, diyas)</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                <input type="checkbox" style={{ width: '18px', height: '18px' }} />
                <span>Estimate raw material requirements</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                <input type="checkbox" style={{ width: '18px', height: '18px' }} />
                <span>Create marketing graphics</span>
              </label>
            </div>
            
            <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-primary">Edit Campaign</button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
