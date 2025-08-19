import React, { useEffect, useContext, useState } from 'react';
import { generatePassword } from '../utils/passwordGenerator';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, TextField, Button, CircularProgress, IconButton, InputAdornment } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { ToastContainer, toast } from 'react-toastify';
import UserContext from '../contexts/UserContext';
import http from '../http';
import ConfirmModal from '../components/ConfirmModal';
import 'react-toastify/dist/ReactToastify.css';

export default function EditProfile() {
  const navigate = useNavigate();
  const { user, setUser } = useContext(UserContext);
  const [showModal, setShowModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);


  // Toast helper
  const showToast = (text, type) => {
    if (type === 'success') toast.success(text);
    else if (type === 'error') toast.error(text);
    else toast.info(text);
  };


  // Validation schema with conditional password validation
  const validationSchema = yup.object().shape({
    name: yup
      .string()
      .trim()
      .min(3, 'Name must be at least 3 characters')
      .max(50, 'Name must be at most 50 characters')
      .required('Name is required')
      .matches(/^[a-zA-Z '-,.]+$/, "Name only allows letters, spaces and characters: ' - , ."),


    email: yup
      .string()
      .trim()
      .email('Enter a valid email')
      .max(50, 'Email must be at most 50 characters')
      .required('Email is required'),


    currentPassword: yup.string().when('newPassword', (newPassword, schema) => {
      const val = typeof newPassword === 'string' ? newPassword.trim() : '';
      return val.length > 0
        ? schema.required('Current password is required to change password')
        : schema.notRequired();
    }),
    newPassword: yup
      .string()
      .trim()
      .min(8, 'Password must be at least 8 characters')
      .max(50, 'Password must be at most 50 characters')
      .matches(/^(?=.*[a-zA-Z])(?=.*[0-9]).{8,}$/, 'Password must contain at least 1 letter and 1 number')
      .notRequired(),
    confirmPassword: yup
      .string()
      .when('newPassword', {
        is: (val) => val && val.trim().length > 0,
        then: () => yup
          .string()
          .required('Confirm password is required')
          .oneOf([yup.ref('newPassword')], 'Passwords must match'),
        otherwise: () => yup.string().notRequired(),
      }),
  });


  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: user?.name || '',
      email: user?.email || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      if (!user) {
        navigate('/login');
        return;
      }


      try {
        const payload = {
          name: values.name.trim(),
          email: values.email.trim().toLowerCase(),
          originalEmail: user.email,
        };


        if (values.newPassword) {
          payload.currentPassword = values.currentPassword;
          payload.newPassword = values.newPassword;
        }


        const response = await http.put('/user/profile', payload);


        if (response.status === 200) {
          showToast('Profile updated successfully!', 'success');
          const updatedUser = { ...user, name: values.name, email: values.email };
          setUser(updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser));
          setTimeout(() => navigate('/home'), 1500);
        } else {
          showToast(response.data.message || 'Failed to update profile.', 'error');
        }
      } catch (error) {
        const msg = error.response?.data?.message || 'Something went wrong!';
        showToast(msg, 'error');
      }
    },
  });


  // Handle Confirm Delete Account
  const handleDeleteAccount = () => setShowModal(true);


  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await http.delete('/user/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });


      if (response.status === 200) {
        showToast('Your account has been deleted.', 'success');
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        setTimeout(() => {
          setUser(null);
          navigate('/');
        }, 1500);
      } else {
        showToast(response.data.message || 'Failed to delete account.', 'error');
      }
    } catch (error) {
      showToast('Something went wrong!', 'error');
    } finally {
      setIsDeleting(false);
      setShowModal(false);
    }
  };


  return (
    <Box maxWidth={500} mx="auto" mt={8} p={3} bgcolor="background.paper" borderRadius={2} boxShadow={3}>
      <ToastContainer position="top-right" autoClose={3000} />
      <Typography variant="h4" align="center" mb={3}>
        Edit Profile
      </Typography>
      <form onSubmit={formik.handleSubmit}>
        <TextField
          label="Name"
          name="name"
          fullWidth
          margin="normal"
          value={formik.values.name}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.name && Boolean(formik.errors.name)}
          helperText={formik.touched.name && formik.errors.name}
        />
        <TextField
          label="Email"
          name="email"
          fullWidth
          margin="normal"
          type="email"
          value={formik.values.email}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.email && Boolean(formik.errors.email)}
          helperText={formik.touched.email && formik.errors.email}
        />
        <TextField
          label="Current Password"
          name="currentPassword"
          type={showCurrentPassword ? 'text' : 'password'}
          fullWidth
          margin="normal"
          value={formik.values.currentPassword}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.currentPassword && Boolean(formik.errors.currentPassword)}
          helperText={formik.touched.currentPassword && formik.errors.currentPassword}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowCurrentPassword((prev) => !prev)}
                  edge="end"
                  tabIndex={-1}
                >
                  {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <TextField
          label="New Password"
          name="newPassword"
          type={showNewPassword ? 'text' : 'password'}
          fullWidth
          margin="normal"
          value={formik.values.newPassword}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.newPassword && Boolean(formik.errors.newPassword)}
          helperText={formik.touched.newPassword && formik.errors.newPassword}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Button
                  onClick={async () => {
                    const pwd = await generatePassword();
                    formik.setFieldValue('newPassword', pwd);
                  }}
                  size="small"
                  sx={{ minWidth: 0, px: 1 }}
                >
                  Suggestions
                </Button>
                <IconButton
                  onClick={() => setShowNewPassword((prev) => !prev)}
                  edge="end"
                  tabIndex={-1}
                >
                  {showNewPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <TextField
          label="Confirm New Password"
          name="confirmPassword"
          type={showConfirmPassword ? 'text' : 'password'}
          fullWidth
          margin="normal"
          value={formik.values.confirmPassword}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
          helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  edge="end"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <Button variant="contained" type="submit" fullWidth sx={{ mt: 2 }} disabled={!formik.isValid || formik.isSubmitting}>
          {formik.isSubmitting ? 'Saving...' : 'Save Changes'}
        </Button>
        <Button
          variant="outlined"
          color="error"
          fullWidth
          sx={{ mt: 2 }}
          onClick={handleDeleteAccount}
          disabled={isDeleting}
        >
          {isDeleting ? <CircularProgress size={24} /> : 'Delete Account'}
        </Button>
      </form>
      <ConfirmModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={confirmDelete}
        message="Are you sure you want to delete your account? This action cannot be undone."
        isLoading={isDeleting}
      />
    </Box>
  );
}