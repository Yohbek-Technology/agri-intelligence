import { BaseModel } from './BaseModel';

export class FarmActivity extends BaseModel {
  static table = 'farm_activities';

  cycleId!: string;
  activity!: 'PLOWING' | 'WEEDING' | 'SPRAYING' | 'IRRIGATION';
  activityDate!: string;
  quantity?: number | null;
  quantityUnit?: string | null;
  pesticideId?: string | null;
  notes?: string | null;
}

