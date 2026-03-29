import { useState } from "react";
import {
  AppBar,
  Toolbar,
  Container,
  Box,
  Tab,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { HashRouter, Routes, Route, NavLink } from "react-router-dom";
import PlayersTabs from "./components/PlayersTabs";
import TeamRanking from "./components/TeamRanking";

const sections = [
  { label: "CLASSEMENT JOUEURS", path: "/players" },
  { label: "CLASSEMENT ÉQUIPES", path: "/teams" },
];

export default function App() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <HashRouter>
      <Box>
        <AppBar position="sticky" color="primary" enableColorOnDark>
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: "bold" }}>
              Super Croulants
            </Typography>

            {isMobile ? (
              <>
                <IconButton
                  color="inherit"
                  aria-label="open navigation menu"
                  onClick={handleMenuOpen}
                  edge="end"
                >
                  <MenuIcon />
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={open}
                  onClose={handleMenuClose}
                  anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                  transformOrigin={{ vertical: "top", horizontal: "right" }}
                >
                  {sections.map((section) => (
                    <MenuItem
                      key={section.path}
                      component={NavLink}
                      to={section.path}
                      onClick={handleMenuClose}
                    >
                      {section.label}
                    </MenuItem>
                  ))}
                </Menu>
              </>
            ) : (
              <Box sx={{ display: "flex", gap: 2 }}>
                {sections.map((section) => (
                  <Tab
                    key={section.path}
                    component={NavLink}
                    to={section.path}
                    label={section.label}
                    sx={{ textTransform: "none", color: "white" }}
                  />
                ))}
              </Box>
            )}
          </Toolbar>
        </AppBar>

        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Box sx={{ mt: 2 }}>
            <Routes>
              <Route path="/players/*" element={<PlayersTabs />} />
              <Route path="/teams" element={<TeamRanking />} />
              <Route path="/*" element={<PlayersTabs />} />
            </Routes>
          </Box>
        </Container>
      </Box>
    </HashRouter>
  );
}