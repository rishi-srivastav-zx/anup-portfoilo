import React from 'react';
import { useTransit } from '../context/TransitContext';

export const RouteMapBoard: React.FC = () => {
  const { config, transitStations, activeStationIdx } = useTransit();
  const { routeBoard, projects } = config;
  const { dummyStationsList } = routeBoard;

  const totalNodes = transitStations.length + dummyStationsList.length; // 6 + 5 = 11
  const targetNodeIndex = activeStationIdx * 2;
  const targetPercentage = (targetNodeIndex / (totalNodes - 1)) * 100;

  const nodes = Array.from({ length: totalNodes }, (_, i) => {
    const isMajor = i % 2 === 0;
    const majorIndex = isMajor ? i / 2 : -1;
    const dummyIndex = isMajor ? -1 : (i - 1) / 2;
    const left = (i / (totalNodes - 1)) * 100;
    const isCompletedOrActive = i <= targetNodeIndex;

    if (isMajor) {
      let name =
        majorIndex === 0
          ? routeBoard.originLabel
          : (projects[majorIndex - 1]?.name || `PROJECT ${majorIndex}`).toUpperCase();
      if (name.includes(' ')) {
        name = name.replace(' ', '<br/>');
      }

      return (
        <div
          key={`major-${majorIndex}`}
          data-idx={majorIndex}
          className="absolute flex flex-col items-center transform -translate-x-1/2 -translate-y-1/2 z-20 fixed-route-node route-major"
          style={{ left: `${left}%`, top: '50%' }}
        >
          {/* Station Node */}
          <div
            className="route-dot w-4 h-4 md:w-5 md:h-5 rounded-full border-[3px] md:border-[5px] border-[#0A0A1A] bg-white transition-all duration-500 relative z-10"
            style={{
              backgroundColor: isCompletedOrActive ? '#0F35FF' : 'white',
              borderColor: '#0A0A1A',
              transform: 'scale(1)',
            }}
          />
          {/* Blue Tilted Label */}
          <div
            aria-hidden="true"
            className="absolute bottom-full mb-[-4px] md:mb-0 bg-[#0F35FF] px-2 py-[3px] transform rotate-[-58deg] origin-bottom-left left-[50%] ml-[11px] md:ml-[15px] transition-all duration-500 opacity-60 node-label text-center font-['Lilita_One'] text-white text-[11px] md:text-[13px] uppercase"
            style={{
              lineHeight: 1.04,
              letterSpacing: '-0.02em',
              opacity: isCompletedOrActive ? 1 : 0.4,
            }}
            dangerouslySetInnerHTML={{ __html: name }}
          />
        </div>
      );
    }

    let name = dummyStationsList[dummyIndex] || '';
    if (name === 'VISHWAVIDYALAYA') {
      name = 'VISHWA-<br/>VIDYALAYA';
    } else if (name.includes(' ')) {
      name = name.replace(' ', '<br/>');
    }

    return (
      <div
        key={`dummy-${dummyIndex}`}
        className="absolute flex flex-col items-center transform -translate-x-1/2 -translate-y-1/2 z-10 fixed-route-node route-dummy"
        style={{ left: `${left}%`, top: '50%' }}
      >
        {/* Node */}
        <div
          className="route-dot w-4 h-4 md:w-5 md:h-5 rounded-full border-[3px] md:border-[5px] border-[#0A0A1A] bg-white transition-all duration-500 relative z-10"
          style={{
            backgroundColor: isCompletedOrActive ? '#0F35FF' : 'white',
            borderColor: '#0A0A1A',
            transform: 'scale(1)',
          }}
        />
        {/* Text Below */}
        <div
          aria-hidden="true"
          className="absolute top-full mt-[-4px] md:mt-0 font-['Lilita_One'] text-[#0A0A1A] text-[11px] md:text-[13px] opacity-80 node-label text-center transform rotate-[-58deg] origin-top-right right-[50%] mr-[11px] md:mr-[15px] uppercase"
          style={{ lineHeight: 1.04, letterSpacing: '-0.02em' }}
          dangerouslySetInnerHTML={{ __html: name }}
        />
      </div>
    );
  });

  return (
    <div
      id="fixed-route-board"
      className="absolute top-[82px] right-[99px] md:top-[98px] md:right-[115px] z-[100] w-[90%] md:w-[60%] lg:w-[45%] xl:w-[50%] h-[110px] md:h-[165px] border-[4px] md:border-[5px] border-[#0A0A1A] shadow-[8px_8px_0_rgba(10,10,26,1)] pointer-events-none flex flex-col items-center justify-center overflow-visible"
      style={{ backgroundColor: routeBoard.boardBg }}
    >
      {/* Subtle Background Texture */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PHBhdGggZD0iTTAgMGg0MHY0MEgweiIgZmlsbD0ibm9uZSIvPjxwaGF0aCBkPSJNMCAwaDQwdjQwSDB6IiBmaWxsPSJub25lIi8+PHBhdGggZD0iTTAgMGg0MHYxSDB6bTAgNDBoNDB2MUgwek0wIDBoMXY0MEgwek0zOSAwaDF2NDBoLTF6IiBmaWxsPSJyZ2JhKDEwLCAxMCwgMjYsIDAuMDUpIi8+PC9zdmc+')] opacity-60 z-0" />

      {/* The Route Line */}
      <div className="relative w-[85%] mx-auto h-[40px] flex items-center justify-center z-10">
        {/* Background Line */}
        <div className="absolute left-0 right-0 h-[3px] md:h-[4px] bg-[#C4C4C4] rounded-full" />
        {/* Active Fill Line */}
        <div
          id="fixed-progress-line"
          className="absolute left-0 h-[3px] md:h-[4px] bg-[#0F35FF] rounded-full transition-all duration-700 ease-out"
          style={{ width: `${targetPercentage}%` }}
        />

        {/* Nodes */}
        <div id="fixed-route-nodes" className="absolute inset-0 w-full h-full">
          {nodes}
        </div>
      </div>
    </div>
  );
};
