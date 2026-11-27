'use client';

import { useEffect, useRef, useState } from 'react';
import ChatHeader from './ChatHeader';
import ChatInput from './ChatInput';
import MessageList from './MessageList';

const MOBILE_BREAKPOINT = 640;
const KEYBOARD_THRESHOLD = 120;

const ChatWindow = ({ config, chat }) => {
  const [keyboardLayout, setKeyboardLayout] = useState(null);
  const baselineHeightRef = useRef(0);
  const lastWidthRef = useRef(0);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.visualViewport) return;

    const vv = window.visualViewport;
    baselineHeightRef.current = Math.max(window.innerHeight, vv.height);
    lastWidthRef.current = vv.width;

    const updateLayout = () => {
      const isMobile = window.innerWidth < MOBILE_BREAKPOINT;
      if (!isMobile) {
        setKeyboardLayout(null);
        return;
      }

      // Reset baseline on orientation/width change
      if (Math.abs(vv.width - lastWidthRef.current) > 40) {
        lastWidthRef.current = vv.width;
        baselineHeightRef.current = Math.max(window.innerHeight, vv.height);
      } else if (vv.height > baselineHeightRef.current) {
        baselineHeightRef.current = vv.height;
      }

      const heightDrop = baselineHeightRef.current - vv.height;
      if (heightDrop > KEYBOARD_THRESHOLD) {
        const availableHeight = Math.max(220, vv.height - 16);
        setKeyboardLayout({
          top: Math.round(vv.offsetTop + 8),
          height: Math.round(availableHeight),
          maxHeight: Math.round(availableHeight),
          maxWidth: Math.round(vv.width - 32),
        });
        if (chat.listRef?.current) {
          chat.listRef.current.scrollTop = chat.listRef.current.scrollHeight;
        }
      } else {
        setKeyboardLayout(null);
      }
    };

    updateLayout();
    vv.addEventListener('resize', updateLayout);
    vv.addEventListener('scroll', updateLayout);
    window.addEventListener('resize', updateLayout);

    return () => {
      vv.removeEventListener('resize', updateLayout);
      vv.removeEventListener('scroll', updateLayout);
      window.removeEventListener('resize', updateLayout);
    };
  }, [chat.listRef]);

  const windowStyle = keyboardLayout
    ? {
        position: 'fixed',
        right: 16,
        top: keyboardLayout.top,
        bottom: 'auto',
        width: 376,
        height: keyboardLayout.height,
        maxWidth: keyboardLayout.maxWidth,
        maxHeight: keyboardLayout.maxHeight,
        overscrollBehavior: 'contain',
      }
    : {
        position: 'fixed',
        right: 16,
        bottom: 104,
        width: 376,
        height: 544,
        maxWidth: 'calc(100vw - 32px)',
        maxHeight: 'calc(100dvh - 136px)',
        overscrollBehavior: 'contain',
      };

  return (
    <section
      role="dialog"
      aria-label={`${config.name} assistant`}
      data-lenis-prevent="true"
      data-lenis-prevent-wheel="true"
      data-lenis-prevent-touch="true"
      onWheel={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
      style={windowStyle}
      className="z-[9990] flex animate-rise flex-col overflow-hidden rounded-2xl border border-gold/25 bg-panel font-body text-base font-normal text-bone shadow-[0_30px_80px_rgba(0,0,0,.7)] overscroll-contain"
    >
      <ChatHeader
        name={config.name}
        status={config.status}
        logo={config.logo}
        onClose={chat.close}
        onReset={chat.resetConversation}
      />
      <MessageList
        listRef={chat.listRef}
        welcome={config.welcome}
        chips={config.chips}
        showChips={chat.showChips}
        messages={chat.messages}
        typing={chat.typing}
        onChip={chat.send}
        onExecuteAction={chat.executeAction}
      />
      <ChatInput
        inputRef={chat.inputRef}
        value={chat.text}
        placeholder={config.placeholder}
        onChange={chat.setText}
        onSubmit={chat.submit}
        typing={chat.typing}
        cooldownRemaining={chat.cooldownRemaining}
      />
    </section>
  );
};

export default ChatWindow;
