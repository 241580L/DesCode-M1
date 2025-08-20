import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppBar, Box, Container, Toolbar, Typography, Button, Link, Menu, MenuItem, IconButton } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';

export default function AdminNavbar() {
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    handleMenuClose();
    navigate('/login');
  };

  const goTo = (page) => {
    navigate(page);
    handleMenuClose();
  };

  return (
    <AppBar position="static" sx={{ mb: 2 }}>
      <Container >
        <Toolbar disableGutters={true}>
          
          <Button component={Link} onClick={() => goTo("/admin")} color="inherit">
            <Typography variant="h6">Admin Portal</Typography>
          </Button>
          <Button component={Link} onClick={() => goTo("/cop")} color="inherit">
            C.o.P. Documents
          </Button>
          <Button component={Link} onClick={() => goTo("/manage-users")} color="inherit">
            Users
          </Button>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
