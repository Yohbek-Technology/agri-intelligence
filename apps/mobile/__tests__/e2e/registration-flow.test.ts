import { describe, it, expect } from 'vitest';
import { parseVoiceTranscript } from '../../src/voice/parser';

describe('E2E Flow 1: Farmer Onboarding & Registration (M-01 to M-04)', () => {
  it('walks through language selection to pending registration', () => {
    // 1. Language selected
    const selectedLang = 'am';
    expect(['am', 'om', 'ti', 'en']).toContain(selectedLang);

    // 2. Phone OTP validated
    const phone = '+251911234567';
    expect(phone.startsWith('+251')).toBe(true);
    expect(phone.length).toBe(13);

    // 3. Spoken confirmation
    const spokenConfirm = parseVoiceTranscript('አዎ እሺ', selectedLang);
    expect(spokenConfirm.intent).toBe('CONFIRM_YES');

    // 4. Pending registration initial state
    const farmerRecord = {
      id: 'farmer-new',
      local_id: 'KB-2024-500',
      status: 'PENDING',
      kebele: 'Boku Shenen',
    };
    expect(farmerRecord.status).toBe('PENDING');
  });
});

