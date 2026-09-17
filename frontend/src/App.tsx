import { useState } from 'react';
import type { Team, SelectionMode } from './types';
import { TeamSourceForm } from './components/TeamSourceForm';
import { ModeSelector } from './components/ModeSelector';
import { CameraStage } from './components/CameraStage';
import './App.css';

type Step = 'teams' | 'mode' | 'camera';

export default function App() {
  const [step, setStep] = useState<Step>('teams');
  const [teams, setTeams] = useState<Team[]>([]);
  const [mode, setMode] = useState<SelectionMode>('auto-detect');
  const [fixedCount, setFixedCount] = useState(2);

  return (
    <div className="app">
      <header className="app__header">
        <h1>Face Off</h1>
        <p>Point a camera at your group and let it hand out teams.</p>
      </header>

      <ol className="app__steps">
        <li className={step === 'teams' ? 'is-active' : teams.length ? 'is-done' : ''}>Teams</li>
        <li className={step === 'mode' ? 'is-active' : step === 'camera' ? 'is-done' : ''}>Mode</li>
        <li className={step === 'camera' ? 'is-active' : ''}>Camera</li>
      </ol>

      <main className="app__main">
        {step === 'teams' && (
          <TeamSourceForm
            onTeamsReady={(loaded) => {
              setTeams(loaded);
              setStep('mode');
            }}
          />
        )}

        {step === 'mode' && (
          <div className="app__panel">
            <ModeSelector
              mode={mode}
              fixedCount={fixedCount}
              onModeChange={setMode}
              onFixedCountChange={setFixedCount}
            />
            <div className="app__panel-actions">
              <button type="button" onClick={() => setStep('teams')}>
                Back
              </button>
              <button type="button" className="primary" onClick={() => setStep('camera')}>
                Open camera
              </button>
            </div>
          </div>
        )}

        {step === 'camera' && (
          <div className="app__panel">
            <CameraStage teams={teams} mode={mode} fixedCount={fixedCount} />
            <button type="button" onClick={() => setStep('mode')}>
              Change mode
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
