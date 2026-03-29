import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Box,
  CircularProgress,
} from "@mui/material";
import type { RowData } from "../utils/sheetFetch";

interface TeamTableProps {
  data: RowData[];
  loading: boolean;
  error: string | null;
}

export default function TeamTable({ data, loading, error }: TeamTableProps) {
  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Paper sx={{ p: 3, backgroundColor: "#ffebee", color: "#c62828" }}>
        <Typography>Error loading data: {error}</Typography>
      </Paper>
    );
  }

  if (data.length === 0) {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography>No data available</Typography>
      </Paper>
    );
  }

  const headers = Object.keys(data[0]);
  
  // Check if this is two-level headers: first row has mix of values and empty strings
  const firstRowValues = Object.values(data[0]);
  const secondRowValues = data.length > 1 ? Object.values(data[1]) : [];
  
  const hasNonEmptyInFirstRow = firstRowValues.some(v => v && v.toString().trim() !== "");
  const hasEmptyInFirstRow = firstRowValues.some(v => !v || v.toString().trim() === "");
  const isTwoLevelHeaders = hasNonEmptyInFirstRow && hasEmptyInFirstRow && data.length > 1;

  let tableHead = null;
  let tableBody: RowData[];

  if (isTwoLevelHeaders) {
    // Two-level header structure
    const groupHeadersArray = headers.map(h => {
      const val = data[0][h];
      return val ? val.toString() : "";
    });
    const columnHeadersArray = headers.map(h => {
      const val = data[1][h];
      return val ? val.toString() : "";
    });
    
    tableBody = data.slice(2);

    // Calculate spans: each group header spans until the next non-empty group header
    const groupSpans: Array<{ index: number; header: string; span: number }> = [];
    for (let i = 0; i < groupHeadersArray.length; i++) {
      const header = groupHeadersArray[i];
      if (header.trim() !== "") {
        // Count how many consecutive cells until next non-empty group header or end
        let span = 1;
        for (let j = i + 1; j < groupHeadersArray.length; j++) {
          if (groupHeadersArray[j].trim() !== "") {
            break;
          }
          span++;
        }
        groupSpans.push({ index: i, header, span });
        i += span - 1; // Skip the cells we just counted
      }
    }

    tableHead = (
      <TableHead>
        <TableRow>
          {groupSpans.map((group) => (
            <TableCell
              key={`group-${group.index}`}
              colSpan={group.span}
              sx={{ textAlign: "center", fontWeight: "bold", backgroundColor: "#f0f0f0" }}
            >
              {group.header}
            </TableCell>
          ))}
        </TableRow>
        <TableRow>
          {columnHeadersArray.map((header, idx) => (
            <TableCell key={`col-${idx}`}>{header}</TableCell>
          ))}
        </TableRow>
      </TableHead>
    );
  } else {
    // Single-level headers
    tableBody = data.slice(1);

    tableHead = (
      <TableHead>
        <TableRow>
          {headers.map((header) => (
            <TableCell key={header}>{data[0][header]}</TableCell>
          ))}
        </TableRow>
      </TableHead>
    );
  }

  return (
    <TableContainer component={Paper}>
      <Table>
        {tableHead}
        <TableBody>
          {tableBody.map((row, rowIdx) => (
            <TableRow key={rowIdx}>
              {headers.map((header) => (
                <TableCell key={`${rowIdx}-${header}`}>{row[header]}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
