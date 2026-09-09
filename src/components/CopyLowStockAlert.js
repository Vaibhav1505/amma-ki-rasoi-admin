'use client';

import { useState } from 'react';
import { buildLowStockAlertMessage } from '@/lib/whatsapp';
import { Copy, Check } from 'lucide-react';

export default function CopyLowStockAlert({ products }) {
  const [copied, setCopied] = useState(false);

  if (!products?.length) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(buildLowStockAlertMessage(products));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button onClick={handleCopy} className="btn" style={{ fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
      {copied ? <><Check size={14} strokeWidth={2} /> Copied!</> : <><Copy size={14} strokeWidth={2} /> Copy WhatsApp Alert</>}
    </button>
  );
}
