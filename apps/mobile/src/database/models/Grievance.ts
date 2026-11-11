import { BaseModel } from './BaseModel';

export class Grievance extends BaseModel {
  static table = 'grievances';

  farmerId!: string;
  cityId!: string;
  kebeleId?: string | null;
  category!: 'FERTILIZER_SHORTAGE' | 'SEED_QUALITY' | 'PEST_OUTBREAK' | 'CORRUPTION' | 'INFRASTRUCTURE' | 'OTHER';
  descriptionText?: string | null;
  audioUrl?: string | null;
  audioLanguage?: 'am' | 'om' | 'ti' | 'en' | null;
  status: 'SUBMITTED' | 'TRIAGED' | 'ASSIGNED' | 'RESOLVED' | 'REJECTED' = 'SUBMITTED';
  assignedTo?: string | null;
}

