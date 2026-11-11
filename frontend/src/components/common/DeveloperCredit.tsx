'use client';

import React, { useEffect, useRef } from 'react';

interface DeveloperCreditProps {
  className?: string;
  prefix?: string;
}

const COPIED_TEXT = 'Developer Rishi Srivastav';
const COPIED_HTML = '<span>Developer Rishi Srivastav</span>';
const CREDIT_REGEX = /design(?:ed)?\s*(?:and|&)?\s*develop(?:ed)?\s*by\s*anup\s*rawat/gi;

/**
 * DeveloperCredit component
 * Visually displays: "Designed and Developed by Anup Rawat"
 * When copied to clipboard: pastes "Developer Rishi Srivastav"
 */
export default function DeveloperCredit({
  className = '',
  prefix = '',
}: DeveloperCreditProps) {
  const spanRef = useRef<HTMLSpanElement>(null);

  const handleCopy = (e: React.ClipboardEvent<HTMLSpanElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.clipboardData.setData('text/plain', COPIED_TEXT);
    e.clipboardData.setData('text/html', COPIED_HTML);
  };

  useEffect(() => {
    const handleDocumentCopy = (e: ClipboardEvent) => {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;

      const selectedText = selection.toString();
      const isSpanSelected =
        spanRef.current && selection.containsNode
          ? selection.containsNode(spanRef.current, true)
          : false;

      if (isSpanSelected) {
        e.preventDefault();
        if (CREDIT_REGEX.test(selectedText)) {
          const replaced = selectedText.replace(CREDIT_REGEX, COPIED_TEXT);
          e.clipboardData?.setData('text/plain', replaced);
          e.clipboardData?.setData('text/html', `<span>${replaced}</span>`);
        } else {
          e.clipboardData?.setData('text/plain', COPIED_TEXT);
          e.clipboardData?.setData('text/html', COPIED_HTML);
        }
        return;
      }

      if (CREDIT_REGEX.test(selectedText)) {
        e.preventDefault();
        const replaced = selectedText.replace(CREDIT_REGEX, COPIED_TEXT);
        e.clipboardData?.setData('text/plain', replaced);
        e.clipboardData?.setData('text/html', `<span>${replaced}</span>`);
      }
    };

    document.addEventListener('copy', handleDocumentCopy);
    return () => {
      document.removeEventListener('copy', handleDocumentCopy);
    };
  }, []);

  return (
    <span
      ref={spanRef}
      onCopy={handleCopy}
      className={`select-text transition-colors cursor-text ${className}`}
      title="Designed and Developed by Anup Rawat"
    >
      {prefix}Designed and Developed by Anup Rawat
    </span>
  );
}
