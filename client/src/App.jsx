import './App.css';
import Home from './pages/Home';
import Reviews from './pages/Reviews';
import Review from './pages/Review';
import AddReview from './pages/AddReview';
import EditReview from './pages/EditReview';
import Register from './pages/Register';
import Login from './pages/Login';
import EditProfile from './pages/EditProfile';
import AdminPage from './pages/Admin';
import ManageUsers from './pages/ManageUsers';
import UserContext from './contexts/UserContext';
import {
  Container,
  AppBar,
  Box,
  Button,
  Toolbar,
  Typography,
} from '@mui/material';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import MyTheme from './themes/MyTheme';
import http from './http';

function AppBarLinks({ user, logout }) {
  // console.log("id:", user);
  const location = useLocation();
  const currentPath = location.pathname;
  if (user) {
    return (
      <>
        <Typography sx={{ mr: 2 }}>{user.name}</Typography>
        {/* Add Edit Profile Button */}
        <Button component={Link} to="/edit-profile" color="inherit" sx={{ mr: 2 }}>
          Edit Profile
        </Button>
        {user.isAdmin ? <Button component={Link} color="inherit" to="/admin">Admin</Button> : null}
        <Button color="inherit" onClick={logout}>
          Logout
        </Button>
      </>
    );
  } else {
    return (
      <>
        <Button component={Link} to={`/register?from=${encodeURIComponent(currentPath)}`} color="inherit">
          Register
        </Button>
        <Button component={Link} to={`/login?from=${encodeURIComponent(currentPath)}`} color="inherit">
          Login
        </Button>
      </>
    );
  }
}


function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (localStorage.getItem('accessToken')) {
      http.get('/user/auth').then((res) => {
        setUser(res.data.user);
      });
    }
  }, []);

  const logout = () => {
    if (
      window.confirm('Are you sure you want to logout?')
    ) {
      localStorage.clear();
      setUser(null);
      // Instead of window reload, navigate or reset state
      window.location.href = '/';
    }
  };

  return (
    <UserContext.Provider value={{ user, setUser }}>
      <Router>
        <ThemeProvider theme={MyTheme}>
          <AppBar position="static" className="AppBar">
            <Container>
              <Toolbar disableGutters={true}>
                <Button
                  component={Link}
                  to="/"
                  variant="text"
                  sx={{ color: 'white', textTransform: 'none', fontWeight: 'bold', fontSize: 20 }}
                >
                  Descode
                </Button>
                <Button component={Link} to="/reviews" color="inherit">
                  Reviews
                </Button>
                <Box sx={{ flexGrow: 1 }}></Box>
                <AppBarLinks user={user} logout={logout} />
              </Toolbar>
            </Container>
          </AppBar>
          <Container>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/reviews" element={<Reviews />} />
              <Route path="/reviews/:id" element={<Review />} />
              <Route path="/addreview" element={<AddReview />} />
              <Route path="/editreview/:id" element={<EditReview />} />
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />
              <Route path="/edit-profile" element={<EditProfile />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/manage-users" element={<ManageUsers />} />
            </Routes>
          </Container>
        </ThemeProvider>
      </Router>
    </UserContext.Provider>
  );
}

export default App;
