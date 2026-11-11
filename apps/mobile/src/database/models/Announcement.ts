import { BaseModel } from './BaseModel';

export class Announcement extends BaseModel {
  static table = 'announcements';

  cityId!: string;
  type!: 'SEASONAL_ADVICE' | 'INPUT_AVAILABILITY' | 'EMERGENCY' | 'QUARANTINE' | 'WEATHER_ALERT' | 'WEEKLY_WEATHER';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
  language: 'am' | 'om' | 'ti' | 'en' = 'am';
  title!: string;
  body!: string;
  audioUrl?: string | null;
  publishedAt?: string | null;
  expiresAt?: string | null;
}

