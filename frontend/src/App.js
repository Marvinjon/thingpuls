import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import MemberPage from './pages/parliament/MemberPage';
import MemberDetailPage from './pages/parliament/MemberDetailPage';
import BillsPage from './pages/parliament/BillsPage';
import BillDetailPage from './pages/parliament/BillDetailPage';
import VotingRecordsPage from './pages/parliament/VotingRecordsPage';
import DiscussionForumsPage from './pages/engagement/DiscussionForumsPage';
import DiscussionThreadPage from './pages/engagement/DiscussionThreadPage';
import WhistleblowingPage from './pages/engagement/WhistleblowingPage';
import DashboardPage from './pages/analytics/DashboardPage';
import AnalyticsPage from './pages/analytics/AnalyticsPage';
import ProfilePage from './pages/user/ProfilePage';
import NotificationsPage from './pages/user/NotificationsPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <Layout>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/parliament/members" element={<MemberPage />} />
        <Route path="/parliament/members/:id" element={<MemberDetailPage />} />
        <Route path="/parliament/bills" element={<BillsPage />} />
        <Route path="/parliament/bills/:id" element={<BillDetailPage />} />
        <Route path="/parliament/voting-records" element={<VotingRecordsPage />} />
        
        {/* Protected routes */}
        <Route 
          path="/engagement/forums" 
          element={
            <ProtectedRoute>
              <DiscussionForumsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/engagement/forums/:forumId/threads/:threadId" 
          element={
            <ProtectedRoute>
              <DiscussionThreadPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/engagement/whistleblowing" 
          element={
            <ProtectedRoute>
              <WhistleblowingPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/analytics/dashboard" 
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/analytics/reports" 
          element={
            <ProtectedRoute>
              <AnalyticsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/notifications" 
          element={
            <ProtectedRoute>
              <NotificationsPage />
            </ProtectedRoute>
          } 
        />
        
        {/* 404 page */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Layout>
  );
}

export default App; 