import Link from 'next/link';
import { fetchRecentEmails } from '@/lib/mail';
import { Mail, AlertCircle } from 'lucide-react';

export const metadata = {
  title: 'Messages | Amma Ki Rasoi Admin'
};

// Always hit every configured channel fresh — this is a live inbox, not
// content to cache.
export const dynamic = 'force-dynamic';

// Merges every configured channel into one inbox. Today that's only
// fetchRecentEmails() (one or more IMAP accounts — see lib/mail.js, whose
// EMAIL_ACCOUNTS list is where the next mailbox gets added). When a
// non-email channel is added later (WhatsApp, a contact-form table), its
// fetcher should return the same
//   { channel, accountId, accountLabel, uid, from, subject, date, isRead }
// shape lib/mail.js already uses, get pushed into `messages` alongside
// email below, and re-sorted — nothing else on this page should need to
// change.
async function fetchInbox({ limit }) {
  const messages = [];
  const errors = [];

  try {
    const email = await fetchRecentEmails({ limit });
    messages.push(...email.messages);
    errors.push(...email.errors);
  } catch (err) {
    errors.push({ accountId: null, accountLabel: 'Email', message: err.message });
  }

  messages.sort((a, b) => new Date(b.date) - new Date(a.date));
  return { messages: messages.slice(0, limit), errors };
}

export default async function MessagesPage() {
  const { messages, errors } = await fetchInbox({ limit: 30 });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h1 className="page-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Mail size={22} strokeWidth={2} /> Messages
        </h1>
        <span className="text-muted" style={{ fontSize: '0.8rem' }}>latest {messages.length}</span>
      </div>

      {errors.length > 0 && (
        <div className="card" style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {errors.map(err => (
            <div key={err.accountId || err.accountLabel} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <AlertCircle size={18} strokeWidth={2} color="var(--danger-red)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <div style={{ fontWeight: 600, color: 'var(--danger-red)' }}>
                  {err.accountLabel}: couldn&apos;t load
                </div>
                <div className="text-muted" style={{ fontSize: '0.8rem', marginTop: '2px' }}>{err.message}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {messages.length === 0 ? (
        errors.length === 0 && (
          <div className="card" style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
            No messages yet.
          </div>
        )
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {messages.map(msg => (
            <Link
              key={`${msg.accountId}-${msg.uid}`}
              href={`/messages/${encodeURIComponent(`${msg.accountId}__${msg.uid}`)}`}
              className="message-row"
            >
              {!msg.isRead && <span className="message-unread-dot" title="Unread" />}
              <span className="message-row-from" style={{ fontWeight: msg.isRead ? 500 : 700 }}>
                {msg.from}
              </span>
              <span className="message-row-subject" style={{ fontWeight: msg.isRead ? 400 : 700 }}>
                {msg.subject}
              </span>
              <span className="message-row-account">{msg.accountLabel}</span>
              <span className="message-row-date data-font">
                {msg.date
                  ? new Date(msg.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
                  : ''}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
