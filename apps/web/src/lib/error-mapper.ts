export function mapAuthError(error: unknown): string {
  if (!error) return 'An unexpected error occurred. Please try again.'

  if (typeof error === 'string') return error

  const errObj = error as { message?: string; code?: string; statusText?: string }

  if (errObj.code) {
    switch (errObj.code) {
      case 'INVALID_PHONE_NUMBER_OR_PASSWORD':
        return 'Invalid phone number or password.'
      case 'PHONE_NUMBER_NOT_VERIFIED':
        return 'Phone number not verified. A verification code has been dispatched.'
      case 'PHONE_NUMBER_EXIST':
      case 'USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL':
        return 'This phone number is already registered. Sign in or reset your password.'
      case 'INVALID_OTP':
        return 'Invalid 6-digit verification code.'
      case 'OTP_EXPIRED':
        return 'Verification code expired. Request a new code.'
      case 'TOO_MANY_ATTEMPTS':
        return 'Too many failed attempts. Account lockout active for 15 minutes.'
      case 'PASSWORD_TOO_SHORT':
        return 'Password must be at least 10 characters long.'
      case 'UNEXPECTED_ERROR':
        return 'Service temporarily unavailable. Please retry.'
      default:
        break
    }
  }

  if (errObj.message) {
    if (errObj.message.includes('Invalid phone number or password')) {
      return 'Invalid phone number or password.'
    }
    if (errObj.message.includes('already exists') || errObj.message.includes('already registered')) {
      return 'This phone number is already registered.'
    }
    if (errObj.message.includes('OTP') || errObj.message.includes('code')) {
      return 'Invalid verification code.'
    }
    return errObj.message
  }

  return 'Operation failed. Please verify input data and retry.'
}
