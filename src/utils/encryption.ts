import CryptoJS from 'crypto-js';

export class CredentialEncryption {
  private static readonly ENCRYPTION_KEY = 
    (typeof window !== 'undefined' && import.meta?.env?.VITE_ENCRYPTION_KEY) ||
    (typeof process !== 'undefined' && process.env?.VITE_ENCRYPTION_KEY) ||
    'default-key-change-in-production';
  private static readonly SALT_ROUNDS = 10;

  /**
   * Encrypts credential data for storage
   */
  static encrypt(data: Record<string, any>): string {
    try {
      const jsonString = JSON.stringify(data);
      const encrypted = CryptoJS.AES.encrypt(jsonString, this.ENCRYPTION_KEY).toString();
      return encrypted;
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error('Falha ao criptografar credenciais');
    }
  }

  /**
   * Decrypts credential data from storage
   */
  static decrypt(encryptedData: string | Record<string, any>): Record<string, any> {
    try {
      // If data is already an object, return as is (for backward compatibility)
      if (typeof encryptedData === 'object' && encryptedData !== null) {
        return encryptedData;
      }

      // If it's an empty string or null, return empty object
      if (!encryptedData || encryptedData === '') {
        return {};
      }

      const decrypted = CryptoJS.AES.decrypt(encryptedData, this.ENCRYPTION_KEY);
      const jsonString = decrypted.toString(CryptoJS.enc.Utf8);
      
      if (!jsonString) {
        console.warn('Failed to decrypt credentials, returning empty object');
        return {};
      }

      return JSON.parse(jsonString);
    } catch (error) {
      console.error('Decryption error:', error);
      // Return empty object instead of throwing to handle corrupted data gracefully
      return {};
    }
  }

  /**
   * Encrypts credentials for API config
   */
  static encryptCredentials(config: {
    auth_type: string;
    api_key?: string;
    bearer_token?: string;
    basic_username?: string;
    basic_password?: string;
  }): string {
    const credentials: Record<string, any> = {};

    switch (config.auth_type) {
      case 'api_key':
        if (config.api_key) {
          credentials.api_key = config.api_key;
        }
        break;
      case 'bearer':
        if (config.bearer_token) {
          credentials.bearer_token = config.bearer_token;
        }
        break;
      case 'basic':
        if (config.basic_username && config.basic_password) {
          credentials.basic_username = config.basic_username;
          credentials.basic_password = config.basic_password;
        }
        break;
    }

    return this.encrypt(credentials);
  }

  /**
   * Validates encryption key strength
   */
  static validateEncryptionKey(): boolean {
    const key = this.ENCRYPTION_KEY;
    
    // Check minimum length
    if (key.length < 16) {
      return false;
    }

    // Check if it's not the default key
    if (key === 'default-key-change-in-production') {
      console.warn('Using default encryption key. Change VITE_ENCRYPTION_KEY in production!');
      return false;
    }

    return true;
  }

  /**
   * Generates a random encryption key
   */
  static generateKey(length: number = 32): string {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let result = '';
    
    for (let i = 0; i < length; i++) {
      result += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    
    return result;
  }

  /**
   * Hashes sensitive data for logging (one-way)
   */
  static hashForLogging(data: string): string {
    return CryptoJS.SHA256(data + this.ENCRYPTION_KEY).toString().substring(0, 8);
  }

  /**
   * Sanitizes data for logging by removing sensitive information
   */
  static sanitizeForLogging(data: any): any {
    if (typeof data !== 'object' || data === null) {
      return data;
    }

    const sensitiveFields = ['password', 'token', 'key', 'secret', 'cpf', 'email', 'phone'];
    const sanitized = { ...data };

    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        if (field === 'email') {
          // Show only first 2 chars and domain
          const email = sanitized[field];
          const [local, domain] = email.split('@');
          sanitized[field] = `${local.substring(0, 2)}***@${domain}`;
        } else if (field === 'cpf') {
          // Show only first 3 and last 2 digits
          const cpf = sanitized[field].replace(/\D/g, '');
          sanitized[field] = `${cpf.substring(0, 3)}*****${cpf.substring(9)}`;
        } else if (field === 'phone') {
          // Show only area code
          const phone = sanitized[field].replace(/\D/g, '');
          sanitized[field] = `(${phone.substring(0, 2)}) ****-****`;
        } else {
          sanitized[field] = '***';
        }
      }
    }

    return sanitized;
  }

  /**
   * Validates data integrity using HMAC
   */
  static generateHMAC(data: string): string {
    return CryptoJS.HmacSHA256(data, this.ENCRYPTION_KEY).toString();
  }

  /**
   * Verifies data integrity using HMAC
   */
  static verifyHMAC(data: string, hmac: string): boolean {
    const expectedHmac = this.generateHMAC(data);
    return CryptoJS.enc.Hex.parse(expectedHmac).toString() === CryptoJS.enc.Hex.parse(hmac).toString();
  }
}