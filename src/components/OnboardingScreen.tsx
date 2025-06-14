
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, SkipForward } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

interface OnboardingData {
  id: string;
  order_position: number;
  title: string;
  description: string;
  image_url: string | null;
  animation_asset_name: string | null;
}

interface OnboardingScreenProps {
  onComplete: () => void;
}

const OnboardingScreen = ({ onComplete }: OnboardingScreenProps) => {
  const [currentScreen, setCurrentScreen] = useState(0);

  const { data: screens = [], isLoading } = useQuery({
    queryKey: ['onboarding-screens'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('onboarding_screens')
        .select('*')
        .eq('is_active', true)
        .order('order_position');
      
      if (error) throw error;
      return data as OnboardingData[];
    }
  });

  const handleNext = () => {
    if (currentScreen < screens.length - 1) {
      setCurrentScreen(currentScreen + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentScreen > 0) {
      setCurrentScreen(currentScreen - 1);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cv-purple-soft to-cv-blue-heart flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  if (screens.length === 0) {
    onComplete();
    return null;
  }

  const currentScreenData = screens[currentScreen];

  return (
    <div className="min-h-screen bg-gradient-to-br from-cv-purple-soft via-cv-blue-heart to-cv-purple-dark flex flex-col">
      {/* Header with Skip button */}
      <div className="flex justify-end p-4">
        <Button 
          variant="ghost" 
          onClick={handleSkip}
          className="text-white hover:bg-white/20"
        >
          <SkipForward className="h-4 w-4 mr-2" />
          Pular
        </Button>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-20">
        <div className="w-full max-w-md space-y-8">
          {/* Image */}
          {currentScreenData.image_url && (
            <div className="relative w-64 h-64 mx-auto">
              <img
                src={currentScreenData.image_url}
                alt={currentScreenData.title}
                className="w-full h-full object-cover rounded-2xl shadow-2xl animate-fade-in"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-cv-purple-dark/20 to-transparent rounded-2xl"></div>
            </div>
          )}

          {/* Content */}
          <Card className="bg-white/10 backdrop-blur-lg border-white/20 shadow-2xl animate-slide-up">
            <CardContent className="p-8 text-center space-y-6">
              <h1 className="text-h1 font-heading font-bold text-white leading-tight">
                {currentScreenData.title}
              </h1>
              <p className="text-body text-white/90 leading-relaxed whitespace-pre-line">
                {currentScreenData.description}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom navigation */}
      <div className="p-6 space-y-6">
        {/* Progress indicators */}
        <div className="flex justify-center space-x-2">
          {screens.map((_, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentScreen 
                  ? 'bg-white scale-125' 
                  : 'bg-white/30'
              }`}
            />
          ))}
        </div>

        {/* Navigation buttons */}
        <div className="flex justify-between items-center">
          <Button
            variant="ghost"
            onClick={handlePrevious}
            disabled={currentScreen === 0}
            className="text-white hover:bg-white/20 disabled:opacity-30"
          >
            <ChevronLeft className="h-5 w-5 mr-2" />
            Anterior
          </Button>

          <Button
            onClick={handleNext}
            className="bg-white text-cv-purple-dark hover:bg-cv-off-white font-semibold px-8 py-3 rounded-lg shadow-lg"
          >
            {currentScreen === screens.length - 1 ? 'Começar' : 'Próximo'}
            {currentScreen < screens.length - 1 && <ChevronRight className="h-5 w-5 ml-2" />}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingScreen;
