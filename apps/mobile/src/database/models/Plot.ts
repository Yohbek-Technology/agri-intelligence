import { BaseModel } from './BaseModel';

export class Plot extends BaseModel {
  static table = 'plots';

  farmerId!: string;
  cityId!: string;
  kebeleId!: string;
  plotName!: string;
  landmark?: string | null;
  areaValue!: number;
  areaUnit!: 'TIMAD' | 'KERT' | 'HECTARE' | 'SQM';
  areaHectares!: number;
  latitude?: number | null;
  longitude?: number | null;
  altitudeM?: number | null;
  zone!: 'BEREHA' | 'KOLLA' | 'WEYNA_DEGA' | 'DEGA' | 'WURCH';
  soil!: 'KOTICHA_VERTISOL' | 'BEDA_NITISOL' | 'SANDY' | 'CLAY' | 'LOAM';
  drainage?: 'POOR' | 'MODERATE' | 'GOOD' | 'EXCESSIVE';
  rotationPlan?: string | null;

  constructor(attributes?: Partial<Plot>) {
    super();
    if (attributes) {
      Object.assign(this, attributes);
    }
  }
}
