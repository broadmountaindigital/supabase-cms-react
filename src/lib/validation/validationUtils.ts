import type { ValidationRule } from '../../types/ValidationTypes';

/**
 * Utility functions for creating common validation rules
 */
export const ValidationUtils = {
  /**
   * Creates a required field validation rule
   */
  required(message = 'This field is required'): ValidationRule {
    return {
      id: 'required',
      message,
      validate: (value: string) => {
        return value.trim().length > 0;
      },
      blockSave: true,
    };
  },

  /**
   * Creates a minimum length validation rule
   */
  minLength(min: number, message?: string): ValidationRule {
    return {
      id: 'minLength',
      message: message || `Must be at least ${min} characters`,
      validate: (value: string) => {
        return value.length >= min;
      },
      blockSave: true,
    };
  },

  /**
   * Creates a maximum length validation rule
   */
  maxLength(max: number, message?: string): ValidationRule {
    return {
      id: 'maxLength',
      message: message || `Must be no more than ${max} characters`,
      validate: (value: string) => {
        return value.length <= max;
      },
      blockSave: true,
    };
  },

  /**
   * Creates a regex pattern validation rule
   */
  pattern(regex: RegExp, message: string): ValidationRule {
    return {
      id: 'pattern',
      message,
      validate: (value: string) => {
        return regex.test(value);
      },
      blockSave: true,
    };
  },

  /**
   * Creates an email validation rule
   */
  email(message = 'Must be a valid email address'): ValidationRule {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return {
      id: 'email',
      message,
      validate: (value: string) => {
        return value === '' || emailRegex.test(value);
      },
      blockSave: true,
    };
  },

  /**
   * Creates a URL validation rule
   */
  url(message = 'Must be a valid URL'): ValidationRule {
    return {
      id: 'url',
      message,
      validate: (value: string) => {
        if (value === '') return true;
        try {
          new URL(value);
          return true;
        } catch {
          return false;
        }
      },
      blockSave: true,
    };
  },

  /**
   * Creates a numeric validation rule
   */
  numeric(message = 'Must be a valid number'): ValidationRule {
    return {
      id: 'numeric',
      message,
      validate: (value: string) => {
        return value === '' || !isNaN(Number(value));
      },
      blockSave: true,
    };
  },

  /**
   * Creates a custom validation rule
   */
  custom(
    id: string,
    message: string,
    validateFn: (value: string) => boolean,
    blockSave = true
  ): ValidationRule {
    return {
      id,
      message,
      validate: validateFn,
      blockSave,
    };
  },

  /**
   * Creates a warning validation rule (non-blocking)
   */
  warning(
    id: string,
    message: string,
    validateFn: (value: string) => boolean
  ): ValidationRule {
    return {
      id,
      message,
      validate: validateFn,
      blockSave: false,
    };
  },
};
