// lib/forms/map-server-action-result.ts
import type { GuideApplicationResult } from "@/app/(business)/business/features/guide/onboarding/actions";

export type MappedFormError = {
  formError?: string;
  fieldErrors: Record<string, string>;
};

export function mapGuideApplicationResultToForm(
  result: GuideApplicationResult
): MappedFormError {
  // Success path: no form errors
  if (result.success) {
    return {
      formError: undefined,
      fieldErrors: {},
    };
  }

  // Failure path: normalize fieldErrors from server to a flat map
  const fieldErrors: Record<string, string> = {};

  if (result.fieldErrors) {
    for (const [field, errors] of Object.entries(result.fieldErrors)) {
      if (errors && errors.length > 0) {
        fieldErrors[field] = errors[0];
      }
    }
  }

  // Build a user-friendly top-level error
  let formError = result.message;

  if (process.env.NODE_ENV === "development" && result.traceId) {
    formError = `${result.message} (trace: ${result.traceId})`;
  }

  return {
    formError,
    fieldErrors,
  };
}
