'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter, usePathname } from 'next/navigation';
import { ASSISTANT_CONFIG } from './config';
import useChatAssistant from './hooks/useChatAssistant';
import ChatWindow from './components/ChatWindow';
import Launcher from './components/Launcher';
import Teaser from './components/Teaser';
import ProjectInquiryModal from '@/app/blog/components/ProjectInquiryModal';

const ChatAssistantContent = ({ config }) => {
  const router = useRouter();
  const chat = useChatAssistant(config, {
    routerPush: (path) => router?.push(path),
  });

  return createPortal(
    <>
      {chat.showTeaser && <Teaser text={config.teaser} onClose={chat.hideTeaser} />}
      <Launcher open={chat.open} logo={config.logo} onClick={chat.toggle} />
      {chat.open && <ChatWindow config={config} chat={chat} />}
      <ProjectInquiryModal
        isOpen={chat.isContactModalOpen}
        onClose={() => chat.setContactModalOpen(false)}
      />
    </>,
    document.body
  );
};

const ChatAssistant = ({ config = ASSISTANT_CONFIG }) => {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;
  if (pathname?.startsWith('/dashboard')) return null;

  return <ChatAssistantContent config={config} />;
};

export default ChatAssistant;
