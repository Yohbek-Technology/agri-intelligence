const ETHIOPIAN_E164_REGEX = /^\+251[79][0-9]{8}$/

export const PhoneUtils = {
  normalize: (phone: string): string => {
    const t = phone.replace(/\s+/g, '')
    if (t.startsWith('+251')) return t
    if (t.startsWith('251')) return `+${t}`
    if (t.startsWith('0')) return `+251${t.slice(1)}`
    return t
  },
  isValidE164: (phone: string): boolean => ETHIOPIAN_E164_REGEX.test(phone),
}
