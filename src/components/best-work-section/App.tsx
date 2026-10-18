/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useLayoutEffect } from 'react';
import { REFERENCE_STYLES } from './referenceStyles';
import { BEST_WORK_CONFIG } from './config/bestWorkConfig';
import { TransitProvider } from './context/TransitContext';
import { BestWorkSection } from './components/BestWorkSection';

function ensureReferenceStyles() {
  if (typeof document === 'undefined') return;
  if (!document.getElementById('bks-reference-styles')) {
    const styleEl = document.createElement('style');
    styleEl.id = 'bks-reference-styles';
    styleEl.textContent = REFERENCE_STYLES;
    document.head.appendChild(styleEl);
  }
}

ensureReferenceStyles();

export default function App() {
  useLayoutEffect(() => {
    ensureReferenceStyles();
  }, []);

  return (
    <TransitProvider config={BEST_WORK_CONFIG}>
      <BestWorkSection />
    </TransitProvider>
  );
}
