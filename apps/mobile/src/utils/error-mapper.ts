import type { SupportedLanguage } from '@/config/constants';

/**
 * Localized user-friendly error translations for Ethiopian farmers and extension workers
 */
const ERROR_MESSAGES: Record<string, Record<SupportedLanguage, string>> = {
  invalid_credentials: {
    en: 'Incorrect phone number or password. Please verify and retry.',
    am: 'የተሳሳተ ስልክ ቁጥር ወይም የይለፍ ቃል:: እባክዎ እንደገና ይሞክሩ::',
    om: 'Lakkoofsa bilbilaa ykn jecha icciitii dogoggoraa. Maaloo irra deebi\'aa yaalaa.',
    ti: 'ዘይተፈልጠ ቑጽሪ ስልኪ ወይ መሕለፊ ቓል:: በጃኹም ደጊምኩም ፈትኑ::',
  },
  client_not_permitted: {
    en: 'Agricultural Officers and Admins must use the Web Portal. Mobile is for Farmers and DAs only.',
    am: 'የግብርና ባለሙያዎች እና አስተዳዳሪዎች በድረ-ገጽ ፖርታል መግባት አለባቸው:: ሞባይል መተግበሪያ ለገበሬዎች እና ዲኤዎች ብቻ ነው::',
    om: 'Ogeessonni qonnaa fi bulchitoonni weebsaayitii gargaaramuu qabu. Moobaayilli qotee bultootaa fi DA qofaafi.',
    ti: 'ሰብ ሞያ ሕርሻን ኣመሓደርትን ብመርበብ ሓበሬታ ጥራሕ ይጥቀሙ:: ሞባይል ንሓረስቶትን ዲኤታትን ጥራሕ እዩ::',
  },
  account_locked: {
    en: 'Account temporarily locked due to 5 failed attempts. Please wait 15 minutes.',
    am: 'መለያዎ ለ15 ደቂቃዎች ታግዷል:: እባክዎ ቆይተው እንደገና ይሞክሩ::',
    om: 'Herregni keessan daqiiqaa 15f cufameera. Maaloo yeroo booda yaalaa.',
    ti: 'ሕሳብኩም ን15 ደቓይቕ ተዓጽዩ ኣሎ:: በጃኹም ጸኒሕኩም ፈትኑ::',
  },
  otp_expired: {
    en: 'The 6-digit verification code has expired. Please request a new code.',
    am: 'የማረጋገጫ ኮዱ ጊዜው አልፎበታል:: እባክዎ አዲስ ኮድ ይጠይቁ::',
    om: 'Koodiin mirkaneessaa yeroon isaa darbeera. Maaloo koodii haaraa gaafadhaa.',
    ti: 'ናይ ምርግጋጽ ኮድ ጊዜኡ ሓሊፉ:: በጃኹም ሓድሽ ኮድ ሕተቱ::',
  },
  otp_invalid: {
    en: 'Incorrect 6-digit code. Please check your SMS inbox.',
    am: 'የተሳሳተ የማረጋገጫ ኮድ:: እባክዎ የSMS መልእክትዎን ይመልከቱ::',
    om: 'Koodii dogoggoraa. Maaloo ergaa SMS keessan ilaalaa.',
    ti: 'ጌጋ ናይ ምርግጋጽ ኮድ:: በጃኹም ናይ SMS መልእኽትኹም ተወከሱ::',
  },
  phone_already_registered: {
    en: 'This phone number is already registered. Please sign in instead.',
    am: 'ይህ ስልክ ቁጥር አስቀድሞ ተመዝግቧል:: እባክዎ በቀጥታ ይግቡ::',
    om: 'Lakkoofsi bilbilaa kun duraan galmaa\'eera. Maaloo ol seenaa.',
    ti: 'እዚ ቑጽሪ ስልኪ ኣቐዲሙ ተመዝጊቡ እዩ:: በጃኹም ብቐጥታ እተዉ::',
  },
  network_error: {
    en: 'No internet connection. Saved locally and will sync when connected.',
    am: 'የኢንተርኔት ግንኙነት የለም:: መረጃው በስልክዎ ተቀምጧል፣ ግንኙነት ሲገኝ ይሰምራል::',
    om: 'Konneksiyiniin intarneetii hin jiru. Moobaayila keessan irratti qabameera.',
    ti: 'ናይ ኢንተርኔት ርክብ የለን:: ኣብ ስልክኹም ተዓቂቡ ኣሎ፣ ርክብ ምስ ተረኽበ ክሰምር እዩ::',
  },
  default: {
    en: 'An unexpected error occurred. Please try again.',
    am: 'ያልተጠበቀ ስህተት አጋጥሟል:: እባክዎ እንደገና ይሞክሩ::',
    om: 'Dogoggorri hin eegamne mudateera. Maaloo irra deebi\'aa yaalaa.',
    ti: 'ዘይተጸበየ ጌጋ ኣጋጢሙ:: በጃኹም ደጊምኩም ፈትኑ::',
  },
};

export function mapAuthError(err: unknown, lang: SupportedLanguage = 'am'): string {
  if (!err) return ERROR_MESSAGES.default[lang];

  let raw = '';
  if (typeof err === 'string') {
    raw = err;
  } else if (typeof err === 'object' && err !== null) {
    const errorObj = err as Record<string, unknown>;
    if (typeof errorObj.code === 'string') {
      const codeKey = errorObj.code.toLowerCase();
      if (ERROR_MESSAGES[codeKey]) {
        return ERROR_MESSAGES[codeKey][lang];
      }
    }
    if (typeof errorObj.message === 'string') {
      raw = errorObj.message;
    } else if (typeof errorObj.error === 'string') {
      raw = errorObj.error;
    }
  }

  const lower = raw.toLowerCase();

  if (lower.includes('client_not_permitted') || lower.includes('client not permitted')) {
    return ERROR_MESSAGES.client_not_permitted[lang];
  }
  if (lower.includes('invalid credentials') || lower.includes('invalid password') || lower.includes('user not found')) {
    return ERROR_MESSAGES.invalid_credentials[lang];
  }
  if (lower.includes('locked') || lower.includes('too many attempts')) {
    return ERROR_MESSAGES.account_locked[lang];
  }
  if (lower.includes('expired') || lower.includes('otp expired')) {
    return ERROR_MESSAGES.otp_expired[lang];
  }
  if (lower.includes('invalid code') || lower.includes('invalid otp')) {
    return ERROR_MESSAGES.otp_invalid[lang];
  }
  if (lower.includes('already registered') || lower.includes('phone_already_registered')) {
    return ERROR_MESSAGES.phone_already_registered[lang];
  }
  if (lower.includes('network') || lower.includes('failed to fetch')) {
    return ERROR_MESSAGES.network_error[lang];
  }

  return raw || ERROR_MESSAGES.default[lang];
}
