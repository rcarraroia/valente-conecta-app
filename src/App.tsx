
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/AuthContext';
import Index from '@/pages/Index';
import Auth from '@/pages/Auth';
import LandingPage from '@/pages/LandingPage';
import NotFound from '@/pages/NotFound';
import ErrorBoundary from '@/components/ErrorBoundary';
// Disabled WebhookTestPage import
// Disabled diagnosis system imports
// Disabled chat service test import
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
            {/* Webhook test route disabled */}
            {/* Diagnosis routes disabled due to missing components */}
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;
