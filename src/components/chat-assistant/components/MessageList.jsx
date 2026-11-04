import Bubble from './Bubble';
import QuickReplies from './QuickReplies';
import TypingDots from './TypingDots';

const MessageList = ({
  listRef,
  welcome,
  chips,
  showChips,
  messages,
  typing,
  onChip,
  onExecuteAction,
}) => (
  <div
    ref={listRef}
    data-lenis-prevent="true"
    data-lenis-prevent-wheel="true"
    data-lenis-prevent-touch="true"
    aria-live="polite"
    tabIndex={0}
    onWheel={(e) => e.stopPropagation()}
    onTouchMove={(e) => e.stopPropagation()}
    style={{
      overscrollBehavior: 'contain',
      WebkitOverflowScrolling: 'touch',
    }}
    className="chat-scrollbar flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto overscroll-contain px-4 py-4 text-sm leading-relaxed focus:outline-none"
  >
    <Bubble>{welcome}</Bubble>
    {showChips && <QuickReplies chips={chips} onSelect={onChip} />}
    {messages.map((m, i) => (
      <div key={i} className="flex flex-col gap-2">
        <Bubble
          from={m.from}
          actions={m.actions}
          onExecuteAction={onExecuteAction}
        >
          {m.text}
        </Bubble>
        {/* Render dynamic contextual quick replies for the latest bot message */}
        {m.from === 'bot' &&
          i === messages.length - 1 &&
          Array.isArray(m.suggestions) &&
          m.suggestions.length > 0 && (
            <div className="pl-1">
              <QuickReplies chips={m.suggestions} onSelect={onChip} />
            </div>
          )}
      </div>
    ))}
    {typing && <TypingDots />}
  </div>
);

export default MessageList;
