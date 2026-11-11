import { BaseModel } from './BaseModel';

export class PestDiagnosis extends BaseModel {
  static table = 'pest_diagnoses';

  farmerId!: string;
  plotId?: string | null;
  cycleId?: string | null;
  kebeleId?: string | null;
  imageUrls!: string[];
  pestId?: string | null;
  confidence?: number | null;
  severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  explanationText?: string | null;
  explanationAudioUrl?: string | null;
  needsExpertReview: boolean = false;
  reviewOutcome?: 'CONFIRMED' | 'CORRECTED' | 'REJECTED' | null;
}

