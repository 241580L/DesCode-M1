import React, { useEffect, useState } from 'react';
import AdminNavbar from '../components/AdminNavbar';
import { ToastContainer, toast } from 'react-toastify';
import {
  Box,
  Button,
  TextField,
  Typography,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  Select,
  MenuItem
} from '@mui/material';
import http from '../http';

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [editingUsers, setEditingUsers] = useState({});
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '' });

  const showToast = (text, type) => {
    if (type === 'success') toast.success(text);
    else if (type === 'error') toast.error(text);
    else toast.info(text);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('accessToken');

      const response = await http.get('/user', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const err = await response.json();
        showToast(err.message || 'Failed to load users.', 'error');
        return;
      }

      const data = await response.json();
      setUsers(data);
    } catch (error) {
      showToast('Something went wrong!', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      const token = localStorage.getItem('accessToken');

      const response = await http.delete(`/user/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const err = await response.json();
        showToast(err.message || 'Failed to delete user.', 'error');
        return;
      }

      showToast('User deleted successfully!', 'success');
      setUsers(users.filter((user) => user.id !== id));
    } catch {
      showToast('Failed to delete user.', 'error');
    }
  };

  const handleEdit = (id, field, value) => {
    setEditingUsers({
      ...editingUsers,
      [id]: {
        ...(editingUsers[id] || users.find((u) => u.id === id)),
        [field]: value,
      },
    });
  };

  const handleSave = async (id) => {
    const updatedData = editingUsers[id];
    if (!updatedData) {
      showToast('No changes to save.', 'info');
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');

      const response = await http.put(`/user/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        const err = await response.json();
        showToast(err.message || 'Failed to update user.', 'error');
        return;
      }

      const result = await response.json();
      showToast('User updated successfully!', 'success');
      setUsers(users.map((user) => (user.id === id ? result.user : user)));
      setEditingUsers({ ...editingUsers, [id]: null });
    } catch {
      showToast('Failed to update user.', 'error');
    }
  };

  const handleCreateUser = async () => {
    const { name, email, password } = newUser;

    if (!name || !email || !password) {
      showToast('All fields are required.', 'error');
      return;
    }

    try {
      const response = await http.post('/user/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      if (!response.ok) {
        const err = await response.json();
        showToast(err.message || 'Failed to create user.', 'error');
        return;
      }

      showToast('User created successfully!', 'success');
      fetchUsers();
      setNewUser({ name: '', email: '', password: '' });
    } catch {
      showToast('Failed to create user.', 'error');
    }
  };

  return (
    <Box sx={{ paddingTop: 8 }}>
      <AdminNavbar />
      <Box maxWidth={900} margin="auto" sx={{ mt: 4, px: 2 }}>
        {/* Toast container */}
        <ToastContainer position="top-right" autoClose={3000} />

        <Typography variant="h4" gutterBottom>
          Manage Users
        </Typography>

        <Box display="flex" gap={2} flexWrap="wrap" mb={3}>
          <TextField
            label="Name"
            value={newUser.name}
            onChange={(e) => setNewUser((prev) => ({ ...prev, name: e.target.value }))}
            fullWidth
            sx={{ flex: 1, minWidth: 150 }}
          />
          <TextField
            label="Email"
            type="email"
            value={newUser.email}
            onChange={(e) => setNewUser((prev) => ({ ...prev, email: e.target.value }))}
            fullWidth
            sx={{ flex: 1, minWidth: 150 }}
          />
          <TextField
            label="Password"
            type="password"
            value={newUser.password}
            onChange={(e) => setNewUser((prev) => ({ ...prev, password: e.target.value }))}
            fullWidth
            sx={{ flex: 1, minWidth: 150 }}
          />
          <Button variant="contained" onClick={handleCreateUser} sx={{ height: 56 }}>
            Create User
          </Button>
        </Box>

        {users.length === 0 ? (
          <Typography>No users found.</Typography>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead sx={{ backgroundColor: '#1976d2' }}>
                <TableRow>
                  <TableCell sx={{ color: 'white' }}>ID</TableCell>
                  <TableCell sx={{ color: 'white' }}>Name</TableCell>
                  <TableCell sx={{ color: 'white' }}>Email</TableCell>
                  <TableCell sx={{ color: 'white' }}>Role</TableCell>
                  <TableCell sx={{ color: 'white' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => {
                  const isEditing = editingUsers[user.id];
                  const currentValues = isEditing || user;

                  return (
                    <TableRow key={user.id}>
                      <TableCell>{user.id}</TableCell>
                      <TableCell>
                        <TextField
                          defaultValue={currentValues.name}
                          onChange={(e) => handleEdit(user.id, 'name', e.target.value)}
                          variant="standard"
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          defaultValue={currentValues.email}
                          onChange={(e) => handleEdit(user.id, 'email', e.target.value)}
                          variant="standard"
                        />
                      </TableCell>
                      <TableCell>
                        <Select
                          value={currentValues.isAdmin ? 'Admin' : 'User'}
                          onChange={(e) => handleEdit(user.id, 'isAdmin', e.target.value === 'Admin')}
                          variant="standard"
                        >
                          <MenuItem value="User">User</MenuItem>
                          <MenuItem value="Admin">Admin</MenuItem>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => handleSave(user.id)}
                          sx={{ mr: 1 }}
                        >
                          Save
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          onClick={() => handleDelete(user.id)}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    </Box>
  );
}