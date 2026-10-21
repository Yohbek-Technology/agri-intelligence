import { ROUTES, type RouteName } from '@/navigation/routes';
import type { ClassifiedIntent } from './intent-classifier';

export interface RouteResolution {
  routeName?: RouteName;
  action?: 'scroll_to_top' | 'read_screen' | 'open_camera' | 'none';
  spokenFeedback: {
    am: string;
    om: string;
    ti: string;
    en: string;
  };
}

export function resolveVoiceIntentToRoute(classified: ClassifiedIntent): RouteResolution {
  switch (classified.intent) {
    case 'NAVIGATE_HOME':
      return {
        routeName: ROUTES.FARMER_HOME,
        action: 'none',
        spokenFeedback: {
          am: 'ወደ መነሻ ገጽ በመሄድ ላይ',
          om: 'Gara fuula duraatti deemaa jira',
          ti: 'ናብ መበገሲ ገጽ ይኸይድ ኣሎ',
          en: 'Navigating to Home',
        },
      };

    case 'NAVIGATE_PLOTS':
      return {
        routeName: ROUTES.PLOT_LIST,
        action: 'none',
        spokenFeedback: {
          am: 'የማሳዎች ዝርዝር',
          om: 'Tarree maasiiwwanii',
          ti: 'ዝርዝር መሬት',
          en: 'Opening your plots',
        },
      };

    case 'REGISTER_PLOT':
      return {
        routeName: ROUTES.REGISTER_PLOT,
        action: 'none',
        spokenFeedback: {
          am: 'አዲስ ማሳ መመዝገቢያ',
          om: 'Galmee maasii haaraa',
          ti: 'ምዝገባ ሓድሽ መሬት',
          en: 'Opening plot registration',
        },
      };

    case 'OPEN_CAMERA_DIAGNOSIS':
      return {
        routeName: ROUTES.PEST_DIAGNOSIS,
        action: 'open_camera',
        spokenFeedback: {
          am: 'የተባይ እና በሽታ ምርመራ ካሜራ',
          om: 'Qorannoo dhukkubaa fi hoomaa',
          ti: 'ምርመራ ሕማምን ተባይን',
          en: 'Opening crop pest diagnosis',
        },
      };

    case 'CHECK_WEATHER':
      return {
        routeName: ROUTES.WEATHER_FORECAST,
        action: 'none',
        spokenFeedback: {
          am: 'የ7 ቀን የአየር ሁኔታ እና የእርሻ ውሳኔ',
          om: 'Raaga qilleensaa fi murtee qonnaa',
          ti: 'ኩነታት ኣየርን ናይ ሕርሻ ውሳነን',
          en: 'Opening weather forecast',
        },
      };

    case 'VIEW_MARKET_PRICES':
      return {
        routeName: ROUTES.MARKET_PRICES,
        action: 'none',
        spokenFeedback: {
          am: 'የገበያ ዋጋ ሰሌዳ',
          om: 'Gabatee gatii gabaa',
          ti: 'ሰሌዳ ዋጋ ዕዳጋ',
          en: 'Opening market price board',
        },
      };

    case 'RECORD_GRIEVANCE':
      return {
        routeName: ROUTES.GRIEVANCE_CHAT,
        action: 'none',
        spokenFeedback: {
          am: 'የቅሬታ እና አቤቱታ ሳጥን',
          om: 'Saanduqa komii fi iyyataa',
          ti: 'ሳጹን ጥርዓንን ክስን',
          en: 'Opening grievance voice box',
        },
      };

    case 'LOG_FERTILIZER':
      return {
        routeName: ROUTES.UNIVERSAL_LOGGER,
        action: 'none',
        spokenFeedback: {
          am: 'የማዳበሪያ መዝገብ',
          om: 'Galmee xaa’oo',
          ti: 'መዝገብ መዳበሪያ',
          en: 'Opening fertilizer logging',
        },
      };

    case 'LOG_HARVEST':
      return {
        routeName: ROUTES.UNIVERSAL_LOGGER,
        action: 'none',
        spokenFeedback: {
          am: 'የምርት እና አጨዳ መዝገብ',
          om: 'Galmee omishaa',
          ti: 'መዝገብ ምህርቲ',
          en: 'Opening harvest logging',
        },
      };

    case 'CHECK_SYNC':
      return {
        routeName: ROUTES.SYNC_SETTINGS,
        action: 'none',
        spokenFeedback: {
          am: 'የዳታ ማመሳሰል ሁኔታ',
          om: 'Haala wal-simsiisaa',
          ti: 'ኩነታት ምስምማዕ',
          en: 'Opening sync settings',
        },
      };

    case 'READ_SCREEN':
      return {
        action: 'read_screen',
        spokenFeedback: {
          am: 'ይህንን ገጽ በማንበብ ላይ',
          om: 'Fuula kana dubbisaa jira',
          ti: 'እዚ ገጽ የንብብ ኣሎ',
          en: 'Reading screen content',
        },
      };

    case 'UNKNOWN':
    default:
      return {
        action: 'none',
        spokenFeedback: {
          am: 'ይቅርታ አልገባኝም፣ እባክዎ በድጋሚ ይናገሩ',
          om: 'Dhiifama naaf hin galle, lammata dubbadhaa',
          ti: 'ይቕረታ ኣይተረድኣንን፣ በጃኹም ደጊምኩም ተዛረቡ',
          en: 'Sorry, I did not catch that. Please try again.',
        },
      };
  }
}
