import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, TextField, Button, CircularProgress } from '@mui/material';
import ConfirmModal from '../components/ConfirmModal';
import { ToastContainer, toast } from 'react-toastify';
import UserContext from '../contexts/UserContext';
import http from '../http';

export default function EditProfile() {
  const navigate = useNavigate();
  const { user, setUser } = useContext(UserContext);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showModal, setShowModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  /*
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);
  */

  useEffect(() => {
    if (user) {
      setFormData((f) => ({
        ...f,
        name: user.name || '',
        email: user.email || '',
      }));
    }
  }, [user]);

  const showToast = (text, type) => {
    if (type === 'success') toast.success(text);
    else if (type === 'error') toast.error(text);
    else toast.info(text);
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      navigate('/login');
      return
    }

    if (formData.newPassword || formData.confirmPassword) {
      if (!formData.currentPassword) {
        showToast('Current password is required to change password', 'error');
        return;
      }
      if (formData.newPassword !== formData.confirmPassword) {
        showToast('New passwords do not match', 'error');
        return;
      }
    }

    try {
      // axios PUT call with payload directly
      const payload = {
        name: formData.name,
        email: formData.email,
        originalEmail: user.email,
      };

      if (formData.newPassword) {
        payload.currentPassword = formData.currentPassword;
        payload.newPassword = formData.newPassword;
      }

      const response = await http.put('/user/profile', payload);
      // response.data contains server response
      if (response.status === 200) {
        showToast('Profile updated successfully!', 'success');
        setUser({ ...user, name: formData.name, email: formData.email });
        localStorage.setItem('user', JSON.stringify({ ...user, name: formData.name, email: formData.email }));
        setTimeout(() => navigate('/home'), 1500);
      } else {
        showToast(response.data.message || 'Failed to update profile.', 'error');
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Something went wrong!';
      showToast(msg, 'error');
    }
  };


  const handleDeleteAccount = () => {
    setShowModal(true);
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      const token = localStorage.getItem('accessToken');

      const response = await http.put('/user/profile', payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const result = response.data;

      if (response.ok) {
        showToast('Your account has been deleted.', 'success');
        localStorage.removeItem('user');
        localStorage.removeItem('token');

        setTimeout(() => {
          setUser(null);
          navigate('/');
        }, 1500);
      } else {
        showToast(result.message || 'Failed to delete account.', 'error');
      }
    } catch (error) {
      showToast('Something went wrong!', 'error');
    } finally {
      setIsDeleting(false);
      setShowModal(false);
    }
  };

  return (
    <Box
      maxWidth={500}
      mx="auto"
      mt={8}
      p={3}
      bgcolor="background.paper"
      borderRadius={2}
      boxShadow={3}
    >
      {/* Toast container */}
      <ToastContainer position="top-right" autoClose={3000} />

      <Typography variant="h4" align="center" mb={3}>
        Edit Profile
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Name"
          name="name"
          fullWidth
          margin="normal"
          value={formData.name}
          onChange={handleChange}
        />
        <TextField
          label="Email"
          name="email"
          fullWidth
          margin="normal"
          type="email"
          value={formData.email}
          onChange={handleChange}
        />
        <TextField
          label="Current Password"
          name="currentPassword"
          type="password"
          fullWidth
          margin="normal"
          value={formData.currentPassword}
          onChange={handleChange}
        />
        <TextField
          label="New Password"
          name="newPassword"
          type="password"
          fullWidth
          margin="normal"
          value={formData.newPassword}
          onChange={handleChange}
        />
        <TextField
          label="Confirm New Password"
          name="confirmPassword"
          type="password"
          fullWidth
          margin="normal"
          value={formData.confirmPassword}
          onChange={handleChange}
        />
        <Button variant="contained" type="submit" fullWidth sx={{ mt: 2 }}>
          Save Changes
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