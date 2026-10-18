import React from 'react';
import { useTransit } from '../context/TransitContext';

export const PlatformSurface: React.FC = () => {
  const { config } = useTransit();
  const { platform } = config;

  return (
    <div className="w-full h-[8vh] bg-[#D8D4CC] border-t-[3px] border-[#0B0B0B] relative flex flex-col justify-start z-10 overflow-hidden shadow-[0_-4px_20px_rgba(11,11,11,0.08)]">
      {/* Tracks (visible gap) */}
      <div className="w-full h-[6px] bg-[#0B0B0B] absolute top-[0px] left-0 z-0" />
      <div className="w-full h-[2px] bg-[#0B0B0B] absolute top-[10px] left-0 z-0 opacity-40" />

      {/* Safety Yellow Strip (Delhi Metro Style) */}
      <div className="w-full h-[6px] md:h-[10px] bg-[#FFD700] absolute top-[12px] md:top-[16px] left-0 z-[1] shadow-[0_1px_2px_rgba(0,0,0,0.1)] border-t border-[#B8860B] border-b border-[#B8860B] flex items-center justify-between px-[10vw]">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPjxwYXRoIGQ9Ik0wIDhMOCAwaDJMMCAxMHoiIGZpbGw9IiNiODg2MGIiIGZpbGwtb3BhY2l0eT0iMC4yIi8+PC9zdmc+')] opacity-50" />
      </div>

      {/* Yellow Safety Line */}
      <div className="w-full h-[5px] md:h-[8px] bg-[#D4A017] mt-8 relative z-10 shadow-[0_2px_4px_rgba(212,160,23,0.3)]" />

      {/* Tactile Paving */}
      <div
        className="w-full h-[8px] mt-1 relative z-10"
        style={{
          backgroundImage: 'radial-gradient(#0B0B0B 30%, transparent 30%)',
          backgroundSize: '8px 8px',
          backgroundPosition: '0 0',
          opacity: 0.15,
        }}
      />

      {/* Platform Easter Eggs */}
      <div className="flex justify-between items-center px-8 md:px-16 mt-3 mb-2 relative z-10">
        <div
          aria-hidden="true"
          className="font-['Schoolbell'] text-[12px] md:text-[14px] text-[#0B0B0B] opacity-80"
        >
          {platform.leftPrimary}{' '}
          <span className="hidden md:inline opacity-40 mx-2">
            {platform.leftSeparator}
          </span>{' '}
          <span className="hidden md:inline">{platform.leftSecondary}</span>
        </div>
        <div
          aria-hidden="true"
          className="font-['Schoolbell'] text-[12px] md:text-[14px] text-[#0B0B0B] opacity-80"
        >
          {platform.rightCautionPrefix}{' '}
          <span className="text-[#0F35FF]">{platform.rightCautionHighlight}</span>
        </div>
      </div>
    </div>
  );
};
