/**
 * Maps API errors into user-friendly messages for the mobile client.
 */
export function mapAuthError(err: unknown): string {
  if (!err) return 'An unexpected error occurred. Please try again.';

  if (typeof err === 'string') {
    return normalizeErrorMessage(err);
  }

  if (typeof err === 'object' && err !== null) {
    const errorObj = err as Record<string, unknown>;
    if (typeof errorObj.message === 'string') {
      return normalizeErrorMessage(errorObj.message);
    }
    if (typeof errorObj.error === 'string') {
      return normalizeErrorMessage(errorObj.error);
    }
    if (typeof errorObj.error === 'object' && errorObj.error !== null) {
      const nested = errorObj.error as Record<string, unknown>;
      if (typeof nested.message === 'string') {
        return normalizeErrorMessage(nested.message);
      }
    }
    if (typeof errorObj.statusText === 'string') {
      return normalizeErrorMessage(errorObj.statusText);
    }
  }

  return 'Network or server communication failure. Please verify your connection.';
}

function normalizeErrorMessage(raw: string): string {
  const lower = raw.toLowerCase();

  if (
    lower.includes('invalid credentials') ||
    lower.includes('invalid password') ||
    lower.includes('user not found')
  ) {
    return 'Invalid phone number / username or password. Please verify and retry.';
  }

  if (lower.includes('locked') || lower.includes('too many attempts')) {
    return 'Account temporarily locked due to excessive failed attempts. Please retry later.';
  }

  if (lower.includes('expired') || lower.includes('otp expired')) {
    return 'The verification code has expired. Please request a new 6-digit code.';
  }

  if (lower.includes('invalid code') || lower.includes('invalid otp')) {
    return 'Incorrect 6-digit verification code. Please check your SMS inbox.';
  }

  if (lower.includes('already registered') || lower.includes('phone_already_registered')) {
    return 'This phone number is already registered. Please sign in instead.';
  }

  if (lower.includes('already exists') || lower.includes('duplicate')) {
    return 'This account is already registered. Please sign in instead.';
  }

  if (lower.includes('rate limit') || lower.includes('too many requests')) {
    return 'Request rate limit reached. Please wait a moment before trying again.';
  }

  return raw;
}
