import { useEffect, useState } from "react";
import {
  Container,
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

const SHEET_ID = "1ox-qt2fNqSYlord98tRPTX7S5L4TlnwjVltQDPoo4R4";
const TAB_NAME = "Super Croulants Gérants 2025-26";

export default function App() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const url = `https://opensheet.elk.sh/${SHEET_ID}/${encodeURIComponent(TAB_NAME)}`;

    fetch(url)
      .then(res => res.json())
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const headers = data.length > 0 ? Object.keys(data[0]) : [];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" sx={{ fontWeight: "bold" }}>
          Super Croulants
        </Typography>
        <Typography variant="subtitle1" color="textSecondary">
          Gérants 2025-26
        </Typography>
      </Box>

      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Paper sx={{ p: 3, backgroundColor: "#ffebee", color: "#c62828" }}>
          <Typography>Error loading data: {error}</Typography>
        </Paper>
      )}

      {!loading && !error && data.length === 0 && (
        <Paper sx={{ p: 3 }}>
          <Typography>No data available</Typography>
        </Paper>
      )}

      {!loading && !error && data.length > 0 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead sx={{ backgroundColor: "#1976d2" }}>
              <TableRow>
                {headers.map(header => (
                  <TableCell
                    key={header}
                    sx={{
                      color: "white",
                      fontWeight: "bold",
                      backgroundColor: "#1976d2",
                    }}
                  >
                    {header}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((row, index) => (
                <TableRow
                  key={index}
                  sx={{
                    "&:hover": { backgroundColor: "#f5f5f5" },
                    "&:nth-of-type(even)": { backgroundColor: "#fafafa" },
                  }}
                >
                  {headers.map(header => (
                    <TableCell key={`${index}-${header}`} sx={{ py: 2 }}>
                      {row[header]}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
}