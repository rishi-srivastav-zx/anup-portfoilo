import { CloseIcon } from './Icons';

const Launcher = ({ open, logo, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={open ? 'Close chat assistant' : 'Open chat assistant'}
    aria-expanded={open}
    className="fixed bottom-5 right-4 z-[9990] h-16 w-16 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-goldsoft focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
  >
    <span className="absolute inset-0 animate-ping2 rounded-full border border-gold/60" />
    <span className="absolute inset-0 flex items-center justify-center rounded-full border border-gold/70 bg-[radial-gradient(circle_at_30%_25%,#2b2217,#0c0a08_70%)] shadow-[0_10px_30px_rgba(0,0,0,.6),0_0_0_4px_rgba(214,174,103,.08)] transition-transform duration-200 hover:scale-105">
      {open ? <CloseIcon className="h-6 w-6 text-gold" /> : <img src={logo} alt="" className="w-9" />}
    </span>
    {!open && (
      <span className="absolute right-0.5 top-0.5 h-3.5 w-3.5 rounded-full border-2 border-ink bg-emerald-400" />
    )}
  </button>
);

export default Launcher;
