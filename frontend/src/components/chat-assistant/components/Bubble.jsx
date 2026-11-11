import ActionButtons from './ActionButtons';

const STYLES = {
  bot: 'self-start rounded-bl-sm border border-line bg-[#1b160f] text-bone',
  user: 'self-end rounded-br-sm bg-gold text-ink',
};

const Bubble = ({ from = 'bot', actions = [], onExecuteAction, children }) => (
  <div className={`max-w-[88%] animate-msg rounded-2xl px-3.5 py-2.5 ${STYLES[from]}`}>
    <div className="whitespace-pre-line leading-relaxed">{children}</div>
    {from === 'bot' && actions && actions.length > 0 && (
      <ActionButtons actions={actions} onExecuteAction={onExecuteAction} />
    )}
  </div>
);

export default Bubble;
