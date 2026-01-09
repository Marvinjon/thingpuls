import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  MenuItem,
  Container,
  Avatar,
  Button,
  Tooltip,
  Link,
  Badge,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  FormControl,
  Select,
  InputLabel,
  CircularProgress,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import NotificationsIcon from '@mui/icons-material/Notifications';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import DescriptionIcon from '@mui/icons-material/Description';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import ForumIcon from '@mui/icons-material/Forum';
import CampaignIcon from '@mui/icons-material/Campaign';
import BarChartIcon from '@mui/icons-material/BarChart';
import LogoutIcon from '@mui/icons-material/Logout';
import LoginIcon from '@mui/icons-material/Login';
import { useAuth } from '../../context/AuthContext';
import { useSession } from '../../context/SessionContext';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import PersonIcon from '@mui/icons-material/Person';
import logo from '../../assets/images/logo.svg';

const Header = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const { selectedSession, sessions, loading: sessionLoading, updateSession } = useSession();
  
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };
  
  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };
  
  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };
  
  const handleLogout = () => {
    logout();
    handleCloseUserMenu();
    navigate('/login');
  };

  const handleSessionChange = (event) => {
    const sessionId = event.target.value;
    const session = sessions.find(s => s.id === parseInt(sessionId));
    if (session) {
      updateSession(session);
      // Close drawer on mobile after selection
      if (drawerOpen) {
        setDrawerOpen(false);
      }
    }
  };
  
  // Navigation items for the sidebar drawer
  const navItems = [
    { text: 'Heim', icon: <DashboardIcon />, path: '/' },
    { text: 'Þingmenn', icon: <PeopleIcon />, path: '/parliament/members' },
    { text: 'Þingmál', icon: <DescriptionIcon />, path: '/parliament/bills' },
    { text: 'Atkvæðagreiðslur', icon: <HowToVoteIcon />, path: '/parliament/voting-records' },
    { text: 'Tölfræði', icon: <BarChartIcon />, path: '/analytics/dashboard' },
    { text: 'Umræður', icon: <ForumIcon />, path: '/engagement/forums' },
    ...(currentUser ? [
      // { text: 'Ábendingar', icon: <CampaignIcon />, path: '/engagement/whistleblowing' },
    ] : [])
  ];
  
  const drawer = (
    <Box sx={{ width: 250 }} role="presentation" onClick={handleDrawerToggle}>
      <Box sx={{ display: 'flex', alignItems: 'center', my: 2, ml: 2 }}>
        <Box
          component="img"
          src={logo}
          alt="Þingpúls logo"
          sx={{
            height: 32,
            width: 32,
            mr: 1.5,
          }}
        />
        <Typography variant="h6">
          Þingpúls
        </Typography>
      </Box>
      <Divider />
      {/* Session Selector in Mobile Drawer */}
      <Box sx={{ p: 2 }}>
        <FormControl fullWidth size="small">
          <InputLabel id="session-select-label-mobile">Þing</InputLabel>
          <Select
            labelId="session-select-label-mobile"
            id="session-select-mobile"
            value={selectedSession?.id || ''}
            label="Þing"
            onChange={handleSessionChange}
            disabled={sessionLoading}
          >
            {sessions.map((session) => (
              <MenuItem key={session.id} value={session.id}>
                Þing {session.session_number}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      <Divider />
      <List>
        {navItems.map((item) => (
          <ListItem 
            button 
            key={item.text} 
            component={RouterLink} 
            to={item.path}
            sx={{
              '&:hover': {
                backgroundColor: 'primary.light',
                color: 'primary.contrastText',
              }
            }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </Box>
  );
  
  return (
    <>
      <AppBar position="static">
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            {/* Mobile menu icon */}
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            
            {/* Logo/Title */}
            <Box
              component={RouterLink}
              to="/"
              sx={{
                mr: 2,
                display: { xs: 'none', md: 'flex' },
                alignItems: 'center',
                textDecoration: 'none',
                color: 'inherit',
              }}
            >
              <Box
                component="img"
                src={logo}
                alt="Þingpúls logo"
                sx={{
                  height: 40,
                  width: 40,
                  mr: 1.5,
                }}
              />
              <Typography
                variant="h6"
                noWrap
                sx={{
                  fontFamily: 'monospace',
                  fontWeight: 700,
                  color: 'inherit',
                }}
              >
                ÞINGPÚLS
              </Typography>
            </Box>
            
            {/* Mobile logo */}
            <Box 
              component={RouterLink}
              to="/"
              sx={{ 
                flexGrow: 1, 
                display: { xs: 'flex', md: 'none' },
                alignItems: 'center',
                textDecoration: 'none',
                color: 'inherit',
              }}
            >
              <Box
                component="img"
                src={logo}
                alt="Þingpúls logo"
                sx={{
                  height: 32,
                  width: 32,
                  mr: 1,
                }}
              />
              <Typography
                variant="h5"
                noWrap
                sx={{
                  fontFamily: 'monospace',
                  fontWeight: 700,
                  color: 'inherit',
                }}
              >
                ÞINGPÚLS
              </Typography>
            </Box>
            
            {/* Desktop navigation */}
            <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
              <Button
                component={RouterLink}
                to="/parliament/members"
                sx={{ my: 2, color: 'white', display: 'block' }}
              >
                Þingmenn
              </Button>
              <Button
                component={RouterLink}
                to="/parliament/bills"
                sx={{ my: 2, color: 'white', display: 'block' }}
              >
                Þingmál
              </Button>
              <Button
                component={RouterLink}
                to="/parliament/voting-records"
                sx={{ my: 2, color: 'white', display: 'block' }}
              >
                Atkvæðagreiðslur
              </Button>
              <Button
                component={RouterLink}
                to="/analytics/dashboard"
                sx={{ my: 2, color: 'white', display: 'block' }}
              >
                Tölfræði
              </Button>
              <Button
                component={RouterLink}
                to="/engagement/forums"
                sx={{ my: 2, color: 'white', display: 'block' }}
              >
                Umræður
              </Button>
              
              {/* Session Selector in Desktop */}
              <Box sx={{ ml: 2, minWidth: 120 }}>
                <FormControl size="small" fullWidth>
                  <InputLabel 
                    id="session-select-label" 
                    sx={{ color: 'white', '&.Mui-focused': { color: 'white' } }}
                  >
                    Þing
                  </InputLabel>
                  <Select
                    labelId="session-select-label"
                    id="session-select"
                    value={selectedSession?.id || ''}
                    label="Þing"
                    onChange={handleSessionChange}
                    disabled={sessionLoading}
                    sx={{
                      color: 'white',
                      '.MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(255, 255, 255, 0.5)',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(255, 255, 255, 0.8)',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'white',
                      },
                      '.MuiSvgIcon-root': {
                        color: 'white',
                      },
                    }}
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          bgcolor: 'background.paper',
                        },
                      },
                    }}
                  >
                    {sessionLoading ? (
                      <MenuItem disabled>
                        <CircularProgress size={20} sx={{ mr: 1 }} />
                        Hleður...
                      </MenuItem>
                    ) : (
                      sessions.map((session) => (
                        <MenuItem key={session.id} value={session.id}>
                          Þing {session.session_number}
                        </MenuItem>
                      ))
                    )}
                  </Select>
                </FormControl>
              </Box>
            </Box>
            
            {/* User section */}
            <Box sx={{ flexGrow: 0 }}>
              {currentUser ? (
                <>
                  {/* Notifications */}
                  <IconButton
                    size="large"
                    color="inherit"
                    sx={{ mx: 1 }}
                    component={RouterLink}
                    to="/notifications"
                  >
                    <Badge badgeContent={0} color="error">
                      <NotificationsIcon />
                    </Badge>
                  </IconButton>
                  
                  {/* User menu */}
                  <Tooltip title="Open settings">
                    <IconButton onClick={handleOpenUserMenu} sx={{ p: 0, ml: 1 }}>
                      {currentUser.profile_image ? (
                        <Avatar alt={currentUser.email} src={currentUser.profile_image} />
                      ) : (
                        <Avatar alt={currentUser.email}>
                          {currentUser.email.charAt(0).toUpperCase()}
                        </Avatar>
                      )}
                    </IconButton>
                  </Tooltip>
                  <Menu
                    sx={{ mt: '45px' }}
                    id="menu-appbar"
                    anchorEl={anchorElUser}
                    anchorOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                    keepMounted
                    transformOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                    open={Boolean(anchorElUser)}
                    onClose={handleCloseUserMenu}
                  >
                    <MenuItem component={RouterLink} to="/profile" onClick={handleCloseUserMenu}>
                      <AccountCircleIcon sx={{ mr: 1 }} /> Profile
                    </MenuItem>
                    <MenuItem onClick={handleLogout}>
                      <LogoutIcon sx={{ mr: 1 }} /> Logout
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                <Button
                  component={RouterLink}
                  to="/login"
                  variant="contained"
                  color="secondary"
                  startIcon={<LoginIcon />}
                >
                  Login
                </Button>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
      
      {/* Drawer for mobile navigation */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={handleDrawerToggle}
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default Header; 