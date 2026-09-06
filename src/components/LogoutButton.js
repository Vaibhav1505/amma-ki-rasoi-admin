'use client';

import { logout } from '@/app/actions/auth';
import { useTransition } from 'react';

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
      }}
      onMouseEnter={e => { if (!pending) { e.target.style.backgroundColor = 'rgba(193,68,14,0.08)'; } }}
      onMouseLeave={e => { e.target.style.backgroundColor = 'transparent'; }}
    >
      {pending ? '...' : '🚪 Logout'}
    </button>
  );
}
