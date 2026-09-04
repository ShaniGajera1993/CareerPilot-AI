import type { ApiFieldErrors } from "../services/api";

export function focusFirstInvalidField(
  fieldErrors: ApiFieldErrors,
  idPrefix: string,
): void {
  const firstInvalidField = Object.keys(fieldErrors)[0];

  if (!firstInvalidField) {
    return;
  }

  requestAnimationFrame(() => {
    document.getElementById(`${idPrefix}-${firstInvalidField}`)?.focus();
  });
}
