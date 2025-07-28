// client/src/pages/Login.jsx
import React, { useState } from 'react';
import { Box, Typography, TextField, Button, IconButton, InputAdornment, Link } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useFormik } from 'formik';
import { ToastContainer, toast } from 'react-toastify';
import * as yup from 'yup';
import http from '../http';

function Login() {
    const navigate = useNavigate();
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const from = params.get('from') || '/';
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const formik = useFormik({
        initialValues: {
            email: "",
            password: "",
        },
        validationSchema: yup.object({
            email: yup.string().trim()
                .email('Enter a valid email')
                .max(50, 'Email must be at most 50 characters')
                .required('Email is required'),
            password: yup.string().trim()
                .min(8, 'Password must be at least 8 characters')
                .max(50, 'Password must be at most 50 characters')
                .required('Password is required')
                .matches(/^(?=.*[a-zA-Z])(?=.*[0-9]).{8,}$/, "Password must have at least 1 letter and 1 number"),
        }),
        onSubmit: async (data) => {
            setLoading(true); // loader
            data.email = data.email.trim().toLowerCase();
            data.password = data.password.trim();
            try {
                const res = await http.post("/user/login", data);
                localStorage.setItem("accessToken", res.data.accessToken);
                toast.success("Login successful!");
                setTimeout(() => {
                    navigate(from, { replace: true });
                    window.location.reload();
                }, 1000);
            } catch (err) {
                const msg = err.response?.data?.message || err.response?.data?.errors?.[0] || "Login failed";
                toast.error(msg);
            } finally {
                setLoading(false);
            }
        }
    });
    return (
        <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography variant="h5" sx={{ my: 2 }}>Login</Typography>
            <Box component="form" sx={{ maxWidth: '500px' }} onSubmit={formik.handleSubmit}>
                <TextField
                    fullWidth margin="dense" autoComplete="off"
                    label="Email" name="email"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.email && Boolean(formik.errors.email)}
                    helperText={formik.touched.email && formik.errors.email}
                />
                <TextField
                    fullWidth margin="dense" autoComplete="off"
                    label="Password" name="password" type={showPassword ? "text" : "password"}
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.password && Boolean(formik.errors.password)}
                    helperText={formik.touched.password && formik.errors.password}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton
                                    onClick={() => setShowPassword((s) => !s)}
                                    edge="end"
                                    tabIndex={-1} // pressing tab skips over this button
                                >
                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                            </InputAdornment>
                        )
                    }}
                />
                <Button
                    fullWidth variant="contained" sx={{ mt: 2 }}
                    type="submit" disabled={loading || !formik.isValid}
                    // submit button is disabled when the user is logging in (loading)
                    // or if at least one of the entered fields is invalid
                >
                    {loading ? "Logging in..." : "Login"}
                </Button>
                <Box sx={{ mt: 2, textAlign: 'center' }}>
                    <Link href="/register" underline="hover">Don't have an account? Register</Link>
                </Box>
            </Box>
            <ToastContainer />
        </Box>
    );
}
export default Login;