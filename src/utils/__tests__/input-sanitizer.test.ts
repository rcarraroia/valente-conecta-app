import { describe, it, expect } from 'vitest';
import { InputSanitizer } from '../input-sanitizer';

describe('InputSanitizer', () => {
  describe('escapeHtml', () => {
    it('should escape HTML entities', () => {
      const input = '<script>alert("xss")</script>';
      const result = InputSanitizer.escapeHtml(input);
      
      expect(result).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;');
    });

    it('should handle non-string input', () => {
      expect(InputSanitizer.escapeHtml(123 as any)).toBe('123');
      expect(InputSanitizer.escapeHtml(null as any)).toBe('null');
    });
  });

  describe('removeDangerousContent', () => {
    it('should remove script tags', () => {
      const input = 'Hello <script>alert("xss")</script> World';
      const result = InputSanitizer.removeDangerousContent(input);
      
      expect(result).toBe('Hello  World');
    });

    it('should remove iframe tags', () => {
      const input = 'Content <iframe src="evil.com"></iframe> more content';
      const result = InputSanitizer.removeDangerousContent(input);
      
      expect(result).toBe('Content  more content');
    });

    it('should remove javascript: URLs', () => {
      const input = 'Click <a href="javascript:alert(1)">here</a>';
      const result = InputSanitizer.removeDangerousContent(input);
      
      expect(result).toBe('Click <a href="">here</a>');
    });

    it('should remove event handlers', () => {
      const input = '<div onclick="alert(1)">Click me</div>';
      const result = InputSanitizer.removeDangerousContent(input);
      
      expect(result).toBe('<div >Click me</div>');
    });
  });

  describe('sanitizeUserInput', () => {
    it('should sanitize basic user input', () => {
      const input = '  <script>alert("xss")</script>  ';
      const result = InputSanitizer.sanitizeUserInput(input);
      
      expect(result).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;');
    });

    it('should respect maxLength option', () => {
      const input = 'This is a very long string that should be truncated';
      const result = InputSanitizer.sanitizeUserInput(input, { maxLength: 10 });
      
      expect(result).toBe('This is a ');
    });

    it('should preserve whitespace when trimWhitespace is false', () => {
      const input = '  hello world  ';
      const result = InputSanitizer.sanitizeUserInput(input, { trimWhitespace: false });
      
      expect(result).toBe('  hello world  ');
    });

    it('should allow HTML when allowHtml is true', () => {
      const input = '<p>Hello <strong>world</strong></p>';
      const result = InputSanitizer.sanitizeUserInput(input, { allowHtml: true });
      
      expect(result).toBe('<p>Hello <strong>world</strong></p>');
    });
  });

  describe('sanitizeEmail', () => {
    it('should sanitize email addresses', () => {
      const input = '  TEST@EXAMPLE.COM  ';
      const result = InputSanitizer.sanitizeEmail(input);
      
      expect(result).toBe('test@example.com');
    });

    it('should remove dangerous characters from email', () => {
      const input = 'test<script>@example.com';
      const result = InputSanitizer.sanitizeEmail(input);
      
      expect(result).toBe('testscript@example.com');
    });

    it('should handle non-string input', () => {
      expect(InputSanitizer.sanitizeEmail(123 as any)).toBe('');
    });
  });

  describe('sanitizePhone', () => {
    it('should keep only valid phone characters', () => {
      const input = '(11) 99999-9999 ext 123';
      const result = InputSanitizer.sanitizePhone(input);
      
      expect(result).toBe('(11) 99999-9999  123');
    });

    it('should remove invalid characters', () => {
      const input = '11<script>99999-9999';
      const result = InputSanitizer.sanitizePhone(input);
      
      expect(result).toBe('1199999-9999');
    });
  });

  describe('sanitizeCPF', () => {
    it('should keep only CPF valid characters', () => {
      const input = '123.456.789-01';
      const result = InputSanitizer.sanitizeCPF(input);
      
      expect(result).toBe('123.456.789-01');
    });

    it('should remove invalid characters', () => {
      const input = '123<script>.456.789-01';
      const result = InputSanitizer.sanitizeCPF(input);
      
      expect(result).toBe('123.456.789-01');
    });
  });

  describe('sanitizeName', () => {
    it('should keep letters, spaces, hyphens and apostrophes', () => {
      const input = "João da Silva-Santos O'Connor";
      const result = InputSanitizer.sanitizeName(input);
      
      expect(result).toBe("João da Silva-Santos O'Connor");
    });

    it('should remove numbers and special characters', () => {
      const input = 'João123 da Silva<script>';
      const result = InputSanitizer.sanitizeName(input);
      
      expect(result).toBe('João da Silva');
    });
  });

  describe('sanitizeUrl', () => {
    it('should allow valid HTTP URLs', () => {
      const input = 'https://example.com/path';
      const result = InputSanitizer.sanitizeUrl(input);
      
      expect(result).toBe('https://example.com/path');
    });

    it('should allow mailto URLs', () => {
      const input = 'mailto:test@example.com';
      const result = InputSanitizer.sanitizeUrl(input);
      
      expect(result).toBe('mailto:test@example.com');
    });

    it('should block javascript URLs', () => {
      const input = 'javascript:alert(1)';
      const result = InputSanitizer.sanitizeUrl(input);
      
      expect(result).toBe('');
    });

    it('should block data URLs', () => {
      const input = 'data:text/html,<script>alert(1)</script>';
      const result = InputSanitizer.sanitizeUrl(input);
      
      expect(result).toBe('');
    });

    it('should block URLs without valid protocol', () => {
      const input = 'example.com';
      const result = InputSanitizer.sanitizeUrl(input);
      
      expect(result).toBe('');
    });
  });

  describe('sanitizeObject', () => {
    it('should sanitize object properties according to rules', () => {
      const input = {
        name: '  João Silva  ',
        email: '  TEST@EXAMPLE.COM  ',
        phone: '(11) 99999-9999',
        description: '<script>alert("xss")</script>Hello'
      };

      const rules = {
        name: { type: 'name' as const, required: true },
        email: { type: 'email' as const, required: true },
        phone: { type: 'phone' as const, required: false },
        description: { type: 'text' as const, maxLength: 10 }
      };

      const { sanitized, errors } = InputSanitizer.sanitizeObject(input, rules);

      expect(sanitized.name).toBe('João Silva');
      expect(sanitized.email).toBe('test@example.com');
      expect(sanitized.phone).toBe('(11) 99999-9999');
      expect(sanitized.description).toBe('&lt;script&');
      expect(Object.keys(errors)).toHaveLength(0);
    });

    it('should return errors for invalid data', () => {
      const input = {
        name: '',
        email: 'invalid-email',
        phone: '123'
      };

      const rules = {
        name: { type: 'name' as const, required: true },
        email: { type: 'email' as const, required: true },
        phone: { type: 'phone' as const, required: false }
      };

      const { sanitized, errors } = InputSanitizer.sanitizeObject(input, rules);

      expect(errors.name).toContain('obrigatório');
      expect(errors.email).toContain('formato válido');
    });

    it('should handle maxLength validation', () => {
      const input = {
        description: 'This is a very long description that exceeds the limit'
      };

      const rules = {
        description: { type: 'text' as const, maxLength: 10, required: true }
      };

      const { sanitized, errors } = InputSanitizer.sanitizeObject(input, rules);

      expect(errors.description).toContain('máximo 10 caracteres');
    });
  });

  describe('createSafeLogMessage', () => {
    it('should create safe log message', () => {
      const message = 'User login attempt';
      const data = {
        email: 'test@example.com',
        password: 'secret123',
        ip: '192.168.1.1'
      };

      const result = InputSanitizer.createSafeLogMessage(message, data);

      expect(result).toContain('User login attempt');
      expect(result).toContain('te***@example.com');
      expect(result).toContain('"password":"***"');
      expect(result).toContain('192.168.1.1');
    });

    it('should handle message without data', () => {
      const message = 'Simple log message';
      const result = InputSanitizer.createSafeLogMessage(message);

      expect(result).toBe('Simple log message');
    });
  });
});