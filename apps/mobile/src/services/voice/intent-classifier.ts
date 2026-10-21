export type AgriculturalIntentType =
  | 'NAVIGATE_HOME'
  | 'NAVIGATE_PLOTS'
  | 'REGISTER_PLOT'
  | 'OPEN_CAMERA_DIAGNOSIS'
  | 'CHECK_WEATHER'
  | 'VIEW_MARKET_PRICES'
  | 'RECORD_GRIEVANCE'
  | 'LOG_FERTILIZER'
  | 'LOG_HARVEST'
  | 'READ_SCREEN'
  | 'CHECK_SYNC'
  | 'UNKNOWN';

export interface ClassifiedIntent {
  intent: AgriculturalIntentType;
  confidence: number;
  slots: Record<string, string>;
  rawTranscript: string;
  detectedLanguage: 'am' | 'om' | 'ti' | 'en';
}

interface IntentPattern {
  intent: AgriculturalIntentType;
  patterns: {
    am: RegExp[];
    om: RegExp[];
    ti: RegExp[];
    en: RegExp[];
  };
}

const INTENT_PATTERNS: IntentPattern[] = [
  {
    intent: 'NAVIGATE_HOME',
    patterns: {
      am: [/መነሻ|ዋና\s*ገጽ|ወደ\s*ቤት|ቤት/i],
      om: [/mana|fuula\s*duraa|gara\s*mana/i],
      ti: [/መበገሲ|ናብ\s*ገዛ|ገዛ/i],
      en: [/home|dashboard|main\s*screen/i],
    },
  },
  {
    intent: 'NAVIGATE_PLOTS',
    patterns: {
      am: [/ማሳዎች|ማሳዎቼ|እርሻዬ|የማሳ\s*ዝርዝር/i],
      om: [/lafa|maasii|maasiiwwan/i],
      ti: [/መሬተይ|ማእከላት|ዝርዝር\s*መሬት/i],
      en: [/plots|my\s*plots|farm\s*list|fields/i],
    },
  },
  {
    intent: 'REGISTER_PLOT',
    patterns: {
      am: [/አዲስ\s*ማሳ|ማሳ\s*መዝግብ|አዲስ\s*መሬት/i],
      om: [/maasii\s*galmeessi|lafa\s*haaraa/i],
      ti: [/ሓድሽ\s*መሬት|መዝግብ\s*መሬት/i],
      en: [/register\s*plot|new\s*field|add\s*plot/i],
    },
  },
  {
    intent: 'OPEN_CAMERA_DIAGNOSIS',
    patterns: {
      am: [/በሽታ|ተባይ|ቅጠል\s*መርምር|ካሜራ|ፎቶ\s*አንሳ/i],
      om: [/dhukkuba|hoomaa|fakkii\s*kaasi|kaameeraa/i],
      ti: [/ሕማም|ተባይ|ፎቶ|ምርመራ\s*ቅጠሊ/i],
      en: [/pest|disease|diagnose|scan\s*leaf|take\s*photo|camera/i],
    },
  },
  {
    intent: 'CHECK_WEATHER',
    patterns: {
      am: [/የአየር\s*ሁኔታ|ዝናብ|ዝናብ\s*ይዘንባል|ብርድ/i],
      om: [/haala\s*qilleensaa|rooba|bokkaa/i],
      ti: [/ኩነታት\s*ኣየር|ዝናብ|ናይ\s*ኣየር\s*ኩነታት/i],
      en: [/weather|forecast|rain|rainy|spray\s*window/i],
    },
  },
  {
    intent: 'VIEW_MARKET_PRICES',
    patterns: {
      am: [/ዋጋ|የገበያ\s*ዋጋ|ጤፍ\s*ስንት\s*ነው|ገበያ/i],
      om: [/gabaa|gatiin|gatii\s*midhaanii/i],
      ti: [/ዋጋ|ዋጋ\s*ዕዳጋ|ዕዳጋ/i],
      en: [/market|price|prices|grain\s*price|rates/i],
    },
  },
  {
    intent: 'RECORD_GRIEVANCE',
    patterns: {
      am: [/ቅሬታ|አቤቱታ|ችግር\s*አለብኝ|አመልክት/i],
      om: [/komii|iyyata|rakkoo\s*qaba/i],
      ti: [/ጥርዓን|ክሲ|ጸገም\s*ኣሎኒ/i],
      en: [/grievance|complaint|report\s*issue|help/i],
    },
  },
  {
    intent: 'LOG_FERTILIZER',
    patterns: {
      am: [/ማዳበሪያ|ዩሪያ|ዳፕ|ማዳበሪያ\s*ጨመርኩ/i],
      om: [/xaa'oo|yuuriyaa|dappii/i],
      ti: [/መዳበሪያ|ዩርያ|መዳበርያ\s*ወሲኸ/i],
      en: [/fertilizer|urea|basal|log\s*fertilizer/i],
    },
  },
  {
    intent: 'LOG_HARVEST',
    patterns: {
      am: [/ምርት|አጨዳ|አጨድኩ|ምርት\s*መዝግብ/i],
      om: [/omisha|haamuu|midhaan\s*haame/i],
      ti: [/ምህርቲ|ዓጺደ|ምህርቲ\s*መዝግብ/i],
      en: [/harvest|yield|crop\s*harvest/i],
    },
  },
  {
    intent: 'READ_SCREEN',
    patterns: {
      am: [/አንብብልኝ|ይህንን\s*አንብብ|ምን\s*ይላል/i],
      om: [/naaf\s*dubbisi|maal\s*jedha/i],
      ti: [/ኣንብበለይ|እንታይ\s*ይብል/i],
      en: [/read\s*screen|read\s*this|what\s*does\s*it\s*say|explain/i],
    },
  },
  {
    intent: 'CHECK_SYNC',
    patterns: {
      am: [/ማመሳሰል|ኔትወርክ|ዳታ|ተልኳል/i],
      om: [/siinkii|ergameera|wal-simsiisaa/i],
      ti: [/ምስምማዕ|ተላኢኹ/i],
      en: [/sync|status|offline\s*queue|upload\s*status/i],
    },
  },
];

export function classifySpokenIntent(
  transcript: string,
  preferredLanguage: 'am' | 'om' | 'ti' | 'en' = 'am'
): ClassifiedIntent {
  const cleanText = transcript.trim();
  if (!cleanText) {
    return {
      intent: 'UNKNOWN',
      confidence: 0,
      slots: {},
      rawTranscript: '',
      detectedLanguage: preferredLanguage,
    };
  }

  // Check language-specific patterns first, then fallback across all languages
  for (const item of INTENT_PATTERNS) {
    const langPatterns = item.patterns[preferredLanguage] || [];
    for (const regex of langPatterns) {
      if (regex.test(cleanText)) {
        return {
          intent: item.intent,
          confidence: 0.92,
          slots: extractSlots(cleanText),
          rawTranscript: cleanText,
          detectedLanguage: preferredLanguage,
        };
      }
    }
  }

  // Cross-language scan
  for (const item of INTENT_PATTERNS) {
    for (const [lang, patterns] of Object.entries(item.patterns)) {
      for (const regex of patterns) {
        if (regex.test(cleanText)) {
          return {
            intent: item.intent,
            confidence: 0.85,
            slots: extractSlots(cleanText),
            rawTranscript: cleanText,
            detectedLanguage: lang as 'am' | 'om' | 'ti' | 'en',
          };
        }
      }
    }
  }

  return {
    intent: 'UNKNOWN',
    confidence: 0.3,
    slots: {},
    rawTranscript: cleanText,
    detectedLanguage: preferredLanguage,
  };
}

function extractSlots(text: string): Record<string, string> {
  const slots: Record<string, string> = {};
  if (/ጤፍ|teff/i.test(text)) slots.crop = 'teff';
  if (/ስንዴ|wheat/i.test(text)) slots.crop = 'wheat';
  if (/በቆሎ|maize/i.test(text)) slots.crop = 'maize';
  if (/ዩሪያ|urea/i.test(text)) slots.fertilizer = 'urea';
  if (/ዳፕ|nps|basal/i.test(text)) slots.fertilizer = 'basal';
  return slots;
}
