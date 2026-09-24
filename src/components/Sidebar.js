'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home, Package, ShoppingBag, Wheat, Building2, Users, Truck, Printer,
  Wallet, BarChart3, PartyPopper, Megaphone, Settings, Bell, Mail
} from 'lucide-react';
import LogoutButton from '@/components/LogoutButton';

const navLinks = [
  { href: '/',              label: 'Home',          icon: Home },
  { href: '/orders',        label: 'Orders',        icon: Package },
  { href: '/messages',      label: 'Messages',      icon: Mail },
  { href: '/products',      label: 'Products',      icon: ShoppingBag },
  { href: '/raw-materials', label: 'Raw Materials', icon: Wheat },
  { href: '/suppliers',     label: 'Suppliers',     icon: Building2 },
  { href: '/customers',     label: 'Customers',     icon: Users },
  { href: '/shipping',      label: 'Shipping',      icon: Truck },
  { href: '/print',         label: 'Print',         icon: Printer },
  { href: '/finance',       label: 'Finance',       icon: Wallet },
  { href: '/reports',       label: 'Reports',       icon: BarChart3 },
  { href: '/festivals',     label: 'Festivals',     icon: PartyPopper },
  { href: '/marketing',     label: 'Marketing',     icon: Megaphone },
  { href: '/settings',      label: 'Settings',      icon: Settings },
];

export default function Sidebar({ username, currentDate }) {
  const pathname = usePathname();

  const isActive = (href) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- small fixed-size logo in a non-Image-optimized dashboard shell */}
        <img src="/logo.jpeg" alt="" width={22} height={22} style={{ borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
        Amma Ki Rasoi
      </div>
      <nav className="sidebar-nav">
        {navLinks.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`nav-item ${isActive(href) ? 'nav-item-active' : ''}`}
          >
            <Icon size={18} strokeWidth={2} />
            {label}
          </Link>
        ))}
      </nav>

      {/* Moved here from the old topbar: date, notifications, account, and
          logout all live in the sidebar now instead of a separate header
          row, since the sidebar already carries the brand identity. */}
      {username && (
        <div className="sidebar-footer">
          <div className="sidebar-footer-row">
            <span className="sidebar-footer-date">{currentDate}</span>
            <Bell size={13} strokeWidth={2} className="sidebar-footer-bell" />
          </div>
          <div className="sidebar-footer-user">
            <div className="sidebar-footer-identity">
              <span className="sidebar-avatar">{username.charAt(0).toUpperCase()}</span>
              <span className="sidebar-username">{username}</span>
            </div>
            <div className="sidebar-footer-logout">
              <LogoutButton />
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
