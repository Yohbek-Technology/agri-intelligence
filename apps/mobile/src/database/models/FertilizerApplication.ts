import { BaseModel } from './BaseModel';

export class FertilizerApplication extends BaseModel {
  static table = 'fertilizer_applications';

  cycleId!: string;
  fertilizer!: 'UREA' | 'NPS' | 'DAP' | 'COMPOST';
  stage!: 'BASAL' | 'UREA_FIRST' | 'UREA_SECOND' | 'OTHER';
  amountKg!: number;
  applicationDate!: string;
  notes?: string | null;
}

