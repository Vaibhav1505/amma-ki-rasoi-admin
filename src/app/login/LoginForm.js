'use client';

import { useActionState } from 'react';
import { login } from '@/app/actions/auth';
import { AlertTriangle } from 'lucide-react';

export default function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined);

  return (
    <form action={action} style={{ width: '100%' }}>
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Username
        </label>
        <input
          id="username"
          name="username"
          type="text"
          required
          autoComplete="username"
          autoFocus
          placeholder="amma"
          style={{
            width: '100%', padding: '12px 16px',
            backgroundColor: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: '8px', color: 'white',
            fontSize: '1rem', outline: 'none',
            transition: 'border-color 0.2s',
            fontFamily: 'inherit',
          }}
          onFocus={e => e.target.style.borderColor = 'rgba(193,68,14,0.8)'}
          onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.15)'}
        />
      </div>

      <div style={{ marginBottom: '24px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          placeholder="••••••••••••"
          style={{
            width: '100%', padding: '12px 16px',
            backgroundColor: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: '8px', color: 'white',
            fontSize: '1rem', outline: 'none',
            transition: 'border-color 0.2s',
            fontFamily: 'inherit',
          }}
          onFocus={e => e.target.style.borderColor = 'rgba(193,68,14,0.8)'}
          onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.15)'}
        />
      </div>

      {state?.error && (
        <div style={{
          padding: '12px 16px', marginBottom: '20px',
          backgroundColor: 'rgba(166,28,0,0.3)',
          border: '1px solid rgba(166,28,0,0.6)',
          borderRadius: '8px', color: '#FCA5A5',
          fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '8px',
        }}>
          <AlertTriangle size={15} strokeWidth={2} /> {state.error}
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        style={{
          width: '100%', padding: '14px',
          backgroundColor: pending ? 'rgba(193,68,14,0.5)' : 'var(--primary-terracotta, #C1440E)',
          color: 'white', border: 'none', borderRadius: '8px',
          fontSize: '1rem', fontWeight: '700', cursor: pending ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s', fontFamily: 'inherit',
          letterSpacing: '0.02em',
        }}
      >
        {pending ? '⏳ Signing in...' : 'Sign In →'}
      </button>
    </form>
  );
}
