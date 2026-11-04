import ChatHeader from './ChatHeader';
import ChatInput from './ChatInput';
import MessageList from './MessageList';

const ChatWindow = ({ config, chat }) => (
  <section
    role="dialog"
    aria-label={`${config.name} assistant`}
    data-lenis-prevent="true"
    data-lenis-prevent-wheel="true"
    data-lenis-prevent-touch="true"
    onWheel={(e) => e.stopPropagation()}
    onTouchMove={(e) => e.stopPropagation()}
    style={{
      position: 'fixed',
      right: 16,
      bottom: 104,
      width: 376,
      height: 544,
      maxWidth: 'calc(100vw - 32px)',
      maxHeight: 'calc(100dvh - 136px)',
      overscrollBehavior: 'contain',
    }}
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

export default ChatWindow;
