'use client';

import React, { useState } from 'react';
import { ArrowUpRight, Play, Mail, Compass, Layers, CheckCircle, SkipForward } from 'lucide-react';
import { ACTION_TYPES } from '../actionExecutor/actionExecutor';

const getActionIcon = (type) => {
  switch (type) {
    case ACTION_TYPES.SUBMIT_LEAD:
      return <CheckCircle className="w-3.5 h-3.5 shrink-0 text-emerald-400" />;
    case ACTION_TYPES.EDIT_LEAD:
      return <Layers className="w-3.5 h-3.5 shrink-0 text-amber-300" />;
    case ACTION_TYPES.CANCEL_LEAD:
      return <Mail className="w-3.5 h-3.5 shrink-0 text-rose-400" />;
    case ACTION_TYPES.SKIP_LEAD_FIELD:
      return <SkipForward className="w-3.5 h-3.5 shrink-0 text-amber-200/80" />;
    case ACTION_TYPES.PLAY_SHOWREEL:
      return <Play className="w-3.5 h-3.5 fill-current shrink-0" />;
    case ACTION_TYPES.OPEN_CONTACT_MODAL:
      return <Mail className="w-3.5 h-3.5 shrink-0" />;
    case ACTION_TYPES.OPEN_PROJECT:
      return <Layers className="w-3.5 h-3.5 shrink-0" />;
    case ACTION_TYPES.SCROLL_TO_TOP:
      return <Compass className="w-3.5 h-3.5 shrink-0" />;
    case ACTION_TYPES.NAVIGATE_TO_ROUTE:
    case ACTION_TYPES.NAVIGATE_TO_SECTION:
    default:
      return <ArrowUpRight className="w-3.5 h-3.5 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />;
  }
};

export default function ActionButtons({ actions = [], onExecuteAction }) {
  const [feedback, setFeedback] = useState(null);
  const [clickedMap, setClickedMap] = useState({});

  if (!Array.isArray(actions) || actions.length === 0) return null;

  const handleClick = async (action, idx) => {
    setClickedMap((prev) => ({ ...prev, [idx]: true }));
    setFeedback(null);

    if (typeof onExecuteAction === 'function') {
      const result = await onExecuteAction(action);
      if (result && !result.success) {
        setFeedback(result.message || 'Requested action could not be completed.');
        setTimeout(() => setFeedback(null), 3500);
      }
    }
  };

  return (
    <div className="mt-2.5 flex flex-col gap-1.5 w-full">
      <div className="flex flex-wrap gap-2">
        {actions.map((act, idx) => {
          const isClicked = clickedMap[idx];
          return (
            <button
              key={`${act.type}-${act.target}-${idx}`}
              type="button"
              onClick={() => handleClick(act, idx)}
              className={`group inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-all duration-200 shadow-sm select-none ${
                isClicked
                  ? 'bg-gold/15 text-gold border-gold/40'
                  : 'bg-[#231c15] text-[#F4EDE4] border-gold/30 hover:bg-gold hover:text-ink hover:border-gold'
              }`}
            >
              {isClicked ? (
                <CheckCircle className="w-3.5 h-3.5 text-gold shrink-0" />
              ) : (
                getActionIcon(act.type)
              )}
              <span>{act.label}</span>
            </button>
          );
        })}
      </div>

      {feedback && (
        <div className="text-[11px] text-amber-300/90 bg-amber-950/40 border border-amber-500/20 px-2.5 py-1 rounded-md animate-msg">
          {feedback}
        </div>
      )}
    </div>
  );
}

