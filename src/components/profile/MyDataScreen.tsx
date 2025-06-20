
import React from 'react';
import { useProfileData } from '@/hooks/useProfileData';
import MyDataHeader from './mydata/MyDataHeader';
import PersonalInformationForm from './mydata/PersonalInformationForm';
import EmergencyContactForm from './mydata/EmergencyContactForm';
import MedicalInformationForm from './mydata/MedicalInformationForm';
import SaveButton from './mydata/SaveButton';

interface MyDataScreenProps {
  onBack: () => void;
}

const MyDataScreen: React.FC<MyDataScreenProps> = ({ onBack }) => {
  const { formData, loading, saving, handleInputChange, handleSave } = useProfileData();

  if (loading) {
    return (
      <div className="min-h-screen bg-cv-off-white p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cv-coral"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cv-off-white p-6 pb-20">
      <div className="max-w-2xl mx-auto space-y-6">
        <MyDataHeader onBack={onBack} />

        <PersonalInformationForm 
          formData={formData}
          onInputChange={handleInputChange}
        />

        <EmergencyContactForm 
          formData={formData}
          onInputChange={handleInputChange}
        />

        <MedicalInformationForm 
          formData={formData}
          onInputChange={handleInputChange}
        />

        <SaveButton 
          onSave={handleSave}
          saving={saving}
        />
      </div>
    </div>
  );
};

export default MyDataScreen;
