// Leaderboard rows identify a player by name (+ team when the active mode's
// columns include one). Encoded as a single route param so Player Detail can
// look the player back up across the canonical player-stat ranges.
const SEPARATOR = "::";

export const encodePlayerId = (name: string, team: string): string =>
  encodeURIComponent(`${name}${SEPARATOR}${team}`);

export const decodePlayerId = (id: string): { name: string; team: string } => {
  const [name = "", team = ""] = decodeURIComponent(id).split(SEPARATOR);
  return { name, team };
};
