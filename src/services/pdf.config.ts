// PDF service configuration and utilities

import { PDFGenerationOptions } from './pdf.service';
import { DiagnosisData } from '@/types/diagnosis';
import { PDF_CONFIG } from '@/lib/diagnosis-constants';

/**
 * Default PDF generation options
 */
export const DEFAULT_PDF_OPTIONS: PDFGenerationOptions = {
  template: 'standard',
  includeCharts: true,
  includeRecommendations: true,
  includePatientInfo: true,
  language: 'pt-BR',
  format: 'A4',
  orientation: 'portrait',
};

/**
 * PDF template configurations
 */
export const PDF_TEMPLATES = {
  STANDARD: {
    name: 'standard',
    description: 'Relatório padrão com informações essenciais',
    features: ['patient_info', 'symptoms', 'analysis', 'recommendations', 'severity'],
  },
  DETAILED: {
    name: 'detailed',
    description: 'Relatório detalhado com análises aprofundadas',
    features: ['patient_info', 'symptoms', 'analysis', 'recommendations', 'severity', 'charts', 'timeline'],
  },
} as const;

/**
 * PDF styling constants
 */
export const PDF_STYLES = {
  COLORS: {
    PRIMARY: '#2563eb', // Blue
    SECONDARY: '#64748b', // Slate
    SUCCESS: '#16a34a', // Green
    WARNING: '#d97706', // Orange
    DANGER: '#dc2626', // Red
    TEXT: '#1f2937', // Gray-800
    LIGHT_TEXT: '#6b7280', // Gray-500
  },
  FONTS: {
    TITLE: { size: 20, weight: 'bold' },
    SUBTITLE: { size: 16, weight: 'bold' },
    SECTION: { size: 14, weight: 'bold' },
    BODY: { size: 10, weight: 'normal' },
    CAPTION: { size: 8, weight: 'italic' },
  },
  SPACING: {
    SECTION: 15,
    PARAGRAPH: 10,
    LINE: 6,
    SMALL: 3,
  },
  MARGINS: {
    TOP: 20,
    BOTTOM: 20,
    LEFT: 20,
    RIGHT: 20,
  },
} as const;

/**
 * PDF validation rules
 */
export const PDF_VALIDATION = {
  MIN_SYMPTOMS: 1,
  MAX_SYMPTOMS: 20,
  MIN_ANALYSIS_LENGTH: 10,
  MAX_ANALYSIS_LENGTH: 5000,
  MIN_RECOMMENDATIONS: 1,
  MAX_RECOMMENDATIONS: 10,
  SEVERITY_RANGE: { min: 1, max: 5 },
} as const;

/**
 * Validates diagnosis data for PDF generation
 */
export const validateDiagnosisForPDF = (data: DiagnosisData): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Check required fields
  if (!data) {
    errors.push('Dados de diagnóstico não fornecidos');
    return { isValid: false, errors };
  }

  // Validate symptoms
  if (!data.symptoms || !Array.isArray(data.symptoms)) {
    errors.push('Lista de sintomas é obrigatória');
  } else {
    if (data.symptoms.length < PDF_VALIDATION.MIN_SYMPTOMS) {
      errors.push(`Pelo menos ${PDF_VALIDATION.MIN_SYMPTOMS} sintoma é obrigatório`);
    }
    if (data.symptoms.length > PDF_VALIDATION.MAX_SYMPTOMS) {
      errors.push(`Máximo de ${PDF_VALIDATION.MAX_SYMPTOMS} sintomas permitidos`);
    }

    // Validate each symptom
    data.symptoms.forEach((symptom, index) => {
      if (!symptom.description || symptom.description.trim().length === 0) {
        errors.push(`Descrição do sintoma ${index + 1} é obrigatória`);
      }
      if (!symptom.severity || symptom.severity < 1 || symptom.severity > 10) {
        errors.push(`Intensidade do sintoma ${index + 1} deve estar entre 1 e 10`);
      }
    });
  }

  // Validate analysis
  if (!data.analysis || typeof data.analysis !== 'string') {
    errors.push('Análise é obrigatória');
  } else {
    const analysisLength = data.analysis.trim().length;
    if (analysisLength < PDF_VALIDATION.MIN_ANALYSIS_LENGTH) {
      errors.push(`Análise deve ter pelo menos ${PDF_VALIDATION.MIN_ANALYSIS_LENGTH} caracteres`);
    }
    if (analysisLength > PDF_VALIDATION.MAX_ANALYSIS_LENGTH) {
      errors.push(`Análise deve ter no máximo ${PDF_VALIDATION.MAX_ANALYSIS_LENGTH} caracteres`);
    }
  }

  // Validate recommendations
  if (!data.recommendations || !Array.isArray(data.recommendations)) {
    errors.push('Lista de recomendações é obrigatória');
  } else {
    if (data.recommendations.length < PDF_VALIDATION.MIN_RECOMMENDATIONS) {
      errors.push(`Pelo menos ${PDF_VALIDATION.MIN_RECOMMENDATIONS} recomendação é obrigatória`);
    }
    if (data.recommendations.length > PDF_VALIDATION.MAX_RECOMMENDATIONS) {
      errors.push(`Máximo de ${PDF_VALIDATION.MAX_RECOMMENDATIONS} recomendações permitidas`);
    }

    // Validate each recommendation
    data.recommendations.forEach((recommendation, index) => {
      if (!recommendation || recommendation.trim().length === 0) {
        errors.push(`Recomendação ${index + 1} não pode estar vazia`);
      }
    });
  }

  // Validate severity level
  if (!data.severity_level || typeof data.severity_level !== 'number') {
    errors.push('Nível de gravidade é obrigatório');
  } else {
    if (data.severity_level < PDF_VALIDATION.SEVERITY_RANGE.min || 
        data.severity_level > PDF_VALIDATION.SEVERITY_RANGE.max) {
      errors.push(`Nível de gravidade deve estar entre ${PDF_VALIDATION.SEVERITY_RANGE.min} e ${PDF_VALIDATION.SEVERITY_RANGE.max}`);
    }
  }

  // Validate generated_at
  if (!data.generated_at) {
    errors.push('Data de geração é obrigatória');
  } else {
    try {
      new Date(data.generated_at);
    } catch {
      errors.push('Data de geração inválida');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Generates a filename for the PDF report
 */
export const generatePDFFilename = (userId: string, timestamp?: Date): string => {
  const date = timestamp || new Date();
  const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
  const timeStr = date.toTimeString().split(' ')[0].replace(/:/g, '-'); // HH-MM-SS
  
  return `relatorio-diagnostico-${userId}-${dateStr}-${timeStr}.pdf`;
};

/**
 * Estimates PDF generation time based on data complexity
 */
export const estimatePDFGenerationTime = (data: DiagnosisData): number => {
  let baseTime = 1000; // 1 second base time

  // Add time for symptoms
  baseTime += (data.symptoms?.length || 0) * 100;

  // Add time for analysis length
  const analysisLength = data.analysis?.length || 0;
  baseTime += Math.floor(analysisLength / 100) * 50;

  // Add time for recommendations
  baseTime += (data.recommendations?.length || 0) * 50;

  // Add time for patient info
  if (data.patient_info) {
    baseTime += 200;
  }

  // Add time for next steps
  baseTime += (data.next_steps?.length || 0) * 50;

  return Math.min(baseTime, 10000); // Cap at 10 seconds
};

/**
 * Gets PDF size estimate in bytes
 */
export const estimatePDFSize = (data: DiagnosisData): number => {
  let baseSize = 50000; // 50KB base size

  // Add size for content
  const contentLength = (data.analysis?.length || 0) + 
                       (data.symptoms?.reduce((acc, s) => acc + s.description.length, 0) || 0) +
                       (data.recommendations?.reduce((acc, r) => acc + r.length, 0) || 0);

  baseSize += contentLength * 10; // Rough estimate: 10 bytes per character

  return Math.min(baseSize, PDF_CONFIG.MAX_SIZE);
};

/**
 * PDF generation progress tracker
 */
export class PDFGenerationProgress {
  private steps: string[] = [
    'Validando dados',
    'Configurando documento',
    'Adicionando cabeçalho',
    'Processando informações do paciente',
    'Adicionando sintomas',
    'Processando análise',
    'Adicionando recomendações',
    'Finalizando documento',
  ];

  private currentStep = 0;
  private callbacks: ((progress: number, step: string) => void)[] = [];

  onProgress(callback: (progress: number, step: string) => void): void {
    this.callbacks.push(callback);
  }

  nextStep(): void {
    if (this.currentStep < this.steps.length) {
      this.currentStep++;
      const progress = (this.currentStep / this.steps.length) * 100;
      const step = this.steps[this.currentStep - 1] || 'Concluído';
      
      this.callbacks.forEach(callback => callback(progress, step));
    }
  }

  reset(): void {
    this.currentStep = 0;
  }

  getCurrentProgress(): { progress: number; step: string } {
    const progress = (this.currentStep / this.steps.length) * 100;
    const step = this.currentStep > 0 ? this.steps[this.currentStep - 1] : 'Iniciando';
    
    return { progress, step };
  }
}

/**
 * PDF quality settings
 */
export const PDF_QUALITY_SETTINGS = {
  LOW: {
    compression: 0.3,
    imageQuality: 0.5,
    fontSize: 9,
    description: 'Baixa qualidade, arquivo menor',
  },
  MEDIUM: {
    compression: 0.6,
    imageQuality: 0.7,
    fontSize: 10,
    description: 'Qualidade média, tamanho balanceado',
  },
  HIGH: {
    compression: 0.9,
    imageQuality: 0.9,
    fontSize: 11,
    description: 'Alta qualidade, arquivo maior',
  },
} as const;

/**
 * Creates PDF generation options with quality preset
 */
export const createPDFOptionsWithQuality = (
  quality: keyof typeof PDF_QUALITY_SETTINGS,
  overrides?: Partial<PDFGenerationOptions>
): PDFGenerationOptions => {
  const qualitySettings = PDF_QUALITY_SETTINGS[quality];
  
  return {
    ...DEFAULT_PDF_OPTIONS,
    ...overrides,
    // Quality-specific settings would be applied here
    // For now, we just return the default options with overrides
  };
};

/**
 * PDF accessibility features
 */
export const PDF_ACCESSIBILITY = {
  ENABLE_SCREEN_READER: true,
  ADD_ALT_TEXT: true,
  USE_SEMANTIC_STRUCTURE: true,
  HIGH_CONTRAST_MODE: false,
  LARGE_FONT_MODE: false,
} as const;

/**
 * Creates accessible PDF options
 */
export const createAccessiblePDFOptions = (
  baseOptions?: Partial<PDFGenerationOptions>
): PDFGenerationOptions => {
  return {
    ...DEFAULT_PDF_OPTIONS,
    ...baseOptions,
    // Accessibility features would be applied here
    // For now, we just return the base options
  };
};