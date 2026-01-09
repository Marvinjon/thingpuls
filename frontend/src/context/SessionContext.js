import React, { createContext, useContext, useState, useEffect } from 'react';
import { parliamentService } from '../services/api';

const SessionContext = createContext();

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};

export const SessionProvider = ({ children }) => {
  const [selectedSession, setSelectedSession] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load sessions and set default
  useEffect(() => {
    const loadSessions = async () => {
      try {
        const response = await parliamentService.getSessions();
        const sessionsList = response.data.results || response.data || [];
        setSessions(sessionsList);

        // Get saved session from localStorage
        const savedSessionId = localStorage.getItem('selectedSessionId');
        
        if (savedSessionId) {
          const savedSession = sessionsList.find(s => s.id === parseInt(savedSessionId));
          if (savedSession) {
            setSelectedSession(savedSession);
            setLoading(false);
            return;
          }
        }

        // Default to active session or latest session
        const activeSession = sessionsList.find(s => s.is_active);
        const defaultSession = activeSession || sessionsList[0] || null;
        setSelectedSession(defaultSession);
        
        if (defaultSession) {
          localStorage.setItem('selectedSessionId', defaultSession.id.toString());
        }
      } catch (error) {
        console.error('Error loading sessions:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSessions();
  }, []);

  const updateSession = (session) => {
    setSelectedSession(session);
    if (session) {
      localStorage.setItem('selectedSessionId', session.id.toString());
    } else {
      localStorage.removeItem('selectedSessionId');
    }
  };

  const value = {
    selectedSession,
    sessions,
    loading,
    updateSession,
  };

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
};

