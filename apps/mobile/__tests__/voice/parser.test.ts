import { describe, it, expect } from 'vitest';
import { parseVoiceTranscript } from '../../src/voice/parser';

describe('Voice Command Parser across Ethiopian Languages', () => {
  describe('English (en)', () => {
    it('parses navigation intents', () => {
      expect(parseVoiceTranscript('go home', 'en').intent).toBe('NAVIGATE_HOME');
      expect(parseVoiceTranscript('my farms', 'en').intent).toBe('NAVIGATE_FARMS');
      expect(parseVoiceTranscript('weather forecast', 'en').intent).toBe('NAVIGATE_WEATHER');
      expect(parseVoiceTranscript('diagnose', 'en').intent).toBe('NAVIGATE_DIAGNOSE');
    });

    it('parses confirmation intents', () => {
      expect(parseVoiceTranscript('yes proceed', 'en').intent).toBe('CONFIRM_YES');
      expect(parseVoiceTranscript('cancel', 'en').intent).toBe('CONFIRM_NO');
    });
  });

  describe('Amharic (am)', () => {
    it('parses Amharic navigation commands', () => {
      expect(parseVoiceTranscript('ዋና ገጽ', 'am').intent).toBe('NAVIGATE_HOME');
      expect(parseVoiceTranscript('ማሳዎቼ', 'am').intent).toBe('NAVIGATE_FARMS');
      expect(parseVoiceTranscript('ተባይ መርምር', 'am').intent).toBe('NAVIGATE_DIAGNOSE');
      expect(parseVoiceTranscript('የአየር ሁኔታ', 'am').intent).toBe('NAVIGATE_WEATHER');
      expect(parseVoiceTranscript('የድምጽ ሳጥን', 'am').intent).toBe('NAVIGATE_VOICE_BOX');
    });

    it('parses Amharic confirmation commands', () => {
      expect(parseVoiceTranscript('አዎ እሺ', 'am').intent).toBe('CONFIRM_YES');
      expect(parseVoiceTranscript('ተወው', 'am').intent).toBe('CONFIRM_NO');
    });
  });

  describe('Afaan Oromoo (om)', () => {
    it('parses Afaan Oromoo navigation commands', () => {
      expect(parseVoiceTranscript('fuula duraa', 'om').intent).toBe('NAVIGATE_HOME');
      expect(parseVoiceTranscript('lafa koo', 'om').intent).toBe('NAVIGATE_FARMS');
      expect(parseVoiceTranscript('haala qilleensaa', 'om').intent).toBe('NAVIGATE_WEATHER');
      expect(parseVoiceTranscript('saanduqa sagalee', 'om').intent).toBe('NAVIGATE_VOICE_BOX');
    });

    it('parses Afaan Oromoo confirmation commands', () => {
      expect(parseVoiceTranscript('eeyyee tole', 'om').intent).toBe('CONFIRM_YES');
      expect(parseVoiceTranscript('lakki', 'om').intent).toBe('CONFIRM_NO');
    });
  });

  describe('Tigrinya (ti)', () => {
    it('parses Tigrinya navigation commands', () => {
      expect(parseVoiceTranscript('ቀንዲ ገጽ', 'ti').intent).toBe('NAVIGATE_HOME');
      expect(parseVoiceTranscript('ሕርሻታተይ', 'ti').intent).toBe('NAVIGATE_FARMS');
      expect(parseVoiceTranscript('ሓሰኻ መርምር', 'ti').intent).toBe('NAVIGATE_DIAGNOSE');
      expect(parseVoiceTranscript('ኩነታት ኣየር', 'ti').intent).toBe('NAVIGATE_WEATHER');
      expect(parseVoiceTranscript('ሳጹን ድምጺ', 'ti').intent).toBe('NAVIGATE_VOICE_BOX');
    });

    it('parses Tigrinya confirmation commands', () => {
      expect(parseVoiceTranscript('እወ', 'ti').intent).toBe('CONFIRM_YES');
      expect(parseVoiceTranscript('ኣይፋል', 'ti').intent).toBe('CONFIRM_NO');
    });
  });

  it('handles unknown or empty transcripts gracefully', () => {
    expect(parseVoiceTranscript('', 'am').intent).toBe('UNKNOWN');
    expect(parseVoiceTranscript('random gibberish sound', 'am').intent).toBe('UNKNOWN');
  });
});

