// Main diagnosis dashboard page

import React from 'react';
import { DiagnosisRouteGuard } from '@/components/auth/DiagnosisRouteGuard';
import { useDiagnosisAuth } from '@/hooks/useDiagnosisAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Diagnosis Dashboard Page
 * Protected route that shows the main diagnosis interface
 */
const DiagnosisDashboardPage: React.FC = () => {
  const { state: authState, actions: authActions } = useDiagnosisAuth();

  const handleStartDiagnosis = () => {
    authActions.redirectToChat();
  };

  return (
    <DiagnosisRouteGuard requireAuth={true}>
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Pré-Diagnóstico</CardTitle>
              <CardDescription>
                Bem-vindo ao sistema de pré-diagnóstico do Instituto Coração Valente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p>Olá, {authState.user?.email}!</p>
                <p>Clique no botão abaixo para iniciar uma nova sessão de pré-diagnóstico.</p>
                <Button onClick={handleStartDiagnosis} size="lg">
                  Iniciar Pré-Diagnóstico
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DiagnosisRouteGuard>
  );
};

export default DiagnosisDashboardPage;