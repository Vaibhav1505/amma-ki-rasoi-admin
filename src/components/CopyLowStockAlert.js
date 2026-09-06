'use client';

import { useState } from 'react';
import { buildLowStockAlertMessage } from '@/lib/whatsapp';

export default function CopyLowStockAlert({ products }) {
  const [copied, setCopied] = useState(false);

  if (!products?.length) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(buildLowStockAlertMessage(products));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button onClick={handleCopy} className="btn" style={{ fontSize: '0.8rem' }}>
      {copied ? '✅ Copied!' : '📋 Copy WhatsApp Alert'}
    </button>
  );
}
