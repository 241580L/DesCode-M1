import React,{useState,useEffect}from 'react';
import{Box,Button,Checkbox,Container,FormControlLabel,Tooltip,Typography,Stack,Card,CardActionArea,CardContent,IconButton,Dialog,DialogTitle,DialogContent,TextField,DialogActions,RadioGroup,Radio,FormLabel}from '@mui/material';
import{Edit}from '@mui/icons-material';
import http from '../http';
import{ToastContainer,toast}from 'react-toastify';
import{useNavigate}from 'react-router-dom';
import useTitle from '../Title.jsx';
import { sortByLatest } from '../utils/sort';   // ✅ import helper

function ChatList(){
  const [chats,setChats]=useState([]);
  const [allowExternal,setAllowExternal]=useState(false);
  const [hasCOPs,setHasCOPs]=useState(true);
  const [selectedChat,setSelectedChat]=useState(null);
  const [editOpen,setEditOpen]=useState(false);
  const [editTitle,setEditTitle]=useState('');
  const [editExternal,setEditExternal]=useState(false);
  const [createOpen,setCreateOpen]=useState(false);
  const [newTitle,setNewTitle]=useState('');
  const [search,setSearch]=useState('');
  const [searchMode,setSearchMode]=useState('title');
  const navigate=useNavigate();
  useTitle("Checkbot Chat List");

  useEffect(()=>{
    http.get('/chat')
      .then(r=> setChats(sortByLatest(r.data,"chat")));
    http.get('/cop').then(r=>setHasCOPs(r.data.length>0));
  },[]);

  const handleCreateChat=async()=>{
    if(!newTitle) return toast.error("Chat title required");
    if(!hasCOPs && !allowExternal) return toast.error("No COPs available. Enable external sources.");

    const{data}=await http.post('/chat',{allowExternal,title:newTitle});
    setCreateOpen(false);
    setNewTitle('');
    navigate(`/chat/${data.id}`);
  };

  const openEditDialog=(chat)=>{
    setSelectedChat(chat);
    setEditTitle(chat.title);
    setEditExternal(chat.allowExternal);
    setEditOpen(true);
  };

  const saveEdit=async()=>{
    if(!selectedChat)return;
    try{
      const{data}=await http.put(`/chat/${selectedChat.id}`,{title:editTitle,allowExternal:editExternal});
      setChats(sortByLatest(chats.map(c=>c.id===data.id?data:c),"chat"));
      toast.success("Chat updated");
      setEditOpen(false);
    }catch(err){
      toast.error(err.response?.data?.message||"Update failed");
    }
  };

  const filteredChats=chats.filter(chat=>{
    const query=search.toLowerCase();
    const titleMatch=chat.title.toLowerCase().includes(query);
    const messageMatch=(chat.Messages||[]).some(m=>m.contents?.toLowerCase().includes(query));
    if(!query) return true;
    if(searchMode==='title') return titleMatch;
    if(searchMode==='messages') return messageMatch;
    return titleMatch||messageMatch;
  });

  return(
    <Container>
      <Typography variant="h4" sx={{mt:2}}>DesCode ChatBot</Typography>
      <Typography>Use our chatbot to check if your blueprints follow the rules stated in the C.o.P documents in our database.</Typography>
      <Stack direction="row" spacing={2}sx={{my:2}}>
        <Button variant="contained" onClick={()=>setCreateOpen(true)}>New Chat</Button>
      </Stack>
      <Box sx={{mb:2}}>
        <TextField fullWidth placeholder="Search chats..." value={search}onChange={e=>setSearch(e.target.value)}/>
        <FormLabel>Search in:</FormLabel>
        <RadioGroup row value={searchMode}onChange={(e)=>setSearchMode(e.target.value)}>
          <FormControlLabel value="title" control={<Radio/>}label="Title"/>
          <FormControlLabel value="messages" control={<Radio/>}label="Messages"/>
          <FormControlLabel value="both" control={<Radio/>}label="Both"/>
        </RadioGroup>
      </Box>
      <Typography mt={2}variant="h5">Your Chats:</Typography>
      <Stack spacing={2}sx={{mt:1}}>
        {chats.length==0?"You have no chats":filteredChats.length==0?"No results matched your search":filteredChats.map(chat=>(
          <Card key={chat.id}variant="outlined" sx={{position:'relative'}}>
            <CardActionArea onClick={()=>navigate(`/chat/${chat.id}`)}>
              <CardContent>
                <Typography variant="h6">{chat.title}</Typography>
                <Typography variant="body2" color="text.secondary" noWrap>
                  {chat.Messages?.length>0?chat.Messages[chat.Messages.length-1].contents:"No messages yet"}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {chat.dateLastMessage?new Date(chat.dateLastMessage).toLocaleString():"No activity"}
                </Typography>
              </CardContent>
            </CardActionArea>
            <IconButton onClick={()=>openEditDialog(chat)}size="small" sx={{position:'absolute',top:8,right:8}}>
              <Edit fontSize="small"/>
            </IconButton>
          </Card>
        ))}
      </Stack>

      {/* Create Chat Dialog */}
      <Dialog open={createOpen}onClose={()=>setCreateOpen(false)}>
        <DialogTitle>New Chat</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth margin="dense" label="Chat Title"
            value={newTitle}onChange={e=>setNewTitle(e.target.value)}
          />
          <FormControlLabel
            control={<Checkbox checked={allowExternal}onChange={e=>setAllowExternal(e.target.checked)}/>}
            label="Allow external COP sources"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={()=>setCreateOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateChat}variant="contained">Create</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Chat Dialog */}
      <Dialog open={editOpen}onClose={()=>setEditOpen(false)}>
        <DialogTitle>Edit Chat</DialogTitle>
        <DialogContent>
          <TextField fullWidth margin="dense" label="Chat Title" value={editTitle}onChange={e=>setEditTitle(e.target.value)}/>
          <FormControlLabel
            control={<Checkbox checked={editExternal}onChange={e=>setEditExternal(e.target.checked)}/>}
            label={<Tooltip title="This allows use of Codes of Practice from other sources. Experimental feature.">Allow external COP sources (experimental)</Tooltip>}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={()=>setEditOpen(false)}>Cancel</Button>
          <Button onClick={saveEdit}variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
      <ToastContainer/>
    </Container>
  );
}
export default ChatList;
