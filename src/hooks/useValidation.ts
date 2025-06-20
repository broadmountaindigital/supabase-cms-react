import { useCallback, useMemo, useState } from 'react';
import type {
  ValidationSchema,
  ValidationResult,
  ValidationError,
  ValidationMode,
} from '../types/ValidationTypes';

interface UseValidationReturn {
  /** Current validation result */
  validationResult: ValidationResult;
  /** Validate a specific value */
  validate: (value: string, mode?: ValidationMode) => ValidationResult;
  /** Whether the current value is valid */
  isValid: boolean;
  /** Whether there are blocking errors */
  hasBlockingErrors: boolean;
  /** All validation errors */
  errors: ValidationError[];
  /** Only blocking errors */
  blockingErrors: ValidationError[];
  /** Only warning errors */
  warnings: ValidationError[];
  /** Clear all validation errors */
  clearValidation: () => void;
}

/**
 * Hook for handling field validation with configurable rules and modes
 */
export function useValidation(
  schema?: ValidationSchema,
  initialValue = ''
): UseValidationReturn {
  const [validationResult, setValidationResult] = useState<ValidationResult>({
    isValid: true,
    errors: [],
    warnings: [],
  });

  const validateValue = useCallback(
    (value: string): ValidationResult => {
      if (!schema) {
        return {
          isValid: true,
          errors: [],
          warnings: [],
        };
      }

      const allErrors: ValidationError[] = [];
      const warnings: ValidationError[] = [];
      const blockingErrors: ValidationError[] = [];

      for (const rule of schema.rules) {
        const isValid = rule.validate(value);

        if (!isValid) {
          const error: ValidationError = {
            ruleId: rule.id,
            message: rule.message,
            blockSave: rule.blockSave ?? true,
          };

          allErrors.push(error);

          if (error.blockSave) {
            blockingErrors.push(error);
          } else {
            warnings.push(error);
          }
        }
      }

      return {
        isValid: blockingErrors.length === 0,
        errors: blockingErrors,
        warnings,
      };
    },
    [schema]
  );

  const validate = useCallback(
    (value: string, mode: ValidationMode = 'manual'): ValidationResult => {
      const result = validateValue(value);

      // Update state based on validation mode and schema settings
      const shouldShowErrors = determineShowErrors(mode, schema);

      if (shouldShowErrors) {
        setValidationResult(result);
      }

      return result;
    },
    [validateValue, schema]
  );

  const clearValidation = useCallback(() => {
    setValidationResult({
      isValid: true,
      errors: [],
      warnings: [],
    });
  }, []);

  // Initialize with initial value
  useMemo(() => {
    if (schema && initialValue) {
      const result = validateValue(initialValue);
      setValidationResult(result);
    }
  }, [schema, initialValue, validateValue]);

  return {
    validationResult,
    validate,
    isValid: validationResult.isValid,
    hasBlockingErrors: validationResult.errors.length > 0,
    errors: [...validationResult.errors, ...validationResult.warnings],
    blockingErrors: validationResult.errors,
    warnings: validationResult.warnings,
    clearValidation,
  };
}

// Helper function to determine when to show errors based on mode and schema
function determineShowErrors(
  mode: ValidationMode,
  schema?: ValidationSchema
): boolean {
  if (!schema?.showInlineErrors) {
    return false;
  }

  const shouldShowOnChange = mode === 'onChange' && schema.validateOnChange;
  const shouldShowOnBlur = mode === 'onBlur' && schema.validateOnBlur;
  const shouldShowOnSave = mode === 'onSave';
  const shouldShowManual = mode === 'manual';

  return (
    shouldShowOnChange ||
    shouldShowOnBlur ||
    shouldShowOnSave ||
    shouldShowManual
  );
}
