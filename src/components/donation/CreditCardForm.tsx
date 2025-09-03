import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreditCard } from 'lucide-react';

interface CreditCardData {
  holderName: string;
  number: string;
  expiryMonth: string;
  expiryYear: string;
  ccv: string;
}

interface CreditCardFormProps {
  creditCardData: CreditCardData;
  onCreditCardDataChange: (data: CreditCardData) => void;
}

const CreditCardForm = ({ creditCardData, onCreditCardDataChange }: CreditCardFormProps) => {
  const formatCardNumber = (value: string) => {
    // Remove todos os caracteres não numéricos
    const numericValue = value.replace(/\D/g, '');
    
    // Adiciona espaços a cada 4 dígitos
    const formattedValue = numericValue.replace(/(\d{4})(?=\d)/g, '$1 ');
    
    // Limita a 19 caracteres (16 dígitos + 3 espaços)
    return formattedValue.substring(0, 19);
  };

  const formatExpiryMonth = (value: string) => {
    const numericValue = value.replace(/\D/g, '');
    if (numericValue.length === 0) return '';
    
    const month = parseInt(numericValue);
    if (month > 12) return '12';
    if (month < 1 && numericValue.length === 2) return '01';
    
    return numericValue.substring(0, 2);
  };

  const formatExpiryYear = (value: string) => {
    const numericValue = value.replace(/\D/g, '');
    return numericValue.substring(0, 4);
  };

  const formatCCV = (value: string) => {
    const numericValue = value.replace(/\D/g, '');
    return numericValue.substring(0, 4);
  };

  const handleInputChange = (field: keyof CreditCardData, value: string) => {
    let formattedValue = value;
    
    switch (field) {
      case 'number':
        formattedValue = formatCardNumber(value);
        break;
      case 'expiryMonth':
        formattedValue = formatExpiryMonth(value);
        break;
      case 'expiryYear':
        formattedValue = formatExpiryYear(value);
        break;
      case 'ccv':
        formattedValue = formatCCV(value);
        break;
    }
    
    onCreditCardDataChange({
      ...creditCardData,
      [field]: formattedValue
    });
  };

  const getCardBrand = (number: string) => {
    const cleanNumber = number.replace(/\s/g, '');
    
    if (cleanNumber.startsWith('4')) return 'Visa';
    if (cleanNumber.startsWith('5') || cleanNumber.startsWith('2')) return 'Mastercard';
    if (cleanNumber.startsWith('3')) return 'American Express';
    if (cleanNumber.startsWith('6')) return 'Discover';
    
    return 'Cartão';
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-cv-gray-light/20 space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <CreditCard className="w-5 h-5 text-cv-coral" />
        <h3 className="text-lg font-semibold text-cv-gray-dark">
          Dados do Cartão de Crédito
        </h3>
      </div>

      {/* Nome do Portador */}
      <div className="space-y-2">
        <Label htmlFor="holderName" className="text-cv-gray-dark font-medium">
          Nome do Portador *
        </Label>
        <Input
          id="holderName"
          type="text"
          placeholder="Nome como está no cartão"
          value={creditCardData.holderName}
          onChange={(e) => handleInputChange('holderName', e.target.value)}
          className="border-cv-gray-light/30 focus:border-cv-coral"
          required
        />
      </div>

      {/* Número do Cartão */}
      <div className="space-y-2">
        <Label htmlFor="cardNumber" className="text-cv-gray-dark font-medium">
          Número do Cartão *
        </Label>
        <div className="relative">
          <Input
            id="cardNumber"
            type="text"
            placeholder="0000 0000 0000 0000"
            value={creditCardData.number}
            onChange={(e) => handleInputChange('number', e.target.value)}
            className="border-cv-gray-light/30 focus:border-cv-coral pr-20"
            required
          />
          {creditCardData.number && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-cv-gray-light">
              {getCardBrand(creditCardData.number)}
            </div>
          )}
        </div>
      </div>

      {/* Validade e CCV */}
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="expiryMonth" className="text-cv-gray-dark font-medium">
            Mês *
          </Label>
          <Input
            id="expiryMonth"
            type="text"
            placeholder="MM"
            value={creditCardData.expiryMonth}
            onChange={(e) => handleInputChange('expiryMonth', e.target.value)}
            className="border-cv-gray-light/30 focus:border-cv-coral"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="expiryYear" className="text-cv-gray-dark font-medium">
            Ano *
          </Label>
          <Input
            id="expiryYear"
            type="text"
            placeholder="AAAA"
            value={creditCardData.expiryYear}
            onChange={(e) => handleInputChange('expiryYear', e.target.value)}
            className="border-cv-gray-light/30 focus:border-cv-coral"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="ccv" className="text-cv-gray-dark font-medium">
            CCV *
          </Label>
          <Input
            id="ccv"
            type="text"
            placeholder="000"
            value={creditCardData.ccv}
            onChange={(e) => handleInputChange('ccv', e.target.value)}
            className="border-cv-gray-light/30 focus:border-cv-coral"
            required
          />
        </div>
      </div>

      {/* Informações de Segurança */}
      <div className="bg-blue-50 p-3 rounded-lg">
        <p className="text-xs text-blue-800">
          🔒 Seus dados são protegidos com criptografia SSL. Não armazenamos informações do cartão.
        </p>
      </div>
    </div>
  );
};

export default CreditCardForm;