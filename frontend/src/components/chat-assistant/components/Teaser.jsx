import { CloseIcon } from './Icons';

const Teaser = ({ text, onClose }) => (
  <div className="fixed bottom-[6.25rem] right-4 z-[9989] max-w-[15rem] font-body font-normal animate-rise">
    <div className="relative rounded-2xl rounded-br-sm border border-gold/30 bg-panel py-3 pl-4 pr-9 text-sm leading-snug text-bone shadow-[0_12px_40px_rgba(0,0,0,.55)]">
      {text}
      <button
        type="button"
        aria-label="Close message"
        onClick={onClose}
        className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full text-mute hover:text-gold focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
      >
        <CloseIcon className="h-3.5 w-3.5" />
      </button>
    </div>
  </div>
);

export default Teaser;
