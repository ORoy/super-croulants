import { useLocation } from "react-router-dom";
import { DEFAULT_SEASON, SEASON_SHEET_IDS, type Season } from "../config/sheets";

const isSeason = (value: string | undefined): value is Season =>
  value !== undefined && value in SEASON_SHEET_IDS;

// Reads the active `:season` segment from the URL, falling back to the
// default season for an unrecognized/missing value (e.g. mid-navigation, or
// a stale link). Deliberately parses `useLocation().pathname` rather than
// `useParams()`: Header renders as a sibling of <Routes>, not inside a
// matched <Route>, so useParams() there always returns {} and silently
// pinned the header to the default season regardless of the actual URL.
export function useSeason(): { season: Season; spreadsheetId: string } {
  const { pathname } = useLocation();
  const segment = pathname.split("/")[1];
  const season = isSeason(segment) ? segment : DEFAULT_SEASON;
  return { season, spreadsheetId: SEASON_SHEET_IDS[season] };
}
