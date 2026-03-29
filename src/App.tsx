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
const API_KEY = import.meta.env.VITE_GOOGLE_SHEETS_API_KEY;

export default function App() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!API_KEY) {
      setError("Google Sheets API key not configured");
      setLoading(false);
      return;
    }

    // First, get sheet metadata to find the sheet ID by name
    const metadataUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}?key=${API_KEY}`;

    fetch(metadataUrl)
      .then(res => res.json())
      .then(sheetsData => {
        // Find the sheet with matching title
        const sheet = sheetsData.sheets.find(
          (s: any) => s.properties.title === TAB_NAME
        );
        if (!sheet) {
          throw new Error(`Sheet "${TAB_NAME}" not found`);
        }
        const sheetId = sheet.properties.sheetId;

        // Get the sheet data
        const range = `'${TAB_NAME}'!A:Z`;
        const valuesUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(range)}?key=${API_KEY}`;

        return fetch(valuesUrl).then(res => res.json());
      })
      .then(result => {
        const rows = result.values || [];
        if (rows.length === 0) {
          setData([]);
          setLoading(false);
          return;
        }

        // Convert rows to objects using first row as headers
        const headers = rows[0];
        const dataObjects = rows.slice(1).map(row =>
          headers.reduce((obj: Record<string, string>, header: string, index: number) => {
            obj[header] = row[index] || "";
            return obj;
          }, {})
        );

        setData(dataObjects);
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