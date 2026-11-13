import { BaseModel } from './BaseModel';

export class Farmer extends BaseModel {
  static table = 'farmers';

  userId?: string | null;
  cityId!: string;
  kebeleId!: string;
  localIdNumber!: string;
  fullName!: string;
  phoneNumber?: string | null;
  gender?: 'M' | 'F';
  literacyLevel?: 'NONE' | 'BASIC' | 'FULL';
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED' = 'APPROVED';

  constructor(attributes?: Partial<Farmer>) {
    super();
    if (attributes) {
      Object.assign(this, attributes);
    }
  }
}
