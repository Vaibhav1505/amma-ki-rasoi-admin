import Link from 'next/link';
import { fetchEmailBody } from '@/lib/mail';
import { ArrowLeft, AlertCircle } from 'lucide-react';

export const dynamic = 'force-dynamic';

// This folder is still named [uid] from before the Messages module had to
// support more than one mailbox. Renaming it to something like
// [messageId] would make Next.js reject the build ("different slug names
// for the same dynamic path") unless the old folder is deleted first, and
// nothing here can delete files on the user's machine — so the route
// param is still literally called `uid`, even though the value it
// actually carries now is a composite "accountId__uid" (see the Link href
// built in ../page.js). Parse it apart immediately below and don't let
// the stale name leak any further than this.
function parseMessageParam(raw) {
  const separatorIndex = raw.lastIndexOf('__');
  if (separatorIndex === -1) return { accountId: null, uid: raw };
  return {
    accountId: raw.slice(0, separatorIndex),
    uid: raw.slice(separatorIndex + 2)
  };
}

export default async function MessageDetailPage({ params }) {
  const { uid: rawId } = await params;
  const { accountId, uid } = parseMessageParam(rawId);

  let email = null;
  let error = null;
  if (!accountId) {
    error = 'Invalid message link — open it from the Messages list instead of a bookmarked/old URL.';
  } else {
    try {
      email = await fetchEmailBody(accountId, uid);
    } catch (err) {
      error = err.message;
    }
  }

  return (
    <div>
      <Link
        href="/messages"
        className="btn"
        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '24px' }}
      >
        <ArrowLeft size={14} strokeWidth={2} /> Back to Messages
      </Link>

      {error ? (
        <div className="card" style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
          <AlertCircle size={18} strokeWidth={2} color="var(--danger-red)" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <div style={{ fontWeight: 600, color: 'var(--danger-red)' }}>Couldn&apos;t load this message</div>
            <div className="text-muted" style={{ fontSize: '0.8rem', marginTop: '2px' }}>{error}</div>
          </div>
        </div>
      ) : (
        <div className="card">
          <div style={{ borderBottom: '1px solid var(--border-cream)', paddingBottom: '16px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 700 }}>
                {email.subject}
              </h1>
              <span className="message-row-account">{email.accountLabel}</span>
            </div>
            <div className="text-muted" style={{ fontSize: '0.875rem', lineHeight: '1.6' }}>
              <div><strong style={{ color: 'var(--text-charcoal)' }}>From:</strong> {email.from}</div>
              {email.to && <div><strong style={{ color: 'var(--text-charcoal)' }}>To:</strong> {email.to}</div>}
              {email.date && (
                <div>
                  <strong style={{ color: 'var(--text-charcoal)' }}>Date:</strong>{' '}
                  {new Date(email.date).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                </div>
              )}
            </div>
          </div>

          {/* email.html is already sanitized in lib/mail.js before it ever
              gets here — never render parsed email HTML that hasn't been
              through that step. */}
          {email.html ? (
            <div className="message-body-html" dangerouslySetInnerHTML={{ __html: email.html }} />
          ) : (
            <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: '0.9rem', lineHeight: '1.7', margin: 0 }}>
              {email.text || '(empty message)'}
            </pre>
          )}

          {/* Reply UI intentionally left out of v1 — read-only inbox for
              now. lib/mail.js already returns from/to/subject/date so a
              future sendReply() (mirroring orderNotification.js's
              nodemailer transporter, one per account) can slot in here
              without reworking this page. */}
        </div>
      )}
    </div>
  );
}
