// client/src/pages/Register.jsx
import React, { useState } from 'react';
import { Box, Typography, TextField, Button, IconButton, InputAdornment, Link } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useFormik } from 'formik';
import { ToastContainer, toast } from 'react-toastify';
import useTitle from '../Title.jsx';
import * as yup from 'yup';
import http from '../http';
import 'react-toastify/dist/ReactToastify.css';

function Register() {
    useTitle("Register to DesCode")
    const navigate = useNavigate();
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const from = params.get('from') || '/';
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [suggestedPassword, setSuggestedPassword] = useState("");
    // Password fields are initially hidden

    const fetchPasswordSuggestion = async () => {
        try {
            const res = await http.get("/api/password-suggestion");
            setSuggestedPassword(res.data.password);
        } catch (err) {
            setSuggestedPassword("Error fetching password");
        }
    };
  
    const trimAll = (obj) =>
      Object.fromEntries(
        Object.entries(obj).map(([k, v]) =>
          typeof v === "string" ? [k, v.trim()] : [k, v]
        )
      );
    
    const formik = useFormik({
        initialValues: {
            name: "",
            email: "",
            password: "",
            confirmPassword: ""
        },
        validationSchema: yup.object({
            name: yup.string().trim()
                .min(3, 'Name must be at least 3 characters')
                .max(50, 'Name must be at most 50 characters')
                .required('Name is required')
                .matches(/^[a-zA-Z '\-,.]+$/, "Name only allow letters, spaces and characters: ' - , ."),
            email: yup.string().trim()
                .email('Enter a valid email')
                .max(50, 'Email must be at most 50 characters')
                .required('Email is required'),
            password: yup.string().trim()
                .min(8, 'Password must be at least 8 characters')
                .max(50, 'Password must be at most 50 characters')
                .required('Password is required')
                .matches(/^(?=.*[a-zA-Z])(?=.*[0-9]).{8,}$/, "Password at least 1 letter and 1 number"),
            confirmPassword: yup.string().trim()
                .required('Confirm password is required')
                .oneOf([yup.ref('password')], 'Passwords must match')
        }),
        onSubmit: async (data) => {
            setLoading(true);
            data = trimAll(data);
            data.email = data.email.toLowerCase();
            try {
                const res = await http.post("/user/register", data);
                localStorage.setItem("accessToken", res.data.accessToken);
                // ^create access token^
                toast.success("Registration successful! Logging you in...");
                setTimeout(() => {
                    navigate(from, { replace: true }); // or your main/protected page
                    window.location.reload(); // or update app state
                }, 1000);
            } catch (err) {
                const msg = err.response?.data?.message || err.response?.data?.errors?.[0] || "Registration failed";
                toast.error(msg);
            } finally {
                setLoading(false); 
            }
        }
    });
    
    return (
        <Box sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
        }}>
            <Typography variant="h4" sx={{ my: 2 }}>
                Register
            </Typography>
            <Box component="form" sx={{ maxWidth: '500px' }} onSubmit={formik.handleSubmit}>
                <TextField
                    fullWidth margin="dense" autoComplete="off"
                    label="Name" name="name"
                    value={formik.values.name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.name && Boolean(formik.errors.name)}
                    helperText={formik.touched.name && formik.errors.name}
                />
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
                                <Button
                                    variant="text"
                                    size="small"
                                    sx={{ minWidth: 0, px: 1, mr: 1 }}
                                    onClick={fetchPasswordSuggestion}
                                >
                                    Suggestions
                                </Button>
                                <IconButton
                                    onClick={() => setShowPassword((s) => !s)}
                                    edge="end"
                                    tabIndex={-1}
                                >
                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                            </InputAdornment>
                        )
                    }}
                />
                {suggestedPassword && suggestedPassword !== "Error fetching password" && (
                    <Box sx={{ mt: 1, mb: 1, textAlign: 'center', fontStyle: 'italic', color: 'green' }}>
                        Suggested: <span style={{ fontWeight: 'bold' }}>{suggestedPassword}</span>
                        <Button size="small" sx={{ ml: 1 }} onClick={() => formik.setFieldValue('password', suggestedPassword)}>
                            Use
                        </Button>
                    </Box>
                )}
                <TextField
                    fullWidth margin="dense" autoComplete="off"
                    label="Confirm Password" name="confirmPassword" type={showConfirm ? "text" : "password"}
                    value={formik.values.confirmPassword}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
                    helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton
                                onClick={() => setShowConfirm((s) => !s)}
                                edge="end"
                                tabIndex={-1} // pressing tab skips over this button
                                >
                                    {showConfirm ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                            </InputAdornment>
                        )
                    }}
                />
                <Button
                    fullWidth variant="contained" sx={{ mt: 2 }}
                    type="submit" disabled={loading || !formik.isValid}
                    // submit button is disabled when the user is registering in (loading is active)
                    // or if at least one of the entered fields is invalid
                >
                    {loading ? "Registering..." : "Register"}
                </Button>
                <Box sx={{ mt: 2, textAlign: 'center' }}>
                    <Link href="/login" underline="hover">Already have an account? Login</Link>
                </Box>
            </Box>
            <ToastContainer />
        </Box>
    );
}
export default Register;