import { BadRequestError, ValidationError } from './errors';

export interface ValidationRule {
  validate: (value: any) => boolean;
  message: string;
}

export class Validator {
  private errors: string[] = [];

  required(value: any, fieldName: string): this {
    if (value === undefined || value === null || value === '') {
      this.errors.push(`${fieldName} is required`);
    }
    return this;
  }

  string(value: any, fieldName: string, minLength?: number, maxLength?: number): this {
    if (value !== undefined && value !== null) {
      if (typeof value !== 'string') {
        this.errors.push(`${fieldName} must be a string`);
      } else {
        if (minLength !== undefined && value.length < minLength) {
          this.errors.push(`${fieldName} must be at least ${minLength} characters`);
        }
        if (maxLength !== undefined && value.length > maxLength) {
          this.errors.push(`${fieldName} must be at most ${maxLength} characters`);
        }
      }
    }
    return this;
  }

  email(value: any, fieldName: string = 'Email'): this {
    if (value !== undefined && value !== null && value !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        this.errors.push(`${fieldName} is invalid`);
      }
    }
    return this;
  }

  number(value: any, fieldName: string, min?: number, max?: number): this {
    if (value !== undefined && value !== null) {
      const num = typeof value === 'string' ? parseFloat(value) : value;
      if (isNaN(num)) {
        this.errors.push(`${fieldName} must be a number`);
      } else {
        if (min !== undefined && num < min) {
          this.errors.push(`${fieldName} must be at least ${min}`);
        }
        if (max !== undefined && num > max) {
          this.errors.push(`${fieldName} must be at most ${max}`);
        }
      }
    }
    return this;
  }

  oneOf(value: any, allowedValues: any[], fieldName: string): this {
    if (value !== undefined && value !== null && !allowedValues.includes(value)) {
      this.errors.push(`${fieldName} must be one of: ${allowedValues.join(', ')}`);
    }
    return this;
  }

  array(value: any, fieldName: string, minLength?: number, maxLength?: number): this {
    if (value !== undefined && value !== null) {
      if (!Array.isArray(value)) {
        this.errors.push(`${fieldName} must be an array`);
      } else {
        if (minLength !== undefined && value.length < minLength) {
          this.errors.push(`${fieldName} must have at least ${minLength} items`);
        }
        if (maxLength !== undefined && value.length > maxLength) {
          this.errors.push(`${fieldName} must have at most ${maxLength} items`);
        }
      }
    }
    return this;
  }

  throwIfErrors(): void {
    if (this.errors.length > 0) {
      throw new ValidationError('Validation failed', this.errors);
    }
  }

  isValid(): boolean {
    return this.errors.length === 0;
  }

  getErrors(): string[] {
    return [...this.errors];
  }
}

export function validate(): Validator {
  return new Validator();
}
