import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  TextField,
  Button,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import SecurityIcon from '@mui/icons-material/Security';
import NotificationsIcon from '@mui/icons-material/Notifications';
import HistoryIcon from '@mui/icons-material/History';
import SaveIcon from '@mui/icons-material/Save';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/api';

const ProfilePage = () => {
  const { currentUser, updateProfile, changePassword, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [currentTab, setCurrentTab] = useState(0);
  const [userActivity, setUserActivity] = useState([]);
  const [activityLoading, setActivityLoading] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  const [profileData, setProfileData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    bio: '',
    location: '',
    organization: ''
  });
  
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  
  const [notificationPreferences, setNotificationPreferences] = useState({
    email_notifications: true,
    bill_updates: true,
    mp_updates: true,
    forum_replies: true,
    system_announcements: true
  });
  
  useEffect(() => {
    if (currentUser) {
      setProfileData({
        first_name: currentUser.first_name || '',
        last_name: currentUser.last_name || '',
        email: currentUser.email || '',
        bio: currentUser.bio || '',
        location: currentUser.location || '',
        organization: currentUser.organization || ''
      });
      
      setNotificationPreferences({
        email_notifications: currentUser.notification_preferences?.email_notifications ?? true,
        bill_updates: currentUser.notification_preferences?.bill_updates ?? true,
        mp_updates: currentUser.notification_preferences?.mp_updates ?? true,
        forum_replies: currentUser.notification_preferences?.forum_replies ?? true,
        system_announcements: currentUser.notification_preferences?.system_announcements ?? true
      });
    }
  }, [currentUser]);
  
  useEffect(() => {
    if (currentTab === 3) {
      fetchUserActivity();
    }
  }, [currentTab]);
  
  const fetchUserActivity = async () => {
    setActivityLoading(true);
    try {
      const response = await userService.getUserActivity();
      setUserActivity(response.data.results || response.data);
    } catch (err) {
      console.error('Error fetching user activity:', err);
      setError('Failed to load activity history. Please try again later.');
    } finally {
      setActivityLoading(false);
    }
  };
  
  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };
  
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData({
      ...profileData,
      [name]: value
    });
  };
  
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value
    });
  };
  
  const handleNotificationChange = (e) => {
    const { name, checked } = e.target;
    setNotificationPreferences({
      ...notificationPreferences,
      [name]: checked
    });
  };
  
  const handleSaveProfile = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const success = await updateProfile(profileData);
      if (success) {
        setSnackbar({ open: true, message: 'Profile updated successfully', severity: 'success' });
      } else {
        setSnackbar({ open: true, message: 'Failed to update profile', severity: 'error' });
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSavePassword = async () => {
    if (passwordData.new_password !== passwordData.confirm_password) {
      setError('New passwords do not match');
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const success = await changePassword({
        current_password: passwordData.current_password,
        new_password: passwordData.new_password
      });
      
      if (success) {
        setSnackbar({ open: true, message: 'Password changed successfully', severity: 'success' });
        setPasswordDialogOpen(false);
        setPasswordData({
          current_password: '',
          new_password: '',
          confirm_password: ''
        });
      } else {
        setError('Failed to change password. Please check your current password.');
      }
    } catch (err) {
      console.error('Error changing password:', err);
      setError('Failed to change password. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSaveNotifications = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const response = await userService.updateNotificationPreferences(notificationPreferences);
      setSnackbar({ open: true, message: 'Notification preferences updated', severity: 'success' });
    } catch (err) {
      console.error('Error updating notification preferences:', err);
      setSnackbar({ open: true, message: 'Failed to update notification preferences', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };
  
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const getActivityTypeLabel = (type) => {
    const types = {
      'login': 'Login',
      'logout': 'Logout',
      'profile_update': 'Profile Update',
      'password_change': 'Password Change',
      'forum_post': 'Forum Post',
      'bill_comment': 'Bill Comment',
      'report_view': 'Report View',
      'search': 'Search'
    };
    return types[type] || type;
  };
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        My Profile
      </Typography>
      
      <Paper sx={{ p: 2, mb: 4 }}>
        <Tabs value={currentTab} onChange={handleTabChange} aria-label="profile tabs">
          <Tab icon={<PersonIcon />} label="Profile" />
          <Tab icon={<SecurityIcon />} label="Security" />
          <Tab icon={<NotificationsIcon />} label="Notifications" />
          <Tab icon={<HistoryIcon />} label="Activity" />
        </Tabs>
        
        <Divider sx={{ my: 2 }} />
        
        {/* Profile Tab */}
        {currentTab === 0 && (
          <Box>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Avatar
                  sx={{ width: 120, height: 120, mb: 2 }}
                  alt={`${profileData.first_name} ${profileData.last_name}`}
                  src={currentUser?.avatar_url}
                >
                  {profileData.first_name?.charAt(0) || 'U'}
                </Avatar>
                <Typography variant="h6" gutterBottom>
                  {currentUser?.email}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Member since {formatDate(currentUser?.date_joined)}
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={8}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="First Name"
                      name="first_name"
                      value={profileData.first_name}
                      onChange={handleProfileChange}
                      variant="outlined"
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Last Name"
                      name="last_name"
                      value={profileData.last_name}
                      onChange={handleProfileChange}
                      variant="outlined"
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Email"
                      name="email"
                      value={profileData.email}
                      onChange={handleProfileChange}
                      variant="outlined"
                      margin="normal"
                      disabled
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Location"
                      name="location"
                      value={profileData.location}
                      onChange={handleProfileChange}
                      variant="outlined"
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Organization"
                      name="organization"
                      value={profileData.organization}
                      onChange={handleProfileChange}
                      variant="outlined"
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Bio"
                      name="bio"
                      value={profileData.bio}
                      onChange={handleProfileChange}
                      variant="outlined"
                      margin="normal"
                      multiline
                      rows={4}
                    />
                  </Grid>
                </Grid>
                
                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<SaveIcon />}
                    onClick={handleSaveProfile}
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        )}
        
        {/* Security Tab */}
        {currentTab === 1 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Account Security
            </Typography>
            
            <List>
              <ListItem>
                <ListItemIcon>
                  <SecurityIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Password" 
                  secondary="Change your account password" 
                />
                <Button 
                  variant="outlined" 
                  onClick={() => setPasswordDialogOpen(true)}
                >
                  Change Password
                </Button>
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemIcon>
                  <SecurityIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Account Sessions" 
                  secondary="Manage your active sessions" 
                />
                <Button 
                  variant="outlined" 
                  color="error"
                  onClick={logout}
                >
                  Logout All Devices
                </Button>
              </ListItem>
            </List>
          </Box>
        )}
        
        {/* Notifications Tab */}
        {currentTab === 2 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Notification Preferences
            </Typography>
            
            <List>
              <ListItem>
                <ListItemIcon>
                  <NotificationsIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Email Notifications" 
                  secondary="Receive notifications via email" 
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={notificationPreferences.email_notifications}
                      onChange={handleNotificationChange}
                      name="email_notifications"
                    />
                  }
                  label=""
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemIcon>
                  <NotificationsIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Bill Updates" 
                  secondary="Get notified about bill status changes" 
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={notificationPreferences.bill_updates}
                      onChange={handleNotificationChange}
                      name="bill_updates"
                      disabled={!notificationPreferences.email_notifications}
                    />
                  }
                  label=""
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemIcon>
                  <NotificationsIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="MP Updates" 
                  secondary="Get notified about MP activity" 
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={notificationPreferences.mp_updates}
                      onChange={handleNotificationChange}
                      name="mp_updates"
                      disabled={!notificationPreferences.email_notifications}
                    />
                  }
                  label=""
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemIcon>
                  <NotificationsIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Forum Replies" 
                  secondary="Get notified about replies to your posts" 
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={notificationPreferences.forum_replies}
                      onChange={handleNotificationChange}
                      name="forum_replies"
                      disabled={!notificationPreferences.email_notifications}
                    />
                  }
                  label=""
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemIcon>
                  <NotificationsIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="System Announcements" 
                  secondary="Get notified about important system updates" 
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={notificationPreferences.system_announcements}
                      onChange={handleNotificationChange}
                      name="system_announcements"
                      disabled={!notificationPreferences.email_notifications}
                    />
                  }
                  label=""
                />
              </ListItem>
            </List>
            
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<SaveIcon />}
                onClick={handleSaveNotifications}
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Preferences'}
              </Button>
            </Box>
          </Box>
        )}
        
        {/* Activity Tab */}
        {currentTab === 3 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            
            {activityLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : userActivity.length === 0 ? (
              <Typography variant="body1" sx={{ p: 2, textAlign: 'center' }}>
                No recent activity found.
              </Typography>
            ) : (
              <List>
                {userActivity.map((activity) => (
                  <React.Fragment key={activity.id}>
                    <ListItem>
                      <ListItemIcon>
                        <HistoryIcon />
                      </ListItemIcon>
                      <ListItemText 
                        primary={getActivityTypeLabel(activity.activity_type)} 
                        secondary={activity.description || 'No description available'} 
                      />
                      <Chip 
                        label={formatDate(activity.timestamp)} 
                        size="small" 
                        variant="outlined"
                      />
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>
            )}
          </Box>
        )}
      </Paper>
      
      {/* Password Change Dialog */}
      <Dialog open={passwordDialogOpen} onClose={() => setPasswordDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <TextField
            margin="dense"
            name="current_password"
            label="Current Password"
            type="password"
            fullWidth
            variant="outlined"
            value={passwordData.current_password}
            onChange={handlePasswordChange}
            required
            sx={{ mb: 2, mt: 1 }}
          />
          <TextField
            margin="dense"
            name="new_password"
            label="New Password"
            type="password"
            fullWidth
            variant="outlined"
            value={passwordData.new_password}
            onChange={handlePasswordChange}
            required
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="confirm_password"
            label="Confirm New Password"
            type="password"
            fullWidth
            variant="outlined"
            value={passwordData.confirm_password}
            onChange={handlePasswordChange}
            required
            sx={{ mb: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPasswordDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSavePassword} variant="contained" disabled={loading}>
            {loading ? 'Saving...' : 'Change Password'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message={snackbar.message}
      />
    </Container>
  );
};

export default ProfilePage; 