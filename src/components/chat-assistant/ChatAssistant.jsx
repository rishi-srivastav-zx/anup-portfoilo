'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { ASSISTANT_CONFIG } from './config';
import useChatAssistant from './hooks/useChatAssistant';
import ChatWindow from './components/ChatWindow';
import Launcher from './components/Launcher';
import Teaser from './components/Teaser';
import ProjectInquiryModal from '@/app/blog/components/ProjectInquiryModal';

const ChatAssistant = ({ config = ASSISTANT_CONFIG }) => {
  const router = useRouter();
  const chat = useChatAssistant(config, {
    routerPush: (path) => router?.push(path),
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

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

export default ChatAssistant;
