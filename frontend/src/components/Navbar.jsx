import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Avatar,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Navbar = () => {
  const { user, isAuthenticated, logout, loading } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (loading) return null;

  return (
    <AppBar
      position="static"
      sx={{
        backgroundColor: "#5C4033",
        color: "#f7f0ea",
        boxShadow: "none",
        borderBottom: "1px solid #D2B48C",
      }}
    >
      <Toolbar>
        <Box sx={{ display: "flex", alignItems: "center", flexGrow: 1 }}>
          {/* Logo */}

          <Typography variant="h6" component="div">
            <Button
              color="inherit"
              component={Link}
              to="/"
              sx={{
                display: "flex",
                alignItems: "center",
                textTransform: "none",
                fontSize: "1.25rem",
                fontFamily: '"Playfair Display", serif',
                "&:hover": {
                  backgroundColor: "#7A6246",
                },
              }}
            >
              <Box
                component="img"
                src="/images/8-removebg-preview.png"
                sx={{ height: 30, mr: 1, width: 30, borderRadius: "10px" }}
              />
              Inkspire
            </Button>
          </Typography>

          {/* Home Button */}
          <Button
            color="inherit"
            component={Link}
            to="/home"
            sx={{
              ml: 1,
              "&:hover": {
                backgroundColor: "#7A6246",
              },
            }}
          >
            Home
          </Button>
        </Box>
        <Box>
          {isAuthenticated ? (
            <>
              <Button
                color="inherit"
                component={Link}
                to="/profile"
                startIcon={
                  <Avatar
                    sx={{
                      width: 24,
                      height: 24,
                      bgcolor: "#A67B5B",
                      color: "#FFFFFF",
                    }}
                  >
                    {user?.name?.charAt(0)}
                  </Avatar>
                }
                sx={{
                  marginRight: 1,
                  "&:hover": {
                    backgroundColor: "#7A6246",
                  },
                }}
              >
                {user?.name}
              </Button>
              <Button
                color="inherit"
                component={Link}
                to="/create-post"
                sx={{
                  "&:hover": {
                    backgroundColor: "#7A6246",
                  },
                }}
              >
                Create Post
              </Button>
              <Button
                color="inherit"
                onClick={handleLogout}
                sx={{
                  "&:hover": {
                    backgroundColor: "#7A6246",
                  },
                }}
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button
                color="inherit"
                component={Link}
                to="/login"
                sx={{
                  "&:hover": {
                    backgroundColor: "#7A6246",
                  },
                }}
              >
                Login
              </Button>
              <Button
                color="inherit"
                component={Link}
                to="/register"
                sx={{
                  "&:hover": {
                    backgroundColor: "#7A6246",
                  },
                }}
              >
                Register
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
