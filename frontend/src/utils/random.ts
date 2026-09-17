/** Fisher-Yates shuffle. Returns a new array; does not mutate the input. */
export function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Picks `count` items at random from `items`, without repeating a team
 * until every other team has been used once. If `count` exceeds the list
 * length, the list reshuffles and continues rather than throwing.
 */
export function pickUnique<T>(items: T[], count: number): T[] {
  if (items.length === 0 || count <= 0) return [];

  const picks: T[] = [];
  let pool = shuffle(items);

  while (picks.length < count) {
    const next = pool.shift();
    if (next === undefined) {
      pool = shuffle(items);
      continue;
    }
    picks.push(next);
  }
  return picks;
}
