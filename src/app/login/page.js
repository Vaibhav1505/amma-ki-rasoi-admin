import LoginForm from './LoginForm';
import { Lock } from 'lucide-react';

export const metadata = {
  title: 'Sign In | Amma Ki Rasoi Admin',
  description: 'Admin login for Amma Ki Rasoi internal dashboard',
};

export default function LoginPage() {
  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      backgroundColor: '#1A0F08',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Inter', sans-serif",
      position: 'relative',
      overflow: 'hidden',
    }}>

      {/* Background texture */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `
          radial-gradient(ellipse at 20% 50%, rgba(193,68,14,0.12) 0%, transparent 60%),
          radial-gradient(ellipse at 80% 20%, rgba(212,160,23,0.08) 0%, transparent 50%)
        `,
        pointerEvents: 'none',
      }} />

      {/* Decorative circles */}
      <div style={{ position: 'absolute', top: '-120px', right: '-120px', width: '400px', height: '400px', borderRadius: '50%', border: '1px solid rgba(193,68,14,0.15)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '260px', height: '260px', borderRadius: '50%', border: '1px solid rgba(193,68,14,0.1)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-100px', left: '-100px', width: '350px', height: '350px', borderRadius: '50%', border: '1px solid rgba(212,160,23,0.1)', pointerEvents: 'none' }} />

      {/* Login Card */}
      <div style={{
        width: '100%', maxWidth: '420px', margin: '24px',
        backgroundColor: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '16px',
        padding: '48px 40px',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
        position: 'relative', zIndex: 1,
      }}>

        {/* Logo / Brand */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{
            marginBottom: '16px',
            display: 'flex', justifyContent: 'center',
            filter: 'drop-shadow(0 0 20px rgba(193,68,14,0.4))',
          }}>
            {/* eslint-disable-next-line @next/next/no-img-element -- small fixed-size logo on a static login screen */}
            <img src="/logo.jpeg" alt="Amma Ki Rasoi" width={72} height={72} style={{ borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.15)' }} />
          </div>
          <h1 style={{
            color: 'white', fontSize: '1.5rem', fontWeight: '700',
            margin: '0 0 4px', fontFamily: "'DM Sans', sans-serif",
            letterSpacing: '-0.02em',
          }}>
            Amma Ki Rasoi
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', margin: 0, fontSize: '0.875rem' }}>
            घर के स्वाद की परंपरा
          </p>
          <div style={{
            marginTop: '16px', padding: '6px 14px',
            backgroundColor: 'rgba(193,68,14,0.15)',
            border: '1px solid rgba(193,68,14,0.3)',
            borderRadius: '20px', display: 'inline-block',
            color: '#E8956D', fontSize: '0.75rem', fontWeight: '600',
            letterSpacing: '0.08em', textTransform: 'uppercase',
          }}>
            Admin Dashboard
          </div>
        </div>

        <LoginForm />

        {/* Footer note */}
        <p style={{
          textAlign: 'center', marginTop: '24px', marginBottom: 0,
          color: 'rgba(255,255,255,0.2)', fontSize: '0.75rem',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
        }}>
          <Lock size={12} strokeWidth={2} /> Secure access · Amma Ki Rasoi Internal
        </p>
      </div>
    </div>
  );
}
