'use client';

import { logout } from '@/app/actions/auth';
import { useTransition } from 'react';
import { LogOut } from 'lucide-react';

export default function LogoutButton() {
  const [pending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      await logout();
    });
  };

  return (
    <button
      onClick={handleLogout}
      disabled={pending}
      style={{
        padding: '6px 14px',
        backgroundColor: 'transparent',
        border: '1px solid rgba(193,68,14,0.4)',
        borderRadius: '6px',
        color: 'var(--primary-terracotta)',
        fontWeight: '600',
        fontSize: '0.8rem',
        cursor: pending ? 'not-allowed' : 'pointer',
        fontFamily: 'inherit',
        transition: 'all 0.2s',
        opacity: pending ? 0.6 : 1,
        display: 'inline-flex', alignItems: 'center', gap: '6px',
      }}
      onMouseEnter={e => { if (!pending) { e.currentTarget.style.backgroundColor = 'rgba(193,68,14,0.08)'; } }}
      onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
    >
      <LogOut size={14} strokeWidth={2} />
      {pending ? '...' : 'Logout'}
    </button>
  );
}
