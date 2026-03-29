import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    primary: {
      main: "#000000",
    },
    secondary: {
      main: "#34495e",
    },
    background: {
      default: "#ecf0f1",
      paper: "#ffffff",
    },
    text: {
      primary: "#000000",
      secondary: "#7f8c8d",
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: "0px 2px 4px rgba(0,0,0,0.1)",
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: "#fafbfc",
          borderBottom: "2px solid #e0e0e0",
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          color: "#000000",
          fontWeight: "600",
          fontSize: "0.8125rem",
          backgroundColor: "#fafbfc",
          borderBottom: "2px solid #e0e0e0",
          padding: "8px 12px",
        },
        body: {
          padding: "8px 12px",
          borderBottom: "1px solid #f0f0f0",
          fontSize: "0.8125rem",
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          "&:nth-of-type(odd)": {
            backgroundColor: "#f9fafb",
          },
          "&:last-child td": {
            borderBottom: "1px solid #f0f0f0",
          },
          "&:hover": {
            backgroundColor: "#f5f7fa",
          },
        },
      },
    },
    MuiTableContainer: {
      styleOverrides: {
        root: {
          boxShadow: "0px 1px 3px rgba(0,0,0,0.08)",
          borderRadius: "8px",
          overflow: "hidden",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
  },
});
