/**
 * Plain-language error messages in Ethiopian working languages and English.
 */

export type SupportedLanguage = 'am' | 'om' | 'ti' | 'en';

export interface LocalizedErrorMap {
  NETWORK_OFFLINE: string;
  SERVER_UNAVAILABLE: string;
  AUTH_EXPIRED: string;
  IMAGE_TOO_LARGE: string;
  SYNC_CONFLICT: string;
  GPS_UNAVAILABLE: string;
  MICROPHONE_DENIED: string;
  UNKNOWN: string;
}

export const ERROR_MESSAGES: Record<SupportedLanguage, LocalizedErrorMap> = {
  am: {
    NETWORK_OFFLINE: 'ኢንተርኔት አልተገናኘም። መረጃዎ በስልኩ ተቀምጦ መስመር ሲገኝ ይላካል።',
    SERVER_UNAVAILABLE: 'የግብርና ቢሮ ሰርቨር ለጊዜው አልተገኘም። እባክዎ ትንሽ ቆይተው እንደገና ይሞክሩ።',
    AUTH_EXPIRED: 'የመግቢያ ጊዜዎ አልቋል። እባክዎ እንደገና በስልክ ቁጥርዎ ይግቡ።',
    IMAGE_TOO_LARGE: 'ፎቶው ከ 400 ኪሎባይት በላይ ነው። እባክዎ በትንሹ ይቀንሱት።',
    SYNC_CONFLICT: 'በመረጃ መመሳሰል ወቅት ግጭት ተፈጥሯል። የመጨረሻው የተረጋገጠ መረጃ ተቀምጧል።',
    GPS_UNAVAILABLE: 'የስልኩ ጂፒኤስ (GPS) ሊገኝ አልቻለም። እባክዎ ወደ ክፍት ቦታ ወጥተው ይሞክሩ።',
    MICROPHONE_DENIED: 'ማይክሮፎን የመጠቀም ፈቃድ አልተሰጠም። በስልክ ማስተካከያ ውስጥ ይፍቀዱ።',
    UNKNOWN: 'ያልታወቀ ችግር አጋጥሟል። እባክዎ እንደገና ይሞክሩ።',
  },
  om: {
    NETWORK_OFFLINE: 'Interneetiin hin jiru. Odeeffannoon keessan bilbila irratti olkaawwameera.',
    SERVER_UNAVAILABLE: 'Tajaajilli sarvarii yeroof addaan citeera. Mee xiqqoo turanii yaalaa.',
    AUTH_EXPIRED: 'Yeroon seensaa dhumateera. Mee lakkoofsa bilbilaan lammata seenaa.',
    IMAGE_TOO_LARGE: 'Suurri 400 KB ol ta’uu hin danda’u.',
    SYNC_CONFLICT: 'Walitti bu’iinsi odeeffannoo uumameera.',
    GPS_UNAVAILABLE: 'Bakki GPS hin argamne. Mee bakka banaatti yaalaa.',
    MICROPHONE_DENIED: 'Hayyamni maayikiroofoonii hin kennamne.',
    UNKNOWN: 'Dogoggorri hin beekamne uumameera.',
  },
  ti: {
    NETWORK_OFFLINE: 'ኢንተርኔት የለንን። ሓበሬታኹም ኣብ ሞባይል ተዓቂቡ ኣሎ።',
    SERVER_UNAVAILABLE: 'ሰርቨር ንግዚኡ ኣይተረኽበን። ድሕሪ ቅሩብ ደቓይቕ ደጊምኩም ፈትኑ።',
    AUTH_EXPIRED: 'ናይ ምእታው ግዜ ተወዲኡ። በይዘኦም እንደገና ይእተዉ።',
    IMAGE_TOO_LARGE: 'ስእሊ ካብ 400 KB ክዓቢ ኣይክእልን።',
    SYNC_CONFLICT: 'ናይ ሓበሬታ ምትእስሳር ግጭት ተፈጢሩ።',
    GPS_UNAVAILABLE: 'ጂፒኤስ (GPS) ኣይተረኽበን።',
    MICROPHONE_DENIED: 'ናይ ማይክሮፎን ፍቓድ ኣይተዋህበን።',
    UNKNOWN: 'ዘይተፈልጠ ጸገም ተፈጢሩ።',
  },
  en: {
    NETWORK_OFFLINE: 'No internet connection. Changes are saved locally on this device.',
    SERVER_UNAVAILABLE: 'Agricultural service is temporarily unavailable. Please try again soon.',
    AUTH_EXPIRED: 'Your session has expired. Please log in again with your phone number.',
    IMAGE_TOO_LARGE: 'Image exceeds maximum limit of 400 KB. It has been automatically resized.',
    SYNC_CONFLICT: 'Sync conflict detected and resolved deterministically.',
    GPS_UNAVAILABLE: 'GPS location signal is weak or unavailable. Move to open sky.',
    MICROPHONE_DENIED: 'Microphone permission is required for voice box recording.',
    UNKNOWN: 'An unexpected error occurred. Please try again.',
  },
};

export function getLocalizedErrorMessage(
  code: keyof LocalizedErrorMap,
  lang: SupportedLanguage = 'en'
): string {
  return ERROR_MESSAGES[lang]?.[code] || ERROR_MESSAGES.en[code];
}

