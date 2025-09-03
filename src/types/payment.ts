
export interface DonationData {
  amount: number;
  type: 'donation' | 'subscription';
  frequency?: 'monthly' | 'yearly';
  donor: {
    name: string;
    email: string;
    phone?: string;
    document?: string;
  };
  ambassadorCode?: string;
}

export interface AsaasCustomer {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  mobilePhone?: string;
  cpfCnpj?: string;
  postalCode?: string;
  address?: string;
  addressNumber?: string;
  complement?: string;
  province?: string;
  city?: string;
  state?: string;
}

export interface AsaasSplit {
  walletId: string;
  fixedValue?: number;
  percentualValue?: number;
  totalFixedValue?: number;
}

export interface AsaasPayment {
  id?: string;
  customer: string;
  billingType: 'BOLETO' | 'CREDIT_CARD' | 'PIX';
  value: number;
  dueDate: string;
  description?: string;
  externalReference?: string;
  split?: AsaasSplit[];
}

export interface AsaasSubscription {
  id?: string;
  customer: string;
  billingType: 'BOLETO' | 'CREDIT_CARD' | 'PIX';
  value: number;
  cycle: 'MONTHLY' | 'YEARLY';
  description?: string;
  nextDueDate: string;
  split?: AsaasSplit[];
}

export interface SplitConfiguration {
  instituteWalletId: string;
  adminWalletId: string;
  specialWalletId: string;
  adminCommissionPercent: number;
  ambassadorCommissionPercent: number;
  specialCommissionPercent: number;
  ambassadorWallets: {
    [ambassadorCode: string]: string;
  };
}

export interface PaymentSplit {
  ambassadorCode?: string;
  ambassadorShare: number;
  instituteShare: number;
  adminShare: number; // Renum sempre 10%
  specialShare?: number; // Wallet especial 20% quando não há embaixador
  splits: AsaasSplit[];
}
