/**
 * Input sanitization utilities to prevent XSS and injection attacks
 */

export class InputSanitizer {
  // HTML entities for escaping
  private static readonly HTML_ENTITIES: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;'
  };

  // Dangerous patterns to remove
  private static readonly DANGEROUS_PATTERNS = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
    /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
    /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi,
    /<link\b[^>]*>/gi,
    /<meta\b[^>]*>/gi,
    /javascript:/gi,
    /vbscript:/gi,
    /data:text\/html/gi,
    /on\w+\s*=/gi // Event handlers like onclick, onload, etc.
  ];

  /**
   * Escapes HTML entities to prevent XSS
   */
  static escapeHtml(input: string): string {
    if (typeof input !== 'string') {
      return String(input);
    }

    return input.replace(/[&<>"'\/]/g, (match) => this.HTML_ENTITIES[match] || match);
  }

  /**
   * Removes dangerous HTML tags and scripts
   */
  static removeDangerousContent(input: string): string {
    if (typeof input !== 'string') {
      return String(input);
    }

    let sanitized = input;

    // Remove dangerous patterns
    for (const pattern of this.DANGEROUS_PATTERNS) {
      sanitized = sanitized.replace(pattern, '');
    }

    return sanitized;
  }

  /**
   * Sanitizes user input for safe storage and display
   */
  static sanitizeUserInput(input: string, options: {
    allowHtml?: boolean;
    maxLength?: number;
    trimWhitespace?: boolean;
  } = {}): string {
    if (typeof input !== 'string') {
      return '';
    }

    const {
      allowHtml = false,
      maxLength = 1000,
      trimWhitespace = true
    } = options;

    let sanitized = input;

    // Trim whitespace if requested
    if (trimWhitespace) {
      sanitized = sanitized.trim();
    }

    // Limit length
    if (maxLength > 0 && sanitized.length > maxLength) {
      sanitized = sanitized.substring(0, maxLength);
    }

    // Handle HTML content
    if (!allowHtml) {
      sanitized = this.escapeHtml(sanitized);
    } else {
      sanitized = this.removeDangerousContent(sanitized);
    }

    return sanitized;
  }

  /**
   * Sanitizes email addresses
   */
  static sanitizeEmail(email: string): string {
    if (typeof email !== 'string') {
      return '';
    }

    // Basic email sanitization
    const sanitized = email.toLowerCase().trim();
    
    // Remove dangerous characters
    return sanitized.replace(/[<>'"&]/g, '');
  }

  /**
   * Sanitizes phone numbers
   */
  static sanitizePhone(phone: string): string {
    if (typeof phone !== 'string') {
      return '';
    }

    // Keep only digits, spaces, parentheses, hyphens, and plus sign
    return phone.replace(/[^\d\s\(\)\-\+]/g, '').trim();
  }

  /**
   * Sanitizes CPF (Brazilian tax ID)
   */
  static sanitizeCPF(cpf: string): string {
    if (typeof cpf !== 'string') {
      return '';
    }

    // Keep only digits, dots, and hyphens
    return cpf.replace(/[^\d\.\-]/g, '').trim();
  }

  /**
   * Sanitizes names (removes special characters but keeps accents)
   */
  static sanitizeName(name: string): string {
    if (typeof name !== 'string') {
      return '';
    }

    // Allow letters (including accented), spaces, hyphens, and apostrophes
    return name.replace(/[^a-zA-ZÀ-ÿ\s\-']/g, '').trim();
  }

  /**
   * Validates and sanitizes URL
   */
  static sanitizeUrl(url: string): string {
    if (typeof url !== 'string') {
      return '';
    }

    const sanitized = url.trim();

    // Check for dangerous protocols
    const dangerousProtocols = ['javascript:', 'vbscript:', 'data:', 'file:'];
    const lowerUrl = sanitized.toLowerCase();

    for (const protocol of dangerousProtocols) {
      if (lowerUrl.startsWith(protocol)) {
        return '';
      }
    }

    // Only allow http, https, and mailto
    if (!/^(https?:\/\/|mailto:)/i.test(sanitized)) {
      return '';
    }

    return sanitized;
  }

  /**
   * Sanitizes object properties recursively
   */
  static sanitizeObject<T extends Record<string, any>>(
    obj: T,
    fieldRules: Record<keyof T, {
      type: 'text' | 'email' | 'phone' | 'cpf' | 'name' | 'url';
      maxLength?: number;
      required?: boolean;
    }>
  ): { sanitized: Partial<T>; errors: Record<keyof T, string> } {
    const sanitized: Partial<T> = {};
    const errors: Record<keyof T, string> = {} as Record<keyof T, string>;

    for (const [field, rules] of Object.entries(fieldRules) as [keyof T, any][]) {
      const value = obj[field];

      // Check required fields
      if (rules.required && (!value || (typeof value === 'string' && !value.trim()))) {
        errors[field] = `${String(field)} é obrigatório`;
        continue;
      }

      // Skip empty optional fields
      if (!value && !rules.required) {
        continue;
      }

      // Sanitize based on type
      let sanitizedValue: any;
      
      switch (rules.type) {
        case 'email':
          sanitizedValue = this.sanitizeEmail(value);
          if (sanitizedValue && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitizedValue)) {
            errors[field] = `${String(field)} deve ter um formato válido`;
            continue;
          }
          break;

        case 'phone':
          sanitizedValue = this.sanitizePhone(value);
          break;

        case 'cpf':
          sanitizedValue = this.sanitizeCPF(value);
          break;

        case 'name':
          sanitizedValue = this.sanitizeName(value);
          break;

        case 'url':
          sanitizedValue = this.sanitizeUrl(value);
          if (value && !sanitizedValue) {
            errors[field] = `${String(field)} deve ser uma URL válida`;
            continue;
          }
          break;

        case 'text':
        default:
          sanitizedValue = this.sanitizeUserInput(value, {
            maxLength: rules.maxLength,
            allowHtml: false
          });
          break;
      }

      // Check length after sanitization
      if (rules.maxLength && sanitizedValue && sanitizedValue.length > rules.maxLength) {
        errors[field] = `${String(field)} deve ter no máximo ${rules.maxLength} caracteres`;
        continue;
      }

      sanitized[field] = sanitizedValue;
    }

    return { sanitized, errors };
  }

  /**
   * Creates a safe log message by sanitizing sensitive data
   */
  static createSafeLogMessage(message: string, data?: any): string {
    let safeMessage = this.sanitizeUserInput(message, { maxLength: 500 });

    if (data) {
      // Remove or mask sensitive fields
      const safeData = this.maskSensitiveData(data);
      safeMessage += ` | Data: ${JSON.stringify(safeData)}`;
    }

    return safeMessage;
  }

  /**
   * Masks sensitive data for logging
   */
  private static maskSensitiveData(data: any): any {
    if (typeof data !== 'object' || data === null) {
      return data;
    }

    const sensitiveFields = ['password', 'token', 'key', 'secret', 'cpf', 'email', 'phone'];
    const masked = Array.isArray(data) ? [...data] : { ...data };

    for (const field of sensitiveFields) {
      if (masked[field]) {
        if (field === 'email') {
          const email = String(masked[field]);
          const [local, domain] = email.split('@');
          masked[field] = local ? `${local.substring(0, 2)}***@${domain || '***'}` : '***';
        } else if (field === 'cpf') {
          const cpf = String(masked[field]).replace(/\D/g, '');
          masked[field] = cpf.length >= 6 ? `${cpf.substring(0, 3)}***${cpf.substring(cpf.length - 2)}` : '***';
        } else if (field === 'phone') {
          const phone = String(masked[field]).replace(/\D/g, '');
          masked[field] = phone.length >= 4 ? `${phone.substring(0, 2)}***${phone.substring(phone.length - 2)}` : '***';
        } else {
          masked[field] = '***';
        }
      }
    }

    return masked;
  }
}