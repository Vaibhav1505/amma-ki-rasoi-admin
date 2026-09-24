// Server-only. Reads business inboxes over IMAP for the admin "Messages"
// module, and normalizes every message into one shape so the UI (and any
// future non-email channel, like WhatsApp) can render a single merged
// inbox without caring where a message actually came from:
//
//   { channel, accountId, accountLabel, uid, from, subject, date, isRead }
//
// Today there's one configured account — the Gmail App Password already
// used by the storefront to send order-alert emails (see
// amma_ki_rasoi/lib/orderNotification.js; Gmail App Passwords authenticate
// both SMTP-send and IMAP-read on the same account). EMAIL_ACCOUNTS below
// is a *list* on purpose: adding the next mailbox — a second Gmail inbox,
// or support@ammakirasoi.com once that's hosted somewhere — is adding one
// entry here plus its two env vars. Every function in this file already
// loops over every *configured* entry (the ones whose env vars are set)
// and merges the results; nothing else needs to change.
//
// A non-IMAP channel (WhatsApp, a contact-form table in MongoDB, etc.)
// doesn't belong in this file — that'd be a sibling module (e.g.
// lib/whatsappMessages.js) returning the same shape above, merged with
// this file's output wherever the combined inbox gets assembled (today
// that's app/(dashboard)/messages/page.js — see the comment there).
//
// Never import this from a Client Component: `imapflow` and `mailparser`
// use Node networking/stream internals that don't exist in the browser
// (the same class of bug the async_hooks fix in stockThreshold.js exists
// to avoid — see that file's comment for the full story).

import { ImapFlow } from 'imapflow';
import { simpleParser } from 'mailparser';
import sanitizeHtml from 'sanitize-html';

const EMAIL_ACCOUNTS = [
  {
    id: 'gmail-support',
    label: 'Gmail — Support',
    host: 'imap.gmail.com',
    port: 993,
    secure: true,
    emailEnv: 'SMTP_EMAIL',
    passwordEnv: 'SMTP_APP_PASSWORD'
  }

  // Add the next mailbox here once it's ready. Example, once
  // support@ammakirasoi.com is hosted somewhere (Google Workspace, Zoho
  // Mail, cPanel, ...) — fill in that provider's IMAP host and add
  // BUSINESS_EMAIL / BUSINESS_EMAIL_PASSWORD to both .env.local files and
  // ENV_VARS.md, same pattern as SMTP_EMAIL / SMTP_APP_PASSWORD:
  //
  // {
  //   id: 'business-support',
  //   label: 'support@ammakirasoi.com',
  //   host: '<that provider's IMAP host>',
  //   port: 993,
  //   secure: true,
  //   emailEnv: 'BUSINESS_EMAIL',
  //   passwordEnv: 'BUSINESS_EMAIL_PASSWORD'
  // },
];

function isConfigured(acc) {
  return Boolean(process.env[acc.emailEnv] && process.env[acc.passwordEnv]);
}

function configuredAccounts() {
  return EMAIL_ACCOUNTS.filter(isConfigured);
}

function getAccount(accountId) {
  const acc = EMAIL_ACCOUNTS.find(a => a.id === accountId);
  if (!acc) throw new Error(`Unknown mail account "${accountId}".`);
  if (!isConfigured(acc)) {
    throw new Error(
      `${acc.label}: ${acc.emailEnv} / ${acc.passwordEnv} are not set in .env.local — see ENV_VARS.md ("Admin app, reading the inbox").`
    );
  }
  return acc;
}

function getClient(acc) {
  return new ImapFlow({
    host: acc.host,
    port: acc.port,
    secure: acc.secure,
    auth: {
      user: process.env[acc.emailEnv],
      pass: process.env[acc.passwordEnv]
    },
    logger: false
  });
}

function formatAddress(addr) {
  if (!addr) return 'Unknown sender';
  return addr.name ? `${addr.name} <${addr.address}>` : addr.address;
}

// Sanitizes email HTML before it's ever handed to a page for rendering.
// Email HTML is attacker-controlled content (anyone who can email a
// configured inbox can hand this function their HTML) and mailparser does
// not sanitize — a raw <script> or onerror= handler in an email would run
// in the admin dashboard's session if rendered as-is. Keeping the
// sanitize call in this file, not the page component, means every caller
// gets it "for free" instead of relying on each render site to remember —
// including whichever account/provider the message came from.
function sanitizeEmailHtml(html) {
  if (!html) return null;
  return sanitizeHtml(html, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'style']),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      '*': ['style', 'class', 'align', 'width', 'height'],
      img: ['src', 'alt', 'width', 'height'],
      a: ['href', 'name', 'target']
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    transformTags: {
      a: sanitizeHtml.simpleTransform('a', { target: '_blank', rel: 'noopener noreferrer' })
    }
  });
}

// Fetches the most recent `limit` messages from one account's INBOX,
// tagged with that account's id/label so a merged multi-account inbox can
// still tell messages apart (and so fetchEmailBody knows which mailbox to
// reconnect to later).
async function fetchRecentFromAccount(acc, limit) {
  const client = getClient(acc);
  await client.connect();
  try {
    const lock = await client.getMailboxLock('INBOX');
    try {
      const total = client.mailbox.exists;
      if (!total) return [];

      const start = Math.max(1, total - limit + 1);
      const messages = [];
      for await (const msg of client.fetch(`${start}:*`, { envelope: true, flags: true, uid: true })) {
        messages.push({
          channel: 'email',
          accountId: acc.id,
          accountLabel: acc.label,
          uid: msg.uid,
          subject: msg.envelope?.subject || '(no subject)',
          from: formatAddress(msg.envelope?.from?.[0]),
          date: msg.envelope?.date ? new Date(msg.envelope.date).toISOString() : null,
          isRead: msg.flags?.has('\\Seen') || false
        });
      }
      return messages;
    } finally {
      lock.release();
    }
  } finally {
    await client.logout();
  }
}

// Fetches and merges the most recent `limit` messages across every
// *configured* email account, newest first. An account with no env vars
// set is silently skipped — that's "not connected yet", not an error. An
// account that IS configured but fails to connect (bad password, network,
// provider outage) reports its error in `errors` without blanking out
// whatever the other configured accounts returned successfully.
export async function fetchRecentEmails({ limit = 30 } = {}) {
  const accounts = configuredAccounts();
  if (accounts.length === 0) {
    throw new Error(
      'No email account is configured — see ENV_VARS.md ("Admin app, reading the inbox").'
    );
  }

  const settled = await Promise.allSettled(
    accounts.map(acc => fetchRecentFromAccount(acc, limit))
  );

  const messages = [];
  const errors = [];
  settled.forEach((result, i) => {
    if (result.status === 'fulfilled') {
      messages.push(...result.value);
    } else {
      errors.push({
        accountId: accounts[i].id,
        accountLabel: accounts[i].label,
        message: result.reason?.message || 'Unknown error'
      });
    }
  });

  messages.sort((a, b) => new Date(b.date) - new Date(a.date));
  return { messages: messages.slice(0, limit), errors };
}

// Fetches and parses the full body of one message by account + UID, and
// marks it \Seen (the one place in this file that mutates a mailbox — it
// only flips the read flag, it never deletes or moves anything).
export async function fetchEmailBody(accountId, uid) {
  const acc = getAccount(accountId);
  const client = getClient(acc);
  await client.connect();
  try {
    const lock = await client.getMailboxLock('INBOX');
    try {
      const raw = await client.download(String(uid), undefined, { uid: true });
      if (!raw) throw new Error(`Message ${uid} not found — it may have been deleted or moved.`);
      const parsed = await simpleParser(raw.content);

      await client.messageFlagsAdd(String(uid), ['\\Seen'], { uid: true });

      return {
        channel: 'email',
        accountId: acc.id,
        accountLabel: acc.label,
        uid,
        subject: parsed.subject || '(no subject)',
        from: parsed.from?.text || 'Unknown sender',
        to: parsed.to?.text || '',
        date: parsed.date ? parsed.date.toISOString() : null,
        text: parsed.text || '',
        html: sanitizeEmailHtml(parsed.html || null)
      };
    } finally {
      lock.release();
    }
  } finally {
    await client.logout();
  }
}
