import { BaseModel } from './BaseModel';

export class CropCycle extends BaseModel {
  static table = 'crop_cycles';

  plotId!: string;
  seasonYear!: number;
  season!: 'MEHER' | 'BELG';
  cropId!: string;
  varietyId?: string | null;
  currentStage: 'LAND_PREPARATION' | 'PLANTING' | 'GROWING' | 'FLOWERING' | 'GRAIN_FILLING' | 'HARVEST' = 'LAND_PREPARATION';
  status: 'ACTIVE' | 'HARVESTED' | 'FAILED' | 'ABANDONED' = 'ACTIVE';
  plantingDate?: string | null;
  seedType?: string | null;
  seedSource?: 'COOPERATIVE' | 'MARKET' | 'SAVED' | 'OTHER';
  seedAmountKg?: number | null;
  harvestDate?: string | null;
  harvestValue?: number | null;
  harvestUnit?: 'KG' | 'QUINTAL';
  yieldQtHa?: number | null;
  grainMoisturePct?: number | null;
  notes?: string | null;
}

