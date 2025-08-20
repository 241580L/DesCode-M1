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

  const [showAISuggestion, setShowAISuggestion] = useState(false);
  const [aiSummary, setAISummary] = useState("");
  const [aiLoading, setAILoading] = useState(false);
  const [aiError, setAIError] = useState(null);

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
          multiline minRows={6}
          label="Description"
          name="description"
          value={formik.values.description}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.description && Boolean(formik.errors.description)}
          helperText={formik.touched.description && formik.errors.description}
        />
        {/* AI Suggestion Section */}
        <Box sx={{ mt: 2 }}>
          {!showAISuggestion ? (
            <Button variant="outlined" onClick={() => setShowAISuggestion(true)}>
              AI Suggestion
            </Button>
          ) : (
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Enter a summary for AI to generate a review:</Typography>
              <TextField
                fullWidth
                multiline
                minRows={2}
                value={aiSummary}
                onChange={e => setAISummary(e.target.value)}
                placeholder="Type your summary here..."
                sx={{ mb: 1 }}
              />
              <Button
                variant="contained"
                disabled={aiLoading || !aiSummary.trim()}
                onClick={async () => {
                  setAILoading(true);
                  setAIError(null);
                  try {
                    // Call backend AI endpoint
                    const res = await http.post("/ai/review-suggestion", { summary: aiSummary });
                    if (res.data && res.data.suggestion) {
                      formik.setFieldValue("description", res.data.suggestion);
                    } else {
                      setAIError("No review generated. Try again.");
                    }
                  } catch (err) {
                    setAIError("Failed to generate review. Try again.");
                  }
                  setAILoading(false);
                }}
                sx={{ mr: 1 }}
              >
                Generate Review
              </Button>
              <Button variant="text" onClick={() => { setShowAISuggestion(false); setAISummary(""); setAIError(null); }}>
                Cancel
              </Button>
              {aiLoading && <LinearProgress sx={{ mt: 1 }} />}
              {aiError && <Alert severity="error" sx={{ mt: 1 }}>{aiError}</Alert>}
            </Box>
          )}
        </Box>
        {/* End AI Suggestion Section */}
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