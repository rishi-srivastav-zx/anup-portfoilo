import { RotateCcw } from 'lucide-react';
import { MinusIcon } from './Icons';

const ChatHeader = ({ name, status, logo, onClose, onReset }) => (
  <div className="flex shrink-0 items-center gap-3 border-b border-line bg-gradient-to-b from-[#1d1710] to-panel px-4 py-3.5 select-none">
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-gold/50 bg-ink">
      <img src={logo} alt="" className="w-7" />
    </div>
    <div className="min-w-0 flex-1">
      <p className="truncate font-display text-lg font-semibold leading-tight text-bone">{name}</p>
      <p className="flex items-center gap-1.5 text-xs text-mute">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
        {status}
      </p>
    </div>
    <div className="flex items-center gap-1">
      {typeof onReset === 'function' && (
        <button
          type="button"
          aria-label="Start new conversation"
          title="Start new conversation"
          onClick={onReset}
          className="flex h-8 w-8 items-center justify-center rounded-full text-mute hover:bg-line hover:text-gold focus:outline-none focus-visible:ring-2 focus-visible:ring-gold transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      )}
      <button
        type="button"
        aria-label="Close chat"
        onClick={onClose}
        className="flex h-8 w-8 items-center justify-center rounded-full text-mute hover:bg-line hover:text-gold focus:outline-none focus-visible:ring-2 focus-visible:ring-gold transition-colors"
      >
        <MinusIcon />
      </button>
    </div>
  </div>
);

export default ChatHeader;
