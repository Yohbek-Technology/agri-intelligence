import { API_ENDPOINTS } from '@/config/env';
import { apiRequest, type ServiceResult } from './client';
import type { SupportedLanguage } from '@/config/constants';

export interface FarmerProfile {
  id: string;
  cityOfficeId: string;
  userId?: string;
  fullName: string;
  phoneNumber?: string;
  hasNoPhone?: boolean;
  localIdNumber: string;
  kebeleId: string;
  kebeleName?: string;
  district?: string;
  preferredLanguage: SupportedLanguage;
  isVerified: boolean;
  consentAgreed: boolean;
  calendarSystem?: 'ethiopian' | 'gregorian';
  areaUnit?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SetupFarmerProfileInput {
  fullName: string;
  localIdNumber: string;
  district: string;
  kebeleId: string;
  preferredLanguage: SupportedLanguage;
  consentAgreed: boolean;
  calendarSystem?: 'ethiopian' | 'gregorian';
  areaUnit?: string;
}

export interface ClaimFarmerProfileInput {
  localIdNumber: string;
  kebeleId?: string;
  district?: string;
  phoneNumber?: string;
}

export const farmerService = {
  /**
   * Get the active logged in farmer's profile
   */
  async getMyProfile(): Promise<ServiceResult<FarmerProfile>> {
    return await apiRequest<FarmerProfile>(API_ENDPOINTS.farmers.me, {
      method: 'GET',
    });
  },

  /**
   * Complete Farmer Profile Setup
   */
  async saveProfile(input: SetupFarmerProfileInput): Promise<ServiceResult<FarmerProfile>> {
    return await apiRequest<FarmerProfile>(API_ENDPOINTS.farmers.me, {
      method: 'PUT',
      body: JSON.stringify(input),
    });
  },

  /**
   * Claim Profile Pre-registered by Extension DA in Field
   */
  async claimProfile(input: ClaimFarmerProfileInput): Promise<ServiceResult<FarmerProfile>> {
    return await apiRequest<FarmerProfile>(API_ENDPOINTS.farmers.claim, {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },
};
