import { useState } from "react";
import {
  AppBar,
  Toolbar,
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
import { NavLink, useLocation } from "react-router-dom";

const sections = [
  { label: "JOUEURS", path: "/players" },
  { label: "ÉQUIPES", path: "/teams" },
  { label: "CALENDRIER", path: "/calendar" },
];

export default function TopBar() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const location = useLocation();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  return (
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
                  selected={isActive(section.path)}
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
                sx={{
                  textTransform: "none",
                  color: "white",
                  borderBottom: isActive(section.path) ? `3px solid currentColor` : "none",
                  pb: isActive(section.path) ? "6px" : "9px",
                  transition: "all 0.3s ease",
                }}
              />
            ))}
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}
