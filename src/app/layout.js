import "./globals.css";
import Sidebar from '@/components/Sidebar';
import { getSession } from '@/lib/session';

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
          <Sidebar username={username} currentDate={currentDate} />

          <main className="main-content">
            <div style={{ padding: '32px' }}>
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
