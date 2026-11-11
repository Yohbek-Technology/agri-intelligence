import { BaseModel } from './BaseModel';

export class GrievanceResponse extends BaseModel {
  static table = 'grievance_responses';

  grievanceId!: string;
  responderId!: string;
  newStatus?: 'SUBMITTED' | 'TRIAGED' | 'ASSIGNED' | 'RESOLVED' | 'REJECTED' | null;
  messageText?: string | null;
  audioUrl?: string | null;
}

