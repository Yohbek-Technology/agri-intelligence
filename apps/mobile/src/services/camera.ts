/**
 * Camera Service for Guided Crop Leaf Capture
 * // FR-MOB-004: Guided camera capture with alignment boundary and sharpness detection
 */

export interface LeafCaptureGuide {
  isAligned: boolean;
  lightingCondition: 'GOOD' | 'TOO_DARK' | 'TOO_BRIGHT';
  promptMessage: string;
}

export class CameraService {
  /**
   * Evaluates if the current leaf subject is properly centered in the viewfinder.
   */
  evaluateLeafFraming(boundingBoxRatio: number, ambientLux?: number): LeafCaptureGuide {
    if (ambientLux !== undefined && ambientLux < 50) {
      return {
        isAligned: false,
        lightingCondition: 'TOO_DARK',
        promptMessage: 'Move to brighter sunlight or turn on flashlight.',
      };
    }

    if (boundingBoxRatio < 0.3) {
      return {
        isAligned: false,
        lightingCondition: 'GOOD',
        promptMessage: 'Move closer to the damaged leaf to fill the circle.',
      };
    }

    if (boundingBoxRatio > 0.9) {
      return {
        isAligned: false,
        lightingCondition: 'GOOD',
        promptMessage: 'Move back slightly to show the entire leaf edges.',
      };
    }

    return {
      isAligned: true,
      lightingCondition: 'GOOD',
      promptMessage: 'Hold steady. Tap capture button.',
    };
  }
}

export const cameraService = new CameraService();

