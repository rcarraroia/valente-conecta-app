// Diagnosis reports page

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ReportsList } from '@/components/diagnosis/ReportsList';
import { PDFViewer } from '@/components/diagnosis/PDFViewer';
import { DiagnosisRouteGuard } from '@/components/auth/DiagnosisRouteGuard';
import { useDiagnosisAuth } from '@/hooks/useDiagnosisAuth';
import { useReports } from '@/hooks/useReports';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Home, Plus } from 'lucide-react';
import type { DiagnosisReport } from '@/types/diagnosis';

/**
 * Diagnosis Reports Page
 * Protected route for viewing and managing diagnosis reports
 */
const DiagnosisReportsPage: React.FC = () => {
  const navigate = useNavigate();
  const { actions: authActions } = useDiagnosisAuth();
  const { reports, isLoading, error, refetch, downloadReport } = useReports();
  
  const [selectedReport, setSelectedReport] = useState<DiagnosisReport | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  // Check for pre-selected report from localStorage
  useEffect(() => {
    const selectedReportId = localStorage.getItem('selected_report_id');
    if (selectedReportId && reports) {
      const report = reports.find(r => r.id === selectedReportId);
      if (report) {
        setSelectedReport(report);
        localStorage.removeItem('selected_report_id');
      }
    }
  }, [reports]);

  const handleBackToDashboard = () => {
    authActions.redirectToDashboard();
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const handleStartNewDiagnosis = () => {
    authActions.redirectToChat();
  };

  const handleViewReport = async (report: DiagnosisReport) => {
    setSelectedReport(report);
    
    try {
      // Get signed URL for PDF viewing
      const result = await downloadReport(report.id);
      if (result.success && result.data) {
        setPdfUrl(result.data.signedUrl);
      }
    } catch (error) {
      console.error('Error loading PDF:', error);
    }
  };

  const handleDownloadReport = async (report: DiagnosisReport) => {
    try {
      const result = await downloadReport(report.id);
      if (result.success && result.data) {
        // Create download link
        const link = document.createElement('a');
        link.href = result.data.signedUrl;
        link.download = `relatorio-${report.title}-${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error('Error downloading PDF:', error);
    }
  };

  const handleClosePDFViewer = () => {
    setSelectedReport(null);
    setPdfUrl(null);
  };

  const handlePDFDownload = () => {
    if (selectedReport) {
      handleDownloadReport(selectedReport);
    }
  };

  return (
    <DiagnosisRouteGuard requireAuth={true}>
      <div className="min-h-screen bg-cv-off-white">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between max-w-6xl mx-auto">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToDashboard}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Dashboard
              </Button>
              <div className="h-6 w-px bg-gray-300" />
              <h1 className="text-lg font-semibold text-gray-900">
                Meus Relatórios
              </h1>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleStartNewDiagnosis}
                className="text-cv-blue border-cv-blue hover:bg-cv-blue hover:text-white"
              >
                <Plus className="w-4 h-4 mr-1" />
                Novo Diagnóstico
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleGoHome}
                className="text-gray-600 hover:text-gray-900"
              >
                <Home className="w-4 h-4 mr-1" />
                Início
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-6xl mx-auto p-4">
          {selectedReport && pdfUrl ? (
            /* PDF Viewer */
            <div className="bg-white rounded-lg shadow-sm">
              <PDFViewer
                pdfUrl={pdfUrl}
                title={selectedReport.title}
                reportData={{
                  createdAt: selectedReport.created_at,
                  severityLevel: selectedReport.diagnosis_data?.severity_level || 1,
                }}
                onClose={handleClosePDFViewer}
                onDownload={handlePDFDownload}
                className="h-[calc(100vh-200px)]"
              />
            </div>
          ) : (
            /* Reports List */
            <ReportsList
              reports={reports || []}
              isLoading={isLoading}
              error={error}
              onViewReport={handleViewReport}
              onDownloadReport={handleDownloadReport}
              onRefresh={refetch}
              className="bg-white rounded-lg shadow-sm"
            />
          )}
        </div>

        {/* Empty State */}
        {!isLoading && (!reports || reports.length === 0) && (
          <div className="max-w-6xl mx-auto p-4">
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum relatório encontrado
              </h3>
              <p className="text-gray-600 mb-6">
                Você ainda não possui relatórios de triagem comportamental. Comece sua primeira triagem agora!
              </p>
              <Button
                onClick={handleStartNewDiagnosis}
                className="bg-cv-blue hover:bg-cv-blue/90 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Iniciar Triagem Comportamental
              </Button>
            </div>
          </div>
        )}
      </div>
    </DiagnosisRouteGuard>
  );
};

export default DiagnosisReportsPage;