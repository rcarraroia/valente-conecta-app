// Main diagnosis dashboard page

import React from 'react';
import { DiagnosisRouteGuard } from '@/components/auth/DiagnosisRouteGuard';
import { useDiagnosisAuth } from '@/hooks/useDiagnosisAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import BottomNavigation from '@/components/BottomNavigation';

/**
 * Diagnosis Dashboard Page
 * Protected route that shows the main diagnosis interface
 */
const DiagnosisDashboardPage: React.FC = () => {
  const { state: authState, actions: authActions } = useDiagnosisAuth();

  const handleStartDiagnosis = () => {
    authActions.redirectToChat();
  };

  const handleNavigate = (screen: string) => {
    if (screen === 'diagnosis') {
      // Já estamos na página de diagnóstico
      return;
    }
    // Redirecionar para a página principal com o screen desejado
    localStorage.setItem('redirect_to', screen);
    window.location.href = '/';
  };

  return (
    <DiagnosisRouteGuard requireAuth={true}>
      <div className="min-h-screen bg-gray-50 relative">
        <div className="pb-16 p-4">
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Sistema de Triagem Comportamental (STC)</CardTitle>
                <CardDescription>
                  Bem-vindo ao Sistema de Triagem Comportamental do Instituto Coração Valente
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p>Olá, {authState.user?.email}!</p>
                  <p>Clique no botão abaixo para iniciar uma nova sessão de triagem comportamental.</p>
                  <Button onClick={handleStartDiagnosis} size="lg">
                    Iniciar Triagem Comportamental
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <BottomNavigation 
          currentTab="diagnosis" 
          onTabChange={handleNavigate}
        />
      </div>
    </DiagnosisRouteGuard>
  );
};

export default DiagnosisDashboardPage;