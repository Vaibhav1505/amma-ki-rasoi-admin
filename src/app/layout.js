import "./globals.css";
import Sidebar from '@/components/Sidebar';
import LogoutButton from '@/components/LogoutButton';
import { getSession } from '@/lib/session';
import { Amphora, Bell } from 'lucide-react';

export const metadata = {
  title: "Admin Dashboard | Amma Ki Rasoi",
  description: "Internal Business Management System",
};

export default async function RootLayout({ children }) {
  // Check if admin is logged in
  const session = await getSession();

  // ── NOT logged in → render bare shell (login page, no sidebar) ──────────
  if (!session?.username) {
    return (
      <html lang="en">
        <body style={{
          margin: 0,
          padding: 0,
          display: 'block',        // override globals.css body { display: flex }
          minHeight: '100vh',
          backgroundColor: '#1A0F08', // override off-white background
        }}>
          {children}
        </body>
      </html>
    );
  }

  // ── Logged in → render full dashboard layout ─────────────────────────────
  const currentDate = new Date().toLocaleDateString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
  });
  const username = session.username;

  return (
    <html lang="en">
      <body>
        <div className="dashboard-layout">
          <Sidebar />

          <main className="main-content">
            <header className="topbar">
              <div style={{ fontWeight: '600', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Amphora size={18} strokeWidth={2} />
                Amma Ki Rasoi — Admin
              </div>
              <div className="user-info">
                <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{currentDate}</span>
                <Bell size={17} strokeWidth={2} />
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  padding: '4px 12px 4px 4px',
                  backgroundColor: 'rgba(193,68,14,0.08)',
                  border: '1px solid rgba(193,68,14,0.2)',
                  borderRadius: '20px',
                }}>
                  <span style={{
                    backgroundColor: 'var(--primary-terracotta)', color: 'white',
                    borderRadius: '50%', width: '28px', height: '28px',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: '700', fontSize: '0.8rem',
                  }}>
                    {username.charAt(0).toUpperCase()}
                  </span>
                  <span style={{ fontWeight: '600', fontSize: '0.875rem', color: 'var(--text-charcoal)' }}>
                    {username}
                  </span>
                </span>
                <LogoutButton />
              </div>
            </header>

            <div style={{ padding: '32px' }}>
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
