// client/src/pages/EditReview.jsx
import React, { useEffect, useState, useContext } from 'react';
import { Box, Typography, TextField, Button, CircularProgress, Alert } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as yup from 'yup';
import http from '../http';
import UserContext from '../contexts/UserContext';
import StarRating from '../components/StarRating';

function EditReview() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(UserContext);

    const [loading, setLoading] = useState(true);
    const [review, setReview] = useState(null);
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState('loading'); // 'loading', 'success', 'not_found'


    useEffect(() => {
        http.get(`/reviews/${id}`)
            .then((res) => {
                setReview(res.data);
                setStatus('success');
            })
            .catch((err) => {
                if (err.response?.status === 404) {
                    setStatus('not_found')
                setError('This review does not exist or is deleted.');
                } else {
                    setStatus('error')
                setError('Failed to load review.');
                }
            })
            .finally(() => setLoading(false));
    }, [id]);

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            title: review?.title || '',
            description: review?.description || '',
            stars: review?.stars || 3,
        },
        validationSchema: yup.object({
            title: yup.string().required('Title is required').max(100),
            description: yup.string().required('Description is required').max(500),
            stars: yup.number().min(1).max(5).required(),
        }),
        onSubmit: async (data) => {
            if (!user || user.id !== review?.reviewerId) {
                alert('Unauthorized: You cannot edit this review.');
                return;
            }

            try {
                setSaving(true);
                await http.put(`/reviews/${id}`, data);
                navigate(`/reviews/${id}`);
            } catch (err) {
                alert('Failed to update review.');
            } finally {
                setSaving(false);
            }
        },
    });

    if (loading) {
        return <Box sx={{ mt: 4, textAlign: 'center' }}><CircularProgress /></Box>;
    }

    if (error) {
        return <Box sx={{ mt: 4 }}><Alert severity="error">{error}</Alert></Box>;
    }

    const isOwner = user && review?.reviewerId === user?.id;

    return (
        <Box sx={{ mt: 4 }}>
            <Typography variant="h5" sx={{ mb: 2 }}>
                {isOwner ? 'Edit Review' : 'View Review'}
            </Typography>

            <Box component="form" onSubmit={formik.handleSubmit} sx={{ maxWidth: 600 }}>
                <TextField
                    fullWidth
                    margin="normal"
                    label="Title"
                    name="title"
                    value={formik.values.title}
                    onChange={formik.handleChange}
                    disabled={!isOwner}
                    error={formik.touched.title && Boolean(formik.errors.title)}
                    helperText={formik.touched.title && formik.errors.title}
                />
                <TextField
                    fullWidth
                    multiline
                    minRows={3}
                    margin="normal"
                    label="Description"
                    name="description"
                    value={formik.values.description}
                    onChange={formik.handleChange}
                    disabled={!isOwner}
                    error={formik.touched.description && Boolean(formik.errors.description)}
                    helperText={formik.touched.description && formik.errors.description}
                />
                <Box sx={{ mt: 2 }}>
                    <Typography gutterBottom>Rating</Typography>
                    <StarRating
                        value={formik.values.stars}
                        onChange={(newValue) => formik.setFieldValue('stars', newValue)}
                        readOnly={!isOwner}
                    />
                </Box>

                {isOwner && (
                    <Button
                        sx={{ mt: 2 }}
                        variant="contained"
                        type="submit"
                        disabled={saving || !formik.isValid}
                    >
                        {saving ? 'Saving...' : 'Update Review'}
                    </Button>
                )}

                {isOwner && (
                    <Button
                        sx={{ mt: 2, ml: 2 }}
                        color="error"
                        variant="outlined"
                        onClick={async () => {
                            if (window.confirm('Are you sure you want to delete this review?')) {
                                try {
                                    setSaving(true);
                                    await http.delete(`/reviews/${id}`);
                                    navigate('/reviews'); // Redirect after delete
                                } catch (err) {
                                    alert(`Failed to delete review: ${err}`);
                                } finally {
                                    setSaving(false);
                                }
                            }
                        }}
                        disabled={saving}
                    >
                        Delete Review
                    </Button>
                )}
            </Box>
        </Box>
    );
}

export default EditReview;
