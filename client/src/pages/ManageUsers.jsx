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
    MenuItem,
} from '@mui/material';
import http from '../http';

export default function ManageUsers() {
    const [users, setUsers] = useState([]);
    // store edited values per user id, initial undefined means no change
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
                headers: { Authorization: `Bearer ${token}` },
            });
            setUsers(response.data);
        } catch (error) {
            showToast(
                error.response?.data?.message || 'Failed to load users.',
                'error'
            );
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;
        try {
            const token = localStorage.getItem('accessToken');
            await http.delete(`/user/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            showToast('User deleted successfully!', 'success');
            setUsers(users.filter((user) => user.id !== id));
            // Remove editing state as well
            setEditingUsers((prev) => {
                const copy = { ...prev };
                delete copy[id];
                return copy;
            });
        } catch (error) {
            showToast(
                error.response?.data?.message || 'Failed to delete user.',
                'error'
            );
        }
    };

    const handleEdit = (id, field, value) => {
        setEditingUsers((prev) => ({
            ...prev,
            [id]: {
                ...(prev[id] || users.find((u) => u.id === id)),
                [field]: value,
            },
        }));
    };

    const handleSave = async (id) => {
        const updatedData = editingUsers[id];
        if (!updatedData) {
            showToast('No changes to save.', 'info');
            return;
        }
        try {
            const token = localStorage.getItem('accessToken');
            const { name, email, isAdmin } = updatedData;
            if (!name || !email) {
                showToast('Name and email cannot be empty.', 'error');
                return;
            }
            // Check if email is used by another user
            if (users.some(u => u.email.toLowerCase() === email.toLowerCase() && u.id !== id)) {
                showToast('Email already exists.', 'error');
                return;
            }

            const response = await http.put(`/user/${id}`, { name, email, isAdmin }, { headers: { Authorization: `Bearer ${token}` } });
            showToast('User updated successfully!', 'success');
            setUsers((prevUsers) => prevUsers.map((user) => (user.id === id ? response.data.user : user)));
            setEditingUsers((prev) => {
                const copy = { ...prev };
                delete copy[id];
                return copy;
            });
        } catch (error) {
            showToast(error.response?.data?.message || 'Failed to update user.', 'error');
        }
    };


    const handleCreateUser = async () => {
        const { name, email, password } = newUser;
        if (!name || !email || !password) {
            showToast('All fields are required.', 'error');
            return;
        }

        // Check if email already exists
        if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
            showToast('Email already exists.', 'error');
            return;
        }

        try {
            const response = await http.post('/user/register', { name, email, password });
            showToast('User created successfully!', 'success');
            fetchUsers();
            setNewUser({ name: '', email: '', password: '' });
        } catch (error) {
            showToast(error.response?.data?.message || 'Failed to create user.', 'error');
        }
    };

    return (
        <Box sx={{ pt: 8 }}>
            {/*<AdminNavbar />*/}
            <Box maxWidth={900} margin="auto" sx={{ px: 2 }}>
                <ToastContainer position="top-right" autoClose={3000} />
                <Typography variant="h4" gutterBottom>
                    Manage Users
                </Typography>
                <Box display="flex" gap={2} flexWrap="wrap" mb={3}>
                    <TextField
                        label="Name"
                        value={newUser.name}
                        onChange={(e) =>
                            setNewUser((prev) => ({ ...prev, name: e.target.value }))
                        }
                        fullWidth
                        sx={{ flex: 1, minWidth: 150 }}
                    />
                    <TextField
                        label="Email"
                        type="email"
                        value={newUser.email}
                        onChange={(e) =>
                            setNewUser((prev) => ({ ...prev, email: e.target.value }))
                        }
                        fullWidth
                        sx={{ flex: 1, minWidth: 150 }}
                    />
                    <TextField
                        label="Password"
                        type="password"
                        value={newUser.password}
                        onChange={(e) =>
                            setNewUser((prev) => ({ ...prev, password: e.target.value }))
                        }
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
                            <TableHead sx={{ backgroundColor: 'primary.main' }}>
                                <TableRow>
                                    <TableCell>ID</TableCell>
                                    <TableCell>Name</TableCell>
                                    <TableCell>Email</TableCell>
                                    <TableCell>Role</TableCell>
                                    <TableCell>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {users.map((user) => {
                                    const edited = editingUsers[user.id];
                                    // Use edited values if available, else use original values
                                    const currentValues = edited || user;
                                    return (
                                        <TableRow
                                            key={user.id}
                                            sx={{
                                                backgroundColor: edited ? 'rgba(255, 244, 229, 0.7)' : 'inherit',
                                                // optionally add a border or other style to emphasize changed rows
                                                transition: 'background-color 0.3s ease',
                                            }}
                                        >
                                            <TableCell>{user.id}</TableCell>
                                            <TableCell>
                                                <TextField
                                                    value={currentValues.name}
                                                    onChange={(e) =>
                                                        handleEdit(user.id, 'name', e.target.value)
                                                    }
                                                    variant="standard"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <TextField
                                                    value={currentValues.email}
                                                    onChange={(e) =>
                                                        handleEdit(user.id, 'email', e.target.value)
                                                    }
                                                    variant="standard"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Select
                                                    value={currentValues.isAdmin ? 'Admin' : 'User'}
                                                    onChange={(e) =>
                                                        handleEdit(
                                                            user.id,
                                                            'isAdmin',
                                                            e.target.value === 'Admin'
                                                        )
                                                    }
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
