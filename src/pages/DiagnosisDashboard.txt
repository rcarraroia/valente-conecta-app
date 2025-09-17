// Main diagnosis dashboard page

import React from 'react';
import { DiagnosisDashboard as DiagnosisDashboardComponent } from '@/components/diagnosis/DiagnosisDashboard';
import { DiagnosisRouteGuard } from '@/components/auth/DiagnosisRouteGuard';
import { DiagnosisErrorBoundary } from '@/components/diagnosis/DiagnosisErrorBoundary';
import { DiagnosisOfflineFallback } from '@/components/diagnosis/DiagnosisOfflineFallback';
import { useDiagnosisAuth } from '@/hooks/useDiagnosisAuth';
import { useReports } from '@/hooks/useReports';

/**
 * Diagnosis Dashboard Page
 * Protected route that shows the main diagnosis interface
 */
const DiagnosisDashboardPage: React.FC = () => {
  const { state: authState, actions: authActions } = useDiagnosisAuth();
  const { reports, isLoading: reportsLoading, error: reportsError, refetch } = useReports();

  const handleStartDiagnosis = () => {
    authActions.redirectToChat();
  };

  const handleViewReport = (reportId: string) => {
    authActions.redirectToReports();
    // The reports page will handle showing the specific report
    localStorage.setItem('selected_report_id', reportId);
  };

  const handleViewAllReports = () => {
    authActions.redirectToReports();
  };

  return (
    <DiagnosisRouteGuard requireAuth={true}>
      <DiagnosisErrorBoundary>
        <DiagnosisOfflineFallback>
          <div className="min-h-screen bg-cv-off-white">
            <DiagnosisDashboardComponent
              user={authState.user!}
              reports={reports || []}
              isLoading={reportsLoading}
              error={reportsError}
              onStartDiagnosis={handleStartDiagnosis}
              onViewReport={handleViewReport}
              onViewAllReports={handleViewAllReports}
              onRefreshReports={refetch}
              hasActiveSession={authState.hasActiveSession}
              lastAccess={authState.lastDiagnosisAccess}
            />
          </div>
        </DiagnosisOfflineFallback>
      </DiagnosisErrorBoundary>
    </DiagnosisRouteGuard>
  );
};

export default DiagnosisDashboardPage;