const QuickReplies = ({ chips, onSelect }) => (
  <div className="flex flex-wrap gap-2 pt-1">
    {chips.map((c) => (
      <button
        key={c}
        type="button"
        onClick={() => onSelect(c)}
        className="rounded-full border border-gold/40 px-3 py-1.5 text-xs text-goldsoft transition hover:bg-gold hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
      >
        {c}
      </button>
    ))}
  </div>
);

export default QuickReplies;
