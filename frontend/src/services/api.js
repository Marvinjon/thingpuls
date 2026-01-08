import axios from 'axios';

// Get API base URL from environment or default to relative path
const API_BASE_URL = process.env.REACT_APP_API_URL || '';

// Create API instance
const api = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add authorization header to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token && token !== 'null' && token !== 'undefined') {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to handle authentication errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If we get a 401 error, clear invalid tokens
    if (error.response && error.response.status === 401) {
      const token = localStorage.getItem('accessToken');
      // Only clear tokens if we actually sent one
      if (token && error.config.headers.Authorization) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      }
    }
    return Promise.reject(error);
  }
);

// Parliament API services
export const parliamentService = {
  // Members of Parliament
  getMembers: (params) => api.get('/parliament/mps/', { params }),
  getMemberById: (id) => api.get(`/parliament/mps/${id}/`),
  getMemberSpeeches: (id, params) => api.get(`/parliament/mps/${id}/speeches/`, { params }),
  getMemberBills: (id) => api.get(`/parliament/mps/${id}/bills/`),
  getMemberVotingRecord: (id) => api.get(`/parliament/mps/${id}/voting_record/`),
  getMemberInterests: (id) => api.get(`/parliament/mps/${id}/interests/`),
  
  // Bills
  getBills: (params) => api.get('/parliament/bills/', { params }),
  getBillById: (id) => api.get(`/parliament/bills/${id}/`),
  getBillAmendments: (id) => api.get(`/parliament/bills/${id}/amendments/`),
  getBillSpeeches: (id) => api.get(`/parliament/bills/${id}/speeches/`),
  getBillVotes: (id) => api.get(`/parliament/bills/${id}/votes/`),
  getBillStatistics: (params) => api.get('/parliament/bills/statistics/', { params }),
  
  // Other parliamentary data
  getParties: () => api.get('/parliament/parties/'),
  getTopics: () => api.get('/parliament/topics/'),
  getSessions: () => api.get('/parliament/sessions/'),
  getVotes: (params) => api.get('/parliament/votes/', { params }),
  getAmendments: (params) => api.get('/parliament/amendments/', { params }),
  getSpeeches: (params) => api.get('/parliament/speeches/', { params }),
};

// Engagement API services
export const engagementService = {
  // Discussion forums
  getForums: (params) => api.get('/engagement/forums/', { params }),
  getForumById: (id) => api.get(`/engagement/forums/${id}/`),
  getForumThreads: (id) => api.get(`/engagement/forums/${id}/threads/`),
  createForum: (data) => api.post('/engagement/forums/', data),
  updateForum: (id, data) => api.patch(`/engagement/forums/${id}/`, data),
  deleteForum: (id) => api.delete(`/engagement/forums/${id}/`),
  
  // Discussion threads
  getThreads: (params) => api.get('/engagement/threads/', { params }),
  getThreadById: (id) => api.get(`/engagement/threads/${id}/`),
  createThread: (data) => api.post('/engagement/threads/', data),
  updateThread: (id, data) => api.patch(`/engagement/threads/${id}/`, data),
  deleteThread: (id) => api.delete(`/engagement/threads/${id}/`),
  togglePinThread: (id) => api.post(`/engagement/threads/${id}/toggle_pin/`),
  toggleLockThread: (id) => api.post(`/engagement/threads/${id}/toggle_lock/`),
  
  // Discussion posts
  getPosts: (params) => api.get('/engagement/posts/', { params }),
  getPostById: (id) => api.get(`/engagement/posts/${id}/`),
  createPost: (data) => api.post('/engagement/posts/', data),
  updatePost: (id, data) => api.patch(`/engagement/posts/${id}/`, data),
  deletePost: (id) => api.delete(`/engagement/posts/${id}/`),
  upvotePost: (id) => api.post(`/engagement/posts/${id}/upvote/`),
  downvotePost: (id) => api.post(`/engagement/posts/${id}/downvote/`),
  
  // Whistleblowing
  getWhistleblowingReports: (params) => api.get('/engagement/whistleblowing/', { params }),
  getWhistleblowingReportById: (id) => api.get(`/engagement/whistleblowing/${id}/`),
  createWhistleblowingReport: (data) => api.post('/engagement/whistleblowing/', data),
  updateWhistleblowingReport: (id, data) => api.patch(`/engagement/whistleblowing/${id}/`, data),
  
  // Notifications
  getNotifications: (params) => api.get('/engagement/notifications/', { params }),
  markNotificationAsRead: (id) => api.post(`/engagement/notifications/${id}/mark_as_read/`),
  markAllNotificationsAsRead: () => api.post('/engagement/notifications/mark_all_as_read/'),
};

// Analytics API services
export const analyticsService = {
  // Dashboard
  getDashboardConfig: () => api.get('/analytics/dashboard/'),
  updateDashboardConfig: (data) => api.patch('/analytics/dashboard/', data),
  
  // Saved searches
  getSavedSearches: (params) => api.get('/analytics/saved-searches/', { params }),
  getSavedSearchById: (id) => api.get(`/analytics/saved-searches/${id}/`),
  createSavedSearch: (data) => api.post('/analytics/saved-searches/', data),
  updateSavedSearch: (id, data) => api.patch(`/analytics/saved-searches/${id}/`, data),
  deleteSavedSearch: (id) => api.delete(`/analytics/saved-searches/${id}/`),
  
  // Analytics reports
  getReports: (params) => api.get('/analytics/reports/', { params }),
  getReportById: (id) => api.get(`/analytics/reports/${id}/`),
  createReport: (data) => api.post('/analytics/reports/', data),
  updateReport: (id, data) => api.patch(`/analytics/reports/${id}/`, data),
  deleteReport: (id) => api.delete(`/analytics/reports/${id}/`),
  
  // Pre-defined analytics
  getVotingPatterns: (params) => api.get('/analytics/reports/voting_patterns/', { params }),
  getMPActivity: (params) => api.get('/analytics/reports/mp_activity/', { params }),
  getTopicTrends: (params) => api.get('/analytics/reports/topic_trends/', { params }),
  getTopSpeakers: (params) => api.get('/analytics/reports/top_speakers/', { params }),
  
  // Data exports
  getExports: (params) => api.get('/analytics/exports/', { params }),
  getExportById: (id) => api.get(`/analytics/exports/${id}/`),
  createExport: (data) => api.post('/analytics/exports/', data),
  retryExport: (id) => api.post(`/analytics/exports/${id}/retry/`),
};

// User profile API services
export const userService = {
  getCurrentUser: () => api.get('/auth/users/me/'),
  updateProfile: (data) => api.patch('/auth/users/me/', data),
  changePassword: (data) => api.post('/auth/users/change_password/', data),
  updateNotificationPreferences: (data) => api.post('/auth/users/update_notification_preferences/', data),
  getUserActivity: () => api.get('/auth/activity/'),
};

export default {
  parliamentService,
  engagementService,
  analyticsService,
  userService,
}; 