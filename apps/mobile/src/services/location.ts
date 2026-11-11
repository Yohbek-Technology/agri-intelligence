/**
 * Location Service with GPS Accuracy Bounds
 * Captures geographic coordinates and auto-classifies Ethiopian agro-ecological zones.
 * Pure business classification is delegated to @repo/domain.
 */
import * as Location from 'expo-location';
import { classifyAgroZone, type AgroZone } from '@repo/domain';

export interface LocationResult {
  latitude: number;
  longitude: number;
  altitudeM?: number;
  accuracy: number;
  zone: AgroZone;
  isAccurate: boolean; // meets <= 15m threshold
}

const GPS_ACCURACY_THRESHOLD_M = 15; // 15 meters maximum tolerance

export const locationService = {
  async getCurrentPosition(): Promise<LocationResult> {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Location permission was denied');
    }

    const pos = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    const altitude = pos.coords.altitude ?? 1800; // default to Weyna Dega altitude if altitude sensor unavailable
    const accuracy = pos.coords.accuracy ?? 10;
    const isAccurate = accuracy <= GPS_ACCURACY_THRESHOLD_M;

    return {
      latitude: pos.coords.latitude,
      longitude: pos.coords.longitude,
      altitudeM: altitude,
      accuracy,
      zone: classifyAgroZone(altitude),
      isAccurate,
    };
  },

  async getZoneForAltitude(altitudeM: number): Promise<AgroZone> {
    return classifyAgroZone(altitudeM);
  },
};
