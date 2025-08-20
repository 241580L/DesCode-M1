import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Container, Stack, Link } from '@mui/material';
import http from '../http';
import { ToastContainer, toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import AdminNavbar from '../components/AdminNavbar';

function COPList() {
  const [docs, setDocs] = useState([]);
  const [users, setUsers] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    http.get('/cop')
      .then(res => {
        setDocs(res.data);
        // collect uploader/editor IDs
        const ids = [
          ...new Set(res.data.flatMap(doc => [doc.uploader, doc.editor].filter(Boolean)))
        ];
        // fetch associated users
        ids.forEach(id => {
          http.get(`/user/${id}`).then(r => {
            setUsers(prev => ({ ...prev, [id]: r.data.name }));
          });
        });
      })
      .catch(() => toast.error("Failed to load COPs"));
  }, []);

  const handleDelete = async (id) => {
    await http.delete(`/cop/${id}`);
    setDocs(docs.filter(doc => doc.id !== id));
    toast.success("COP deleted");
  };

  return (
    <Box>
      <AdminNavbar />
      <Container>
        <Typography variant="h4" gutterBottom>List of C.o.P. Documents</Typography>
        <Box display="flex" gap={2} flexWrap="wrap" mb={3}>
          <Link onClick={() => navigate("/cop/upload")} style={{ textDecoration: 'none' }}>
            <Button variant='contained'>Add C.o.P Document</Button>
          </Link>
        </Box>
        <Stack spacing={2}>
          {docs.length > 0 ? docs.map(doc => (
            <Box key={doc.id} sx={{ border: '1px solid #ccc', p: 2, borderRadius: 2 }}>
              <Typography variant="h5">{doc.name}</Typography>
              <Typography>
                Uploaded: {new Date(doc.dateUploaded).toLocaleString()} by {users[doc.uploader] ?? `Unknown`}
              </Typography>
              {doc.dateEdited && doc.editor && (
                <Typography>
                  Last Edited: {new Date(doc.dateEdited).toLocaleString()} by {users[doc.editor] ?? `Unknown`}
                </Typography>
              )}
              <Box sx={{mt:1, display: "flex", gap:2}}>
                <Button variant="contained" onClick={() => navigate(`/cop/${doc.id}`)}>View / Edit</Button>
                {doc.contents && (
                  <Button
                    component="a"
                    href={`${import.meta.env.VITE_API_BASE_URL}/uploads/${doc.contents}`}
                    target="_blank"
                    rel="noreferrer"
                    variant="outlined"
                  >
                    Download PDF
                  </Button>
                )}
              </Box>

            </Box>
          )) : <Typography>The C.o.P Document List is Empty.</Typography>}
        </Stack>
      </Container>
      <ToastContainer />
    </Box>
  );
}
export default COPList;