// ./client/src/pages/COPView.jsx
import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Paper, Container } from '@mui/material';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import http from '../http';
import { ToastContainer, toast } from 'react-toastify';

function COPView() {
  const { id } = useParams();
  const [doc, setDoc] = useState(null);
  const [file, setFile] = useState(null);
  const [users, setUsers] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    http.get(`/cop/${id}`)
      .then(res => {
        setDoc(res.data);
        // Fetch uploader + editor details
        const ids = [res.data.uploader, res.data.editor].filter(Boolean);
        ids.forEach(uid => {
          http.get(`/user/${uid}`).then(r => {
            setUsers(prev => ({ ...prev, [uid]: r.data.name }));
          });
        });
      })
      .catch(() => toast.error("Failed to load COP"));
  }, [id]);

  const handleReplace = async () => {
    if (!file) return toast.error("No file selected");

    const formData = new FormData();
    formData.append('file', file);

    try {
      await http.put(`/cop/${id}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success("COP replaced!");
      window.location.reload();
    } catch (err) {
      toast.error(err.response?.data?.message || "Replace failed");
    }
  };

  if (!doc) return null;

  return (
    <Container>
      <Button variant="outlined" sx={{ m: 3 }} onClick={() => navigate("/cop")}>
        &lt;&lt; Back to List
      </Button>
      <Paper sx={{ maxWidth: 900, mx: 3, p: 3 }}>
        <Typography variant="h4">{doc.name}</Typography>

        <Typography>
          Uploaded: {new Date(doc.dateUploaded).toLocaleString()} by{" "}
          {users[doc.uploader] ?? "Unknown"}
        </Typography>

        {doc.dateEdited && doc.editor && (
          <Typography>
            Last Edited: {new Date(doc.dateEdited).toLocaleString()} by{" "}
            {users[doc.editor] ?? "Unknown"}
          </Typography>
        )}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2, // spacing between elements
            mt: 2,
          }}
        >


          <Box
            sx={{
              border: '1px dashed',
              borderColor: 'primary.main', // Customize color here
              borderRadius: 1,
              p: 1,
              display: "inline-flex", // makes the Box shrink to content
              alignItems: "center",   // nicely aligns input + button
              width: "fit-content",
            }}>
            <input
              type="file"
              accept="application/pdf"
              onChange={e => setFile(e.target.files[0])}
            />
            <Button
              onClick={handleReplace}
              disabled={!file}
              variant="contained"
              sx={{ ml: 1 }}
            >
              Replace PDF
            </Button>
          </Box>

          <Box sx={{display: "flex", gap: 2}}>
            {/* Download as button */}
            {doc.contents && (
              <Button
                component="a"
                href={`${import.meta.env.VITE_API_BASE_URL}/uploads/${doc.contents}`}
                target="_blank"
                rel="noreferrer"
                variant="contained"
                color="primary"
                sx={{ width: "fit-content" }}
              >
                Download PDF
              </Button>
            )}
            <Button
              variant="outlined"
              color="error"
              sx={{ width: "fit-content" }}
              onClick={async () => {
                if (window.confirm("Are you sure you want to delete this COP?")) {
                  await http.delete(`/cop/${doc.id}`);
                  toast.success("COP deleted");
                  navigate("/cop");
                }
              }}
            >
              Delete
            </Button>
          </Box>

        </Box>



        <ToastContainer />
      </Paper>
    </Container>
  );
}
export default COPView;
