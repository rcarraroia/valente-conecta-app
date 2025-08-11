import { z } from 'zod';

// Função para validar CPF
const validateCPF = (cpf: string): boolean => {
  // Remove caracteres não numéricos
  const cleanCPF = cpf.replace(/\D/g, '');
  
  // Verifica se tem 11 dígitos
  if (cleanCPF.length !== 11) return false;
  
  // Verifica se todos os dígitos são iguais
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

// Função para validar telefone brasileiro
const validatePhone = (phone: string): boolean => {
  const cleanPhone = phone.replace(/\D/g, '');
  // Aceita formatos: 11999999999 (celular) ou 1133333333 (fixo)
  return /^(\d{10}|\d{11})$/.test(cleanPhone);
};

export const institutoUserDataSchema = z.object({
  nome: z.string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Nome deve conter apenas letras e espaços'),
  
  email: z.string()
    .email('Email deve ter um formato válido')
    .max(255, 'Email deve ter no máximo 255 caracteres'),
  
  telefone: z.string()
    .refine(validatePhone, 'Telefone deve ter 10 ou 11 dígitos'),
  
  cpf: z.string()
    .refine(validateCPF, 'CPF deve ser válido'),
  
  origem_cadastro: z.literal('visao_itinerante'),
  
  consentimento_data_sharing: z.boolean()
    .refine(val => val === true, 'Consentimento é obrigatório para envio dos dados'),
  
  created_at: z.string().datetime()
});

export const institutoApiConfigSchema = z.object({
  id: z.string().uuid().optional(),
  
  endpoint: z.string()
    .url('Endpoint deve ser uma URL válida')
    .max(500, 'Endpoint deve ter no máximo 500 caracteres'),
  
  method: z.enum(['POST', 'PUT'], {
    errorMap: () => ({ message: 'Método deve ser POST ou PUT' })
  }),
  
  auth_type: z.enum(['api_key', 'bearer', 'basic'], {
    errorMap: () => ({ message: 'Tipo de autenticação deve ser api_key, bearer ou basic' })
  }),
  
  api_key: z.string().optional(),
  bearer_token: z.string().optional(),
  basic_username: z.string().optional(),
  basic_password: z.string().optional(),
  
  sandbox_endpoint: z.string()
    .url('Endpoint de sandbox deve ser uma URL válida')
    .max(500, 'Endpoint de sandbox deve ter no máximo 500 caracteres')
    .optional(),
  
  is_sandbox: z.boolean().default(true),
  
  retry_attempts: z.number()
    .int('Tentativas de retry deve ser um número inteiro')
    .min(1, 'Deve ter pelo menos 1 tentativa')
    .max(10, 'Máximo de 10 tentativas')
    .default(3),
  
  retry_delay: z.number()
    .int('Delay de retry deve ser um número inteiro')
    .min(1000, 'Delay mínimo de 1 segundo')
    .max(300000, 'Delay máximo de 5 minutos')
    .default(5000),
  
  is_active: z.boolean().default(true),
  
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional()
}).refine((data) => {
  // Validação condicional baseada no tipo de autenticação
  if (data.auth_type === 'api_key' && !data.api_key) {
    return false;
  }
  if (data.auth_type === 'bearer' && !data.bearer_token) {
    return false;
  }
  if (data.auth_type === 'basic' && (!data.basic_username || !data.basic_password)) {
    return false;
  }
  return true;
}, {
  message: 'Credenciais são obrigatórias para o tipo de autenticação selecionado'
});

export const integrationLogSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  status: z.enum(['success', 'failed', 'pending', 'retry']),
  payload: institutoUserDataSchema,
  response: z.any().optional(),
  error_message: z.string().optional(),
  attempt_count: z.number().int().min(1).default(1),
  next_retry_at: z.string().datetime().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime()
});

export const integrationStatsSchema = z.object({
  total_attempts: z.number().int().min(0),
  successful_sends: z.number().int().min(0),
  failed_sends: z.number().int().min(0),
  pending_retries: z.number().int().min(0),
  success_rate: z.number().min(0).max(100),
  last_24h_attempts: z.number().int().min(0),
  last_24h_success_rate: z.number().min(0).max(100)
});

// Schema para validação de dados de entrada do usuário (antes de processar)
export const userRegistrationDataSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string(),
  cpf: z.string(),
  consent_data_sharing: z.boolean().optional().default(false)
});

// Tipo inferido dos schemas
export type InstitutoUserDataInput = z.infer<typeof institutoUserDataSchema>;
export type InstitutoApiConfigInput = z.infer<typeof institutoApiConfigSchema>;
export type IntegrationLogInput = z.infer<typeof integrationLogSchema>;
export type IntegrationStatsInput = z.infer<typeof integrationStatsSchema>;
export type UserRegistrationDataInput = z.infer<typeof userRegistrationDataSchema>;