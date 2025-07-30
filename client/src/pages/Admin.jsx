import AdminNavbar from '../components/AdminNavbar';
// client/src/pages/Home.jsx
import React from 'react';
import { Box, Typography, Button, Paper, Stack } from '@mui/material';
import { RateReview, AddCircle, Login, PersonAdd } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import UserContext from '../contexts/UserContext';
import { useContext } from 'react';
import Logo from '../assets/DesCodeFullLogo.svg'

export default function AdminPage() {
    const { user } = useContext(UserContext);
    return (
        <AdminNavbar />,
        <Box
            sx={{
                minHeight: '85vh',
                minWidth: '0',
                bgcolor: '#f5f6fa',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                py: 4,
            }}
        >
            <Paper elevation={3} sx={{ p: { xs: 3, sm: 5 }, borderRadius: 3, maxWidth: 400, width: '100%', textAlign: 'center' }}>
                {/* Logo or Hero */}
                <Box sx={{ mb: 2 }}>
                    <img src={Logo} alt="Descode" height={64}/>
                </Box>
                <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
                    Admin Dashboard
                </Typography>
                <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
                    Welcome! This is the admin section.
                </Typography>

                {/* Navigation Buttons */}
                <Stack spacing={2} direction="column" alignItems="center">
                    <Button
                        component={RouterLink}
                        to={user?"/manage-users":"/login"}
                        variant="outlined"
                        startIcon={<AddCircle />}
                        size="large"
                        fullWidth
                        sx={{ textTransform: 'none' }}
                    >
                        Manage Users
                    </Button>
                    <Button
                        component={RouterLink}
                        to="/reviews"
                        variant="outlined"
                        startIcon={<RateReview />}
                        size="large"
                        fullWidth
                        sx={{ textTransform: 'none' }}
                    >
                        Reply to Reviews
                    </Button>
                </Stack>
                <Typography variant="body2" sx={{ mt: 4, color: 'text.secondary' }}>
                    © {new Date().getFullYear()} Descode. All rights reserved.
                </Typography>
            </Paper>
            <ToastContainer />
        </Box>
    );
}
