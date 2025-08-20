// client/src/pages/Home.jsx
import React from 'react';
import { Box, Typography, Button, Paper, Stack } from '@mui/material';
import { RateReview, AddCircle, Login, PersonAdd } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import UserContext from '../contexts/UserContext';
import { useContext } from 'react';
import Logo from '../assets/DesCodeFullLogo.svg'
import useTitle from '../Title.jsx';

function Home() {
    const { user } = useContext(UserContext);
    useTitle("Descode Home Page")
    return (
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
                <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
                    Welcome to
                </Typography>
                <Box sx={{ mb: 2 }}>
                    <img src={Logo} alt="Descode" height={64}/>
                </Box>
                <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
                    Your one-stop platform for checking the CoP conformation.
                </Typography>

                {/* Navigation Buttons */}
                <Stack spacing={2} direction="column" alignItems="center">
                    <Button
                        component={RouterLink}
                        to="/login"
                        variant="contained"
                        startIcon={<Login />}
                        size="large"
                        fullWidth
                        sx={{ textTransform: 'none' }}
                    >
                        Login
                    </Button>
                    <Button
                        component={RouterLink}
                        to="/register"
                        variant="outlined"
                        startIcon={<PersonAdd />}
                        size="large"
                        fullWidth
                        sx={{ textTransform: 'none' }}
                    >
                        Register
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
                        Go to Reviews
                    </Button>
                    <Button
                        component={RouterLink}
                        to={user?"/addreview":"/login"}
                        variant="outlined"
                        startIcon={<AddCircle />}
                        size="large"
                        fullWidth
                        sx={{ textTransform: 'none' }}
                    >
                        Add a Review
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
export default Home;