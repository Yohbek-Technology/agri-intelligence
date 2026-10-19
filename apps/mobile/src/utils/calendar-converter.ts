/**
 * Ethiopian <-> Gregorian Calendar Algorithm
 * Accurate conversion for agricultural planning & date display in Ethiopia
 */

export interface EthiopianDate {
  year: number;
  month: number; // 1 to 13 (Meskerem to Pagume)
  day: number;
}

export const ETHIOPIAN_MONTHS: Record<string, string[]> = {
  en: [
    'Meskerem', 'Tikimt', 'Hidar', 'Tahsas', 'Tir', 'Yakatit',
    'Magabit', 'Miyazya', 'Ginbot', 'Sene', 'Hamle', 'Nehase', 'Pagume'
  ],
  am: [
    'መስከረም', 'ጥቅምት', 'ኅዳር', 'ታኅሣሥ', 'ጥር', 'የካቲት',
    'መጋቢት', 'ሚያዝያ', 'ግንቦት', 'ሰኔ', 'ሐምሌ', 'ነሐሴ', 'ጳጉሜ'
  ],
  om: [
    'Fulbaana', 'Onkololeessa', 'Sadaasa', 'Muddee', 'Amajjii', 'Guraandhala',
    'Bitooteessa', 'Elba', 'Caamsaa', 'Waxabajjii', 'Adooleessa', 'Hagayya', 'Qaammee'
  ],
  ti: [
    'መስከረም', 'ጥቅምቲ', 'ሕዳር', 'ታሕሳስ', 'ጥሪ', 'የካቲት',
    'መጋቢት', 'ሚያዝያ', 'ግንቦት', 'ሰነ', 'ሓምለ', 'ነሓሰ', 'ጳጉሜን'
  ],
};

const JD_OFFSET = 1723856;

function gregorianToJdn(year: number, month: number, day: number): number {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  return (
    day +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045
  );
}

function jdnToEthiopian(jdn: number): EthiopianDate {
  const r = (jdn - JD_OFFSET) % 1461;
  const n = (r % 365) + 365 * Math.floor(r / 1460);
  const year = 4 * Math.floor((jdn - JD_OFFSET) / 1461) + Math.floor(r / 365) - Math.floor(r / 1460);
  const month = Math.floor(n / 30) + 1;
  const day = (n % 30) + 1;
  return { year, month, day };
}

export function toEthiopian(gregorianDate: Date): EthiopianDate {
  const jdn = gregorianToJdn(
    gregorianDate.getFullYear(),
    gregorianDate.getMonth() + 1,
    gregorianDate.getDate()
  );
  return jdnToEthiopian(jdn);
}

export function formatEthiopianDate(eth: EthiopianDate, lang: 'en' | 'am' | 'om' | 'ti' = 'am'): string {
  const monthName = ETHIOPIAN_MONTHS[lang][eth.month - 1] || ETHIOPIAN_MONTHS.en[eth.month - 1];
  return `${monthName} ${eth.day}, ${eth.year}`;
}
