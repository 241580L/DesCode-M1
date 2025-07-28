// client/src/App.jsx
import './App.css';
// PAGELIST //
// Below is a list of pages, in the page directory.
import Reviews from './pages/Reviews';
import Review from './pages/Review';
import AddReview from './pages/AddReview';
import EditReview from './pages/EditReview';
import Register from './pages/Register';
import Login from './pages/Login';
import UserContext from './contexts/UserContext';
////
import { Container, AppBar, Box, Button, Toolbar, Typography } from '@mui/material';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import MyTheme from './themes/MyTheme';
import http from './http';
import Home from './pages/Home';

function App() {
  const [user, setUser] = useState(null);
  useEffect(() => {
    if (localStorage.getItem("accessToken")) {
      // Todo: get user data from server
      http.get('/user/auth').then((res) => {
        setUser(res.data.user);
      });
    }
  }, []);
  const logout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      if (window.confirm("Please confirm again to logout.")) {
        localStorage.clear();
        window.location = "/";
      }
    }
  };
  return (
    <UserContext.Provider value={{ user, setUser }}>
      <Router>
        <ThemeProvider theme={MyTheme}>
          <AppBar position="static" className='AppBar'>
            <Container>
              <Toolbar disableGutters={true}>
                <Link to="/">
                  <Typography variant="h6" component="div">
                    Descode
                  </Typography>
                </Link>
                <Link to="/reviews" ><Typography>Reviews</Typography></Link>
                <Box sx={{ flexGrow: 1 }}></Box>
                {user && (
                  <>
                    <Typography>{user.name}</Typography>
                    <Button onClick={logout}>Logout</Button>
                  </>
                )
                }
                {!user && (
                  <>
                    <Link to="/register" ><Typography>Register</Typography></Link>
                    <Link to="/login" ><Typography>Login</Typography></Link>
                  </>
                )}
              </Toolbar>
            </Container>
          </AppBar>
          <Container>
            <Routes>
              <Route path={"/"} element={<Home />} />
              <Route path={"/reviews"} element={<Reviews />} />
              <Route path={"/reviews/:id"} element={<Review />} />
              <Route path={"/addreview"} element={<AddReview />} />
              <Route path={"/editreview/:id"} element={<EditReview />} />
              <Route path={"/register"} element={<Register />} />
              <Route path={"/login"} element={<Login />} />
            </Routes>
          </Container>
        </ThemeProvider>
      </Router>
    </UserContext.Provider>
  );
}
export default App;