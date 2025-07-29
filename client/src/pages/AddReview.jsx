// client/src/pages/AddReview.jsx
import React, { useEffect, useState, useContext } from 'react';
import { Box, Button, Typography, TextField, Alert, LinearProgress } from '@mui/material';
import { useFormik } from 'formik';
import { useNavigate } from 'react-router-dom';
import * as yup from 'yup';
import http from '../http';
import StarRating from '../components/StarRating';
import UserContext from '../contexts/UserContext';
// visually display stars

function AddReview() {
  const navigate = useNavigate();
  const { user, setUser } = useContext(UserContext);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  // ^ These three are react state hooks and tracks request status
  
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const formik = useFormik({
    initialValues: {
      title: "",
      description: "",
      stars: 3 // Default to 3 stars
    },
    validationSchema: yup.object({
      title: yup.string().trim()
        .min(3, 'Title must be at least 3 characters')
        .max(100, 'Title must be at most 100 characters')
        .required('Title is required'),
      description: yup.string().trim()
        .min(3, 'Description must be at least 3 characters')
        .max(500, 'Description must be at most 500 characters')
        .required('Description is required'),
      stars: yup.number().min(1).max(5).required()
    }),
    onSubmit: (data) => {
      setLoading(true);
      setError(null);
      data.title = data.title.trim();
      data.description = data.description.trim();
      http.post("/reviews", data)
        .then((res) => {
          setSuccess(true);
          setTimeout(() => navigate("/reviews"), 1500);
        })
        .catch(err => {
          setError('Failed to add review. Please try again.');
        })
        .finally(() => setLoading(false));
    }
  });
  return (
    <Box>
      <Typography variant="h5" sx={{ my: 2, fontWeight: 'bold' }}>
        Add Review
      </Typography>
      <Box component="form" onSubmit={formik.handleSubmit} sx={{ maxWidth: 500 }}>
        {loading && <LinearProgress sx={{ mb: 2 }} />}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>Review added!</Alert>}
        <TextField
          fullWidth margin="dense" autoComplete="off"
          label="Title"
          name="title"
          value={formik.values.title}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.title && Boolean(formik.errors.title)}
          helperText={formik.touched.title && formik.errors.title}
        />
        <TextField
          fullWidth margin="dense" autoComplete="off"
          multiline minRows={2}
          label="Description"
          name="description"
          value={formik.values.description}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.description && Boolean(formik.errors.description)}
          helperText={formik.touched.description && formik.errors.description}
        />
        <Box sx={{ mt: 2, mb: 1 }}>
          <Typography variant="subtitle1" sx={{ mb: 0.5 }}>Your Rating</Typography>
          <StarRating
            value={formik.values.stars}
            onChange={(val) => formik.setFieldValue('stars', val)}
            readOnly={false}
            size="large"
          />
          {formik.touched.stars && formik.errors.stars && (
            <Typography color="error" variant="caption">{formik.errors.stars}</Typography>
          )}
        </Box>
        <Box sx={{ mt: 2 }}>
          <Button variant="contained" type="submit" disabled={loading}>
            Add
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

export default AddReview;