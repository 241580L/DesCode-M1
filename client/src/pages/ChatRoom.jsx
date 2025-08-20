import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Stack, TextField, Paper, Checkbox,
  FormControlLabel, IconButton, Dialog, DialogContent, DialogTitle,
  DialogActions, Card, CardContent, Select, MenuItem, FormLabel
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import http from '../http';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import useTitle from '../Title';
import { sortByLatest } from '../utils/sort';
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function ChatRoom() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [files, setFiles] = useState([]);
  const [chats, setChats] = useState([]);
  const [chatInfo, setChatInfo] = useState(null);

  // States to track chat being edited (not necessarily current chatInfo)
  const [selectedChat, setSelectedChat] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editExternal, setEditExternal] = useState(false);

  const [createOpen, setCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newExternal, setNewExternal] = useState(false);

  const [search, setSearch] = useState('');
  const [searchMode, setSearchMode] = useState('title');

  useTitle(chatInfo ? chatInfo.title : "Chat Room");

  useEffect(() => {
    http.get('/chat').then(r => {
      setChats(sortByLatest(r.data, "chat"));
    });
  }, []);

  useEffect(() => {
    http.get(`/chat/${id}`).then(r => {
      setMessages(r.data.Messages);
      setChatInfo(r.data);
      // Clear selectedChat if it's different than current chat
      if (selectedChat && selectedChat.id !== r.data.id) {
        setSelectedChat(null);
        setEditOpen(false);
      }
    });
  }, [id]);

  const sendMessage = async () => {
    if (!text.trim() && files.length === 0) {
      toast.error("Message cannot be empty");
      return;
    }
    const formData = new FormData();
    formData.append('text', text);
    files.forEach(f => formData.append('files', f));

    try {
      const response = await http.post(`/chat/${id}/message`, formData);

      // ✅ Handle response depending on status
      switch (response.status) {
        case 200:
          // AI response received successfully
          setText("");
          setFiles([]);
          const { data } = await http.get(`/chat/${id}`);
          setMessages(data.Messages);
          setChatInfo(data);

          // refresh chats list
          const updatedChats = await http.get("/chat");
          setChats(sortByLatest(updatedChats.data, "chat"));
          break;

        case 401:
          toast.error("Invalid API Key");
          break;

        case 429:
          toast.error("Rate limit exceeded. Please wait a moment before retrying.");
          break;

        case 500:
          toast.error("Server error from OpenAI. Please try again later.");
          break;

        default:
          toast.error(`Unexpected error (${response.status}). Please try again.`);
          break;
      }
    } catch (err) {
      // Catch network or unhandled API errors
      if (err.response) {
        const { status } = err.response;
        if (status === 401) {
          toast.error("Invalid API Key. Please check your settings.");
        } else if (status === 429) {
          toast.error("Too many requests. Please slow down.");
        } else if (status === 500) {
          toast.error("OpenAI servers are busy. Try again later.");
        } else {
          toast.error(`Request failed with status ${status}`);
        }
      } else {
        toast.error("Network error. Please check your connection.");
      }
    }
  };

  const handleOpenEdit = () => {
    // Use selectedChat instead of chatInfo
    if (selectedChat) {
      setEditTitle(selectedChat.title);
      setEditExternal(selectedChat.allowExternal);
      setEditOpen(true);
    }
  };

  // Open edit dialog for specific chat
  const openEditDialog = (chat) => {
    setSelectedChat(chat);
    setEditTitle(chat.title);
    setEditExternal(chat.allowExternal);
    setEditOpen(true);
  };

  const saveEdit = async () => {
    if (!selectedChat) return;
    try {
      const { data } = await http.put(`/chat/${selectedChat.id}`, {
        title: editTitle,
        allowExternal: editExternal,
      });
      // Update chat list state with new data
      const updatedChats = chats.map(c => c.id === data.id ? data : c);
      setChats(sortByLatest(updatedChats, "chat"));

      // If editing the currently viewed chat, update chatInfo
      if (selectedChat.id === Number(id)) {
        setChatInfo(data);
      }

      toast.success("Chat updated");
      setEditOpen(false);
      setSelectedChat(null);
    } catch (err) {
      toast.error("Update failed");
    }
  };

  const deleteChat = async () => {
    if (window.confirm("Delete this chat?")) {
      await http.delete(`/chat/${id}`);
      toast.success("Chat deleted");
      navigate("/chat");
    }
  };

  const addChat = () => setCreateOpen(true);

  const saveNewChat = async () => {
    if (!newTitle) return toast.error("Chat title required");
    const { data } = await http.post("/chat", { allowExternal: newExternal, title: newTitle });
    setCreateOpen(false);
    setNewTitle('');
    setNewExternal(false);
    navigate(`/chat/${data.id}`);
  };

  const filteredChats = chats.filter(chat => {
    const query = search.toLowerCase();
    const titleMatch = chat.title.toLowerCase().includes(query);
    const messageMatch = (chat.Messages || []).some(m => m.contents?.toLowerCase().includes(query));
    if (!query) return true;
    if (searchMode === 'title') return titleMatch;
    if (searchMode === 'messages') return messageMatch;
    return titleMatch || messageMatch;
  });

  return (<Box sx={{ display: 'flex', height: '90vh' }}>
    {/* Sidebar, flexShrink: 0 prevents it from changing size*/}
    <Paper sx={{ width: '12em', flexShrink: 0, overflowY: 'auto', px: 2, pt: 1, display: "flex", flexDirection: "column" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h5">Your Chats</Typography>
        <IconButton onClick={addChat}><Add /></IconButton>
      </Box>
      <Box>
        <TextField fullWidth placeholder="Search chats" value={search} onChange={e => setSearch(e.target.value)} />
        <FormLabel sx={{ mt: 2 }}>Search in:</FormLabel>
        <Select
          fullWidth
          size="small"
          value={searchMode}
          onChange={(e) => setSearchMode(e.target.value)}
        >
          <MenuItem value="title">Title</MenuItem>
          <MenuItem value="messages">Messages</MenuItem>
          <MenuItem value="both">Both</MenuItem>
        </Select>

      </Box>
      <Stack spacing={2} sx={{ mt: 2 }}>
        {filteredChats.map(chat => (
            <Card
              key={chat.id}
              sx={{
                cursor: "pointer",
                color: (chat.id === Number(id)) ? "#FFF" : "text.primary",
                bgcolor: (chat.id === Number(id)) ? "primary.main" : "background.paper",
                "&:hover": { boxShadow: 3 }
              }}
              onClick={() => navigate(`/chat/${chat.id}`)}
            >
              <CardContent sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: 1.5 }}>
                <Box sx={{ display: "flex", flexDirection: "column" }}>
                  <Typography>{chat.title}</Typography>
                  <Typography variant="caption" sx={{ mb: -1 }}>
                    {chat.dateLastMessage ? new Date(chat.dateLastMessage).toLocaleString() : ""}
                  </Typography>
                </Box>
                <IconButton
                  size="small"
                  onClick={(e) => { e.stopPropagation(); openEditDialog(chat); }}
                >
                  <Edit />
                </IconButton>
              </CardContent>
            </Card>
          ))}
      </Stack>
    </Paper>

    {/* Main panel */}
    <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
      <Box sx={{ flexGrow: 1, p: 3, overflowY: 'auto' }}>
        <Typography variant="h5" gutterBottom>Chat Room</Typography>
        <Stack spacing={2}>
          {messages.map(m => (
            <Card sx={{ p: 1 }} key={m.id}>
              <Typography component="div">
                <strong>{m.sender === 'user' ? "You: " : "AI: "}</strong>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {m.contents || ''}
                </ReactMarkdown>
              </Typography>
              {m.file && m.file.map(f => (
                // f stands for file, and the below string is the server url becuase files are stored in the server
                <a key={f} href={`${import.meta.env.VITE_API_BASE_URL}/uploads/${f}`} target="_blank" rel="noreferrer" style={{ display: 'block' }}>
                  {f}
                </a>
              ))}
              <Typography variant="caption" display="block">
                {new Date(m.datePosted).toLocaleString()}
              </Typography>
            </Card>
          ))}
        </Stack>
      </Box>
      {/* Message box */}
      <Box sx={{ p: 2, borderTop: '1px solid #ccc' }}>
        <Stack spacing={1}>
          <TextField
            multiline
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Type your message"
            minRows={3}
            fullWidth
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault(); // stop newline
                sendMessage();     // trigger send
              }
            }}
          />
          <Box sx={{ display: "inline-flex", gap: 1 }}>
            <Box
              sx={{
                border: '1px dashed',
                borderColor: 'primary.main',
                borderRadius: 1,
                p: 1,
                display: "inline-flex",
                alignItems: "center",
                width: "fit-content",
                gap: 1,
                flexGrow: 1
              }}
            >
              <Typography variant='caption'>Add your blueprints here...</Typography>
              <input
                type="file"
                multiple
                accept=".pdf,.jpeg,.jpg,.png"
                onChange={e => setFiles(Array.from(e.target.files))}
              />
            </Box>
            <Button variant="contained" onClick={sendMessage} >Send</Button>
          </Box>

        </Stack>
      </Box>

    </Box>

    {/* Create chat dialog */}
    <Dialog open={createOpen} onClose={() => setCreateOpen(false)}>
      <DialogTitle>New Chat</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          margin="dense"
          label="Chat Title"
          value={newTitle}
          onChange={e => setNewTitle(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              saveNewChat();
            }
          }}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={newExternal}
              onChange={e => setNewExternal(e.target.checked)}
            />
          }
          label="Allow external COP sources"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setCreateOpen(false)}>Cancel</Button>
        <Button onClick={saveNewChat} variant="contained">Create</Button>
      </DialogActions>
    </Dialog>


    {/* Edit chat dialog */}
    <Dialog open={editOpen} onClose={() => setEditOpen(false)}>
      <DialogTitle>Edit Chat</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          margin="dense"
          label="Chat Title"
          value={editTitle}
          onChange={e => setEditTitle(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              saveEdit();
            }
          }}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={editExternal}
              onChange={e => setEditExternal(e.target.checked)}
            />
          }
          label="Allow external COP sources"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={deleteChat} color="error" startIcon={<Delete />}>Delete</Button>
        <Button onClick={() => setEditOpen(false)}>Cancel</Button>
        <Button onClick={saveEdit} variant="contained">Save</Button>
      </DialogActions>
    </Dialog>

  </Box>);
}
export default ChatRoom;
