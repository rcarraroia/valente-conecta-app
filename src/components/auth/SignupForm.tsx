
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import UserTypeSelector from './UserTypeSelector';
import EnhancedProfessionalFormFields from './EnhancedProfessionalFormFields';
import EnhancedCommonFormFields from './EnhancedCommonFormFields';
import { useSignup } from '@/hooks/useSignup';
import { institutoUserDataSchema } from '@/schemas/instituto-integration.schema';

const SignupForm = () => {
  const { handleSignup, loading } = useSignup();

  // Common fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [userType, setUserType] = useState<'comum' | 'parceiro'>('comum');
  const [cpf, setCpf] = useState('');
  const [consentDataSharing, setConsentDataSharing] = useState(false);

  // Validation errors
  const [cpfError, setCpfError] = useState('');
  const [consentError, setConsentError] = useState('');

  // Professional fields
  const [professionalData, setProfessionalData] = useState({
    specialty: '',
    bio: '',
    contactEmail: '',
    contactPhone: '',
    crmCrpRegister: '',
    specialties: '',
  });

  const validateCPF = (cpf: string): boolean => {
    const cleanCPF = cpf.replace(/\D/g, '');
    
    if (cleanCPF.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(cleanCPF)) return false;
    
    // Validação do primeiro dígito verificador
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
    }
    let remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleanCPF.charAt(9))) return false;
    
    // Validação do segundo dígito verificador
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleanCPF.charAt(10))) return false;
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset errors
    setCpfError('');
    setConsentError('');
    
    // Validate CPF
    if (!cpf.trim()) {
      setCpfError('CPF é obrigatório');
      return;
    }
    
    if (!validateCPF(cpf)) {
      setCpfError('CPF inválido');
      return;
    }
    
    await handleSignup({
      email,
      password,
      fullName,
      phone,
      city,
      userType,
      professionalData: userType === 'parceiro' ? professionalData : undefined,
      cpf,
      consentDataSharing
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
            <EnhancedCommonFormFields
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
              cpf={cpf}
              setCpf={setCpf}
              consentDataSharing={consentDataSharing}
              setConsentDataSharing={setConsentDataSharing}
              cpfError={cpfError}
              consentError={consentError}
            />
          ) : (
            <EnhancedProfessionalFormFields
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
              cpf={cpf}
              setCpf={setCpf}
              consentDataSharing={consentDataSharing}
              setConsentDataSharing={setConsentDataSharing}
              cpfError={cpfError}
              consentError={consentError}
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
