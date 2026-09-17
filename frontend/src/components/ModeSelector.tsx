import type { SelectionMode } from '../types';

interface Props {
  mode: SelectionMode;
  fixedCount: number;
  onModeChange: (mode: SelectionMode) => void;
  onFixedCountChange: (count: number) => void;
}

export function ModeSelector({ mode, fixedCount, onModeChange, onFixedCountChange }: Props) {
  return (
    <div className="mode-selector">
      <label className="mode-selector__option">
        <input
          type="radio"
          name="mode"
          checked={mode === 'auto-detect'}
          onChange={() => onModeChange('auto-detect')}
        />
        <div>
          <span className="mode-selector__title">Count faces on camera</span>
          <span className="mode-selector__hint">
            The number of teams matches the number of faces the camera sees.
          </span>
        </div>
      </label>

      <label className="mode-selector__option">
        <input
          type="radio"
          name="mode"
          checked={mode === 'fixed-count'}
          onChange={() => onModeChange('fixed-count')}
        />
        <div>
          <span className="mode-selector__title">I already know the number of teams</span>
          <span className="mode-selector__hint">
            Set the count yourself — the camera only labels foreheads.
          </span>
        </div>
      </label>

      {mode === 'fixed-count' && (
        <input
          className="mode-selector__count"
          type="number"
          min={1}
          value={fixedCount}
          onChange={(e) => onFixedCountChange(Math.max(1, Number(e.target.value)))}
          aria-label="Number of teams"
        />
      )}
    </div>
  );
}
