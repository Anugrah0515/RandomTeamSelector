import { useState } from 'react';
import type { Team } from '../types';
import { fetchUclTeamsBySeason } from '../api/uclApi';

interface Props {
  onTeamsReady: (teams: Team[]) => void;
}

type Source = 'manual' | 'ucl';

export function TeamSourceForm({ onTeamsReady }: Props) {
  const [source, setSource] = useState<Source>('manual');
  const [manualText, setManualText] = useState(`Manchester United
Bayern Munich
Atlético Madrid
PSG
Liverpool
Barcelona
Bayer Leverkusen
Borussia Dortmund
Arsenal
Marseille`);
  const [season, setSeason] = useState(new Date().getFullYear() - 1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitManual = () => {
    const teams: Team[] = manualText
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((name, index) => ({ id: `manual-${index}-${name}`, name }));

    if (teams.length === 0) {
      setError('Add at least one team, one per line.');
      return;
    }
    setError(null);
    onTeamsReady(teams);
  };

  const submitUcl = async () => {
    setLoading(true);
    setError(null);
    try {
      const teams = await fetchUclTeamsBySeason(season);
      onTeamsReady(teams);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load that season.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="team-source">
      <div className="team-source__tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={source === 'manual'}
          className={source === 'manual' ? 'is-active' : ''}
          onClick={() => setSource('manual')}
        >
          My own list
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={source === 'ucl'}
          className={source === 'ucl' ? 'is-active' : ''}
          onClick={() => setSource('ucl')}
        >
          Champions League season
        </button>
      </div>

      {source === 'manual' ? (
        <div className="team-source__panel">
          <label htmlFor="manual-teams">Teams, one per line</label>
          <textarea
            id="manual-teams"
            rows={10}
            value={manualText}
            onChange={(e) => setManualText(e.target.value)}
            placeholder={'Arsenal\nBayern Munich\nReal Madrid\nInter Milan'}
          />
          <button type="button" className="primary" onClick={submitManual}>
            Use this list
          </button>
        </div>
      ) : (
        <div className="team-source__panel">
          <label htmlFor="ucl-season">Season starting year</label>
          <input
            id="ucl-season"
            type="number"
            min={1955}
            max={new Date().getFullYear()}
            value={season}
            onChange={(e) => setSeason(Number(e.target.value))}
          />

          <button type="button" className="primary" onClick={submitUcl} disabled={loading}>
            {loading ? 'Loading season…' : 'Load teams'}
          </button>
        </div>
      )}

      {error && <p className="team-source__error">{error}</p>}
    </div>
  );
}
