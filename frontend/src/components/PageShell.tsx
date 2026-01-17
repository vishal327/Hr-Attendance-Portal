import * as React from "react";
import { AppBar, Box, Container, Tab, Tabs, Toolbar, Typography } from "@mui/material";
import { Link as RouterLink, useLocation } from "react-router-dom";

function useActiveTab(): "/" | "/attendance" {
  const { pathname } = useLocation();
  if (pathname.startsWith("/attendance")) return "/attendance";
  return "/";
}

export function PageShell(props: { children: React.ReactNode }) {
  const active = useActiveTab();

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <AppBar position="sticky" elevation={0} color="transparent">
        <Toolbar sx={{ borderBottom: 1, borderColor: "divider", bgcolor: "background.paper" }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mr: 3 }}>
            HR Portal
          </Typography>
          <Tabs value={active} textColor="primary" indicatorColor="primary">
            <Tab label="Employees" value="/" component={RouterLink} to="/" />
            <Tab label="Attendance" value="/attendance" component={RouterLink} to="/attendance" />
          </Tabs>
        </Toolbar>
      </AppBar>

      <Container sx={{ py: 3 }}>{props.children}</Container>
    </Box>
  );
}
