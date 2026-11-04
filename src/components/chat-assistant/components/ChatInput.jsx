import { SendIcon, SpinnerIcon } from './Icons';

const ChatInput = ({
  inputRef,
  value = '',
  placeholder = 'Type a message...',
  onChange,
  onSubmit,
  typing = false,
  cooldownRemaining = 0,
}) => {
  const isBlocked = typing || cooldownRemaining > 0;
  const isSendDisabled = isBlocked || !value.trim();

  return (
    <div className="flex shrink-0 flex-col border-t border-line bg-ink/60">
      {cooldownRemaining > 0 && (
        <div className="flex items-center justify-between border-b border-amber-500/20 bg-amber-500/10 px-4 py-1.5 text-xs text-amber-300">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
            Rate limit cooldown active
          </span>
          <span className="font-mono font-semibold">
            {cooldownRemaining}s
          </span>
        </div>
      )}
      <form onSubmit={onSubmit} className="flex items-center gap-2 px-3 py-3">
        <label htmlFor="chat-msg" className="sr-only">
          Message
        </label>
        <input
          id="chat-msg"
          ref={inputRef}
          type="text"
          autoComplete="off"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={cooldownRemaining > 0 ? `Please wait ${cooldownRemaining}s...` : placeholder}
          className="min-w-0 flex-1 rounded-full border border-line bg-panel px-4 py-2.5 text-sm text-bone placeholder:text-mute focus:border-gold/60 focus:outline-none disabled:opacity-60"
        />
        <button
          type="submit"
          aria-label={typing ? 'Sending message' : cooldownRemaining > 0 ? `Wait ${cooldownRemaining}s` : 'Send'}
          disabled={isSendDisabled}
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition focus:outline-none focus-visible:ring-2 focus-visible:ring-goldsoft focus-visible:ring-offset-2 focus-visible:ring-offset-panel ${
            isSendDisabled
              ? 'cursor-not-allowed bg-gold/40 text-ink/60 opacity-60'
              : 'bg-gold text-ink hover:bg-goldsoft shadow-sm'
          }`}
        >
          {typing ? (
            <SpinnerIcon className="h-4 w-4 animate-spin text-ink" />
          ) : cooldownRemaining > 0 ? (
            <span className="text-xs font-mono font-bold text-ink">{cooldownRemaining}s</span>
          ) : (
            <SendIcon />
          )}
        </button>
      </form>
    </div>
  );
};

export default ChatInput;
