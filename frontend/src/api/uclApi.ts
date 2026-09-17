import type { Team } from '../types';

// URL of the standalone ucl-teams-backend service (see the separate
// ucl-teams-backend/ project). It holds the football-data.org API key
// and handles CORS server-side, so the browser never talks to
// football-data.org directly.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000';

interface FootballDataTeam {
  id: number;
  name: string;
  shortName: string;
  crestUrl?: string;
}

interface FootballDataTeamsResponse {
  teams: FootballDataTeam[];
}

/**
 * Fetches the clubs that played in the Champions League for a season,
 * identified by its starting year — e.g. 2023 for the 2023/24 season.
 * Calls ucl-teams-backend, not football-data.org directly.
 */
export async function fetchUclTeamsBySeason(season: number): Promise<Team[]> {
  const response = await fetch(`${API_BASE_URL}/getTeams`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ season }),
  });

  if (!response.ok) {
    throw new Error(
      `Could not load ${season} Champions League teams (status ${response.status}).`
    );
  }

  const data: FootballDataTeamsResponse = await response.json();

  return data.teams.map((team) => ({
    id: String(team.id),
    name: team.name,
    shortName: team.shortName,
    crestUrl: team.crestUrl,
  }));
}
