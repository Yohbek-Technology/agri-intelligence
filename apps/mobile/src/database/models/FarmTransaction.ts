import { BaseModel } from './BaseModel';

export class FarmTransaction extends BaseModel {
  static table = 'farm_transactions';

  cycleId!: string;
  category!: 'SEED' | 'FERTILIZER' | 'PESTICIDE' | 'LABOR' | 'MACHINERY' | 'TRANSPORT' | 'CROP_SALE' | 'OTHER';
  isIncome!: boolean;
  amountEtb!: number;
  txnDate!: string;
  description?: string | null;
}

