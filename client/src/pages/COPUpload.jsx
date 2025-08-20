import React,{useState,useEffect}from 'react';
import {Box,Typography,TextField,Button,Paper,Stack} from '@mui/material';
import {ToastContainer,toast} from 'react-toastify';
import AdminNavbar from '../components/AdminNavbar';
import http from '../http';
import.meta.env;

function COPUpload(){
  const [name,setName]=useState('');
  const [file,setFile]=useState(null);
  const [loading,setLoading]=useState(false);
  const [maxFileSize,setMaxFileSize]=useState(1*1024*1024); // default 1MB

  useEffect(()=>{
    // Get from .env (pass down through VITE_MAX_FILE_SIZE=...)
    if (import.meta.env.VITE_MAX_FILE_SIZE){
      setMaxFileSize(parseInt(import.meta.env.VITE_MAX_FILE_SIZE));
    }
  },[]);

  const handleUpload=async()=>{
    if(!name||!file) return toast.error("Name and file required");

    if(file.size > maxFileSize){
      return toast.error(`File size exceeds (max ${Math.round(maxFileSize/32**4)} MB).`);
    }

    setLoading(true);
    const formData=new FormData();
    formData.append('name',name);
    formData.append('file',file);

    try{
      await http.post('/cop/upload',formData,{headers:{'Content-Type':'multipart/form-data'}});
      toast.success("COP uploaded successfully!");
      setName('');
      setFile(null);
      document.querySelector("input[type='file']").value=null; // reset
    }catch(e){
      toast.error(e.response?.data?.message || "Upload failed");
    }
    setLoading(false);
  };

  return (
    <Box>
      <AdminNavbar/>
      <Paper sx={{maxWidth:500,margin:'auto',p:3}}>
        <Typography variant="h5" mb={2}>Upload Code of Practice (PDF)</Typography>
        <Stack spacing={2}>
          <TextField 
            label="Name" 
            value={name}
            onChange={e=>setName(e.target.value)}
            required
          />
          <Typography variant="body2" color="textSecondary">
            Max file size: {Math.round(maxFileSize / 1024 / 1024)} MB
          </Typography>
          <Box
            sx={{
              border: '1px dashed',
              borderColor: 'primary.main', // Customize color here
              borderRadius: 1,
              p: 1,
              display: "inline-flex", // makes the Box shrink to content
              alignItems: "center",   // nicely aligns input + button
              width: "fit-content",
            }}><input
              type="file"
              accept="application/pdf"
              onChange={e => setFile(e.target.files[0])}
            />
          </Box>
          <Button
            disabled={loading||!name||!file}
            onClick={handleUpload}
            variant="contained"
          >
            {loading?"Uploading...":"Upload"}
          </Button>
        </Stack>
        <ToastContainer/>
      </Paper>
    </Box>
  );
}
export default COPUpload;
