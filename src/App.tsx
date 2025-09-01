
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import Index from '@/pages/Index';
import Auth from '@/pages/Auth';
import LandingPage from '@/pages/LandingPage';
import NotFound from '@/pages/NotFound';
import ErrorBoundary from '@/components/ErrorBoundary';
import { WebhookTestPage } from '@/pages/WebhookTestPage';
import DiagnosisDashboard from '@/pages/DiagnosisDashboard';
import DiagnosisChat from '@/pages/DiagnosisChat';
import DiagnosisReports from '@/pages/DiagnosisReports';
import './App.css';

const App = () => {
  return (
    <ErrorBoundary>
      <Toaster />
      <Router>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/landing/:ref" element={<LandingPage />} />
          <Route path="/webhook-test" element={<WebhookTestPage />} />
          
          {/* Diagnosis Routes - Protected */}
          <Route path="/diagnosis" element={<DiagnosisDashboard />} />
          <Route path="/diagnosis/chat" element={<DiagnosisChat />} />
          <Route path="/diagnosis/reports" element={<DiagnosisReports />} />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
};

export default App;
