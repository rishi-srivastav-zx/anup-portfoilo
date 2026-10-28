'use client';

import React, { useState } from 'react';
import { CinematicHeader, MechanicalStatus } from './components/CinematicHeader';
import { MechanicalAuthStage } from './components/MechanicalAuthStage';
import { LoginProvider } from './provider';
import './login.css';

export default function App() {
  const [resetSignal, setResetSignal] = useState(0);
  const [mechStatus, setMechStatus] = useState<MechanicalStatus>({
    gearsActive: false,
    sprayReady: false,
    weightTilted: false,
    cordPulled: false,
    unlocked: false,
  });

  const handleReset = () => {
    setResetSignal((prev) => prev + 1);
    setMechStatus({
      gearsActive: false,
      sprayReady: false,
      weightTilted: false,
      cordPulled: false,
      unlocked: false,
    });
  };

  return (
    <LoginProvider>
      <div className="relative h-screen w-screen overflow-hidden bg-cinema-grid text-[#141414]">
        <CinematicHeader mechStatus={mechStatus} onReset={handleReset} />
        <MechanicalAuthStage onStatusChange={setMechStatus} resetSignal={resetSignal} />
      </div>
    </LoginProvider>
  );
}

