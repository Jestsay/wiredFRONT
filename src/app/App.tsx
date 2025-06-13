import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '../state/authStore';
import LandingPage from '../pages/LandingPage';
import CallbackPage from '../pages/auth/CallbackPage';
import DashboardPage from '../pages/dashboard/DashboardPage';
import MainLayout from '../layouts/MainLayout';

function App() {
  const { user, loading } = useAuthStore();

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted">Loading PULSE OS...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-bg">
        <Routes>
          <Route 
            path="/" 
            element={user ? <Navigate to="/dashboard" replace /> : <LandingPage />} 
          />
          <Route 
            path="/auth/callback" 
            element={<CallbackPage />} 
          />
          <Route 
            path="/dashboard" 
            element={
              user ? (
                <MainLayout>
                  <DashboardPage />
                </MainLayout>
              ) : (
                <Navigate to="/" replace />
              )
            } 
          />
          <Route 
            path="/development" 
            element={
              user ? (
                <MainLayout>
                  <div className="p-6">
                    <h1 className="text-3xl font-bold wf-text-gradient">Development Workspace</h1>
                    <p className="text-muted mt-2">Coming soon...</p>
                  </div>
                </MainLayout>
              ) : (
                <Navigate to="/" replace />
              )
            } 
          />
          <Route 
            path="/training" 
            element={
              user ? (
                <MainLayout>
                  <div className="p-6">
                    <h1 className="text-3xl font-bold wf-text-gradient">Training Center</h1>
                    <p className="text-muted mt-2">Coming soon...</p>
                  </div>
                </MainLayout>
              ) : (
                <Navigate to="/" replace />
              )
            } 
          />
          <Route 
            path="/gallery" 
            element={
              user ? (
                <MainLayout>
                  <div className="p-6">
                    <h1 className="text-3xl font-bold wf-text-gradient">Asset Gallery</h1>
                    <p className="text-muted mt-2">Coming soon...</p>
                  </div>
                </MainLayout>
              ) : (
                <Navigate to="/" replace />
              )
            } 
          />
          <Route 
            path="/chat" 
            element={
              user ? (
                <MainLayout>
                  <div className="p-6">
                    <h1 className="text-3xl font-bold wf-text-gradient">AI Chat</h1>
                    <p className="text-muted mt-2">Coming soon...</p>
                  </div>
                </MainLayout>
              ) : (
                <Navigate to="/" replace />
              )
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;