'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navLinks = [
  { href: '/',          label: '🏠 Home' },
  { href: '/orders',    label: '📦 Orders' },
  { href: '/products',  label: '🛍️ Products' },
  { href: '/customers', label: '👥 Customers' },
  { href: '/shipping',  label: '🚚 Shipping' },
  { href: '/print',     label: '🖨️ Print' },
  { href: '/finance',   label: '💰 Finance' },
  { href: '/reports',   label: '📊 Reports' },
  { href: '/festivals', label: '🎉 Festivals' },
  { href: '/marketing', label: '📣 Marketing' },
  { href: '/settings',  label: '⚙️ Settings' },
];

export default function Sidebar() {
  const pathname = usePathname();

  const isActive = (href) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        🏺 Amma Ki Rasoi
      </div>
      <nav className="sidebar-nav">
        {navLinks.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={`nav-item ${isActive(href) ? 'nav-item-active' : ''}`}
          >
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
