import React from 'react';
import { useTransit } from '../context/TransitContext';
import { InstructionStation } from './InstructionStation';
import { ProjectStation } from './ProjectStation';

export const TransitWorld: React.FC = () => {
  const { config, transitStations, transitWorldRef } = useTransit();
  const { projects } = config;

  return (
    <div
      id="transit-world"
      ref={transitWorldRef}
      className="absolute inset-0 left-0 will-change-transform z-10 flex"
      style={{
        transform: 'translateX(0px)',
        width: `${transitStations.length * 100}vw`,
      }}
    >
      {/* Stations & City injected */}
      <div
        id="transit-stations-container"
        className="touch-pan-y absolute inset-0 w-full h-full flex"
      >
        <InstructionStation />
        {projects.map((project, dataIdx) => (
          <ProjectStation
            key={project.id}
            project={project}
            stationIndex={dataIdx + 1}
            dataIndex={dataIdx}
          />
        ))}
      </div>
    </div>
  );
};
