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

interface DataTableProps {
  data: RowData[];
  loading: boolean;
  error: string | null;
}

export default function DataTable({ data, loading, error }: DataTableProps) {
  const headers = data.length > 0 ? Object.keys(data[0]) : [];

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

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            {headers.map(header => (
              <TableCell key={header}>
                {header}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row, index) => (
            <TableRow key={index}>
              {headers.map(header => (
                <TableCell key={`${index}-${header}`}>
                  {row[header]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
