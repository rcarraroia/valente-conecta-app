
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import UserTypeSelector from './UserTypeSelector';
import ProfessionalFormFields from './ProfessionalFormFields';
import CommonFormFields from './CommonFormFields';
import { useSignup } from '@/hooks/useSignup';

const SignupForm = () => {
  const { handleSignup, loading } = useSignup();

  // Common fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [userType, setUserType] = useState<'comum' | 'parceiro'>('comum');

  // Professional fields
  const [professionalData, setProfessionalData] = useState({
    specialty: '',
    bio: '',
    contactEmail: '',
    contactPhone: '',
    crmCrpRegister: '',
    specialties: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await handleSignup({
      email,
      password,
      fullName,
      phone,
      city,
      userType,
      professionalData: userType === 'parceiro' ? professionalData : undefined
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Criar Conta</CardTitle>
        <CardDescription>
          Cadastre-se para começar a cuidar da sua saúde
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <UserTypeSelector value={userType} onChange={setUserType} />

          {userType === 'comum' ? (
            <CommonFormFields
              fullName={fullName}
              setFullName={setFullName}
              email={email}
              setEmail={setEmail}
              phone={phone}
              setPhone={setPhone}
              city={city}
              setCity={setCity}
              password={password}
              setPassword={setPassword}
            />
          ) : (
            <ProfessionalFormFields
              fullName={fullName}
              setFullName={setFullName}
              email={email}
              setEmail={setEmail}
              phone={phone}
              setPhone={setPhone}
              city={city}
              setCity={setCity}
              professionalData={professionalData}
              setProfessionalData={setProfessionalData}
              password={password}
              setPassword={setPassword}
            />
          )}
        </CardContent>
        <CardFooter>
          <Button 
            type="submit" 
            className="w-full bg-cv-green-mint hover:bg-cv-green-mint/90"
            disabled={loading}
          >
            {loading ? 'Criando conta...' : userType === 'parceiro' ? 'Criar Perfil Profissional' : 'Criar Conta'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default SignupForm;
