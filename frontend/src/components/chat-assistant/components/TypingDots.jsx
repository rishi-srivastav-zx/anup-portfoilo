const DELAYS = [0, 150, 300];

const TypingDots = () => (
  <div className="flex max-w-[5rem] animate-msg items-center gap-1 self-start rounded-2xl rounded-bl-sm border border-line bg-[#1b160f] px-4 py-3.5">
    {DELAYS.map((d) => (
      <span
        key={d}
        style={{ animationDelay: `${d}ms` }}
        className="h-1.5 w-1.5 animate-bounce rounded-full bg-gold"
      />
    ))}
  </div>
);

export default TypingDots;
