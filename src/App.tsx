
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/AuthContext';
import Index from '@/pages/Index';
import Auth from '@/pages/Auth';
import LandingPage from '@/pages/LandingPage';
import NotFound from '@/pages/NotFound';
import ErrorBoundary from '@/components/ErrorBoundary';
import DiagnosisDashboard from '@/pages/DiagnosisDashboard';
import DiagnosisChat from '@/pages/DiagnosisChat';
import './App.css';

const App = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Toaster />
        <Router>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/landing" element={<LandingPage />} />
            <Route path="/landing/:ref" element={<LandingPage />} />
            
            {/* Diagnosis Routes - Protected */}
            <Route path="/diagnosis" element={<DiagnosisDashboard />} />
            <Route path="/diagnosis/chat" element={<DiagnosisChat />} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;
