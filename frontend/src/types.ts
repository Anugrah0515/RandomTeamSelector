export interface Team {
  id: string;
  name: string;
  shortName?: string;
  crestUrl?: string;
}

export type SelectionMode = 'auto-detect' | 'fixed-count';

/** A face tracked across frames, with a stable id and a point to label. */
export interface TrackedFace {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  foreheadX: number;
  foreheadY: number;
}

export interface Assignment {
  face: TrackedFace;
  team: Team;
}
