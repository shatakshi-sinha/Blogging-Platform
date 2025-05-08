import React from "react";
import { Box, Typography, Button, Container } from "@mui/material";
import { Link } from "react-router-dom";

const WelcomePage = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 8 }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" }, // Stack on mobile, row on desktop
          background: "linear-gradient(to bottom, #F5F5DC, #FFFFFF)",
          alignItems: "center",
          gap: 6,
          py: 10,
          px: 6,
          borderRadius: 2,
          boxShadow: 3,
        }}
      >
        {/* Text Content */}
        <Box sx={{ flex: 1, textAlign: { xs: "center", md: "left" } }}>
          <Typography
            variant="h2"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: "bold",
              color: "#5C4033",
              mb: 4,
            }}
          >
            Share your story with the world
          </Typography>

          <Typography
            variant="h5"
            component="p"
            sx={{
              color: "#7A6246",
              mb: 6,
            }}
          >
            Inkspire gives you everything you need to start blogging in minutes.
            Express yourself, build an audience, and grow your online presence.
          </Typography>

          <Box
            sx={{
              display: "flex",
              gap: 4,
              justifyContent: { xs: "center", md: "flex-start" },
            }}
          >
            <Button
              component={Link}
              to="/register"
              variant="contained"
              size="large"
              sx={{
                backgroundColor: "#8B7355",
                color: "#FFFFFF",
                px: 4,
                "&:hover": { backgroundColor: "#7A6246" },
              }}
            >
              Get started
            </Button>

            <Button
              component={Link}
              to="/home"
              variant="outlined"
              size="large"
              sx={{
                color: "#8B7355",
                borderColor: "#8B7355",
                px: 4,
                "&:hover": { backgroundColor: "#F5F5DC" },
              }}
            >
              Take a tour
            </Button>
          </Box>
        </Box>

        {/* Image Section */}
        <Box
          sx={{
            flex: 1,
            borderRadius: 2,
            overflow: "hidden",
            boxShadow: 3,
            maxWidth: "100%",
            height: "auto",
          }}
        >
          <img
            src="/images/welcomeblog3.jpg"
            alt="Writing inspiration"
            style={{
              width: "100%",
              height: "auto",
              display: "block",
            }}
          />
        </Box>
      </Box>
    </Container>
  );
};

export default WelcomePage;
