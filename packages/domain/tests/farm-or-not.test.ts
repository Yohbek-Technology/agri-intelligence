import { describe, it, expect } from 'vitest';
import { evaluateFarmOrNot } from '../src/farm-or-not.js';

describe('evaluateFarmOrNot', () => {
  it('allows plowing, spraying, and harvesting in ideal dry conditions', () => {
    const decision = evaluateFarmOrNot({
      temperatureC: 22,
      windSpeedKmh: 8,
      precipitationMm: 0,
      rainProbabilityPct: 10,
      forecastHoursUntilRain: 24,
      soilMoistureStatus: 'OPTIMAL',
    });

    expect(decision.plowing.code).toBe('GO');
    expect(decision.spraying.code).toBe('GO');
    expect(decision.harvesting.code).toBe('GO');
  });

  it('advises WAIT for plowing under heavy downpour or waterlogging', () => {
    const downpour = evaluateFarmOrNot({
      temperatureC: 18,
      windSpeedKmh: 5,
      precipitationMm: 45, // Exceeds 35mm threshold
      rainProbabilityPct: 80,
    });
    expect(downpour.plowing.code).toBe('WAIT');

    const waterlogged = evaluateFarmOrNot({
      temperatureC: 20,
      windSpeedKmh: 5,
      precipitationMm: 2,
      rainProbabilityPct: 10,
      soilMoistureStatus: 'WATERLOGGED',
    });
    expect(waterlogged.plowing.code).toBe('WAIT');
  });

  it('advises WAIT for spraying if wind exceeds threshold or imminent rain', () => {
    const windy = evaluateFarmOrNot({
      temperatureC: 24,
      windSpeedKmh: 20, // Exceeds 15 km/h
      precipitationMm: 0,
      rainProbabilityPct: 5,
    });
    expect(windy.spraying.code).toBe('WAIT');
    expect(windy.spraying.defaultReason).toContain('Wind speed (20 km/h) exceeds safe threshold');

    const imminentRain = evaluateFarmOrNot({
      temperatureC: 20,
      windSpeedKmh: 6,
      precipitationMm: 0,
      rainProbabilityPct: 30,
      forecastHoursUntilRain: 3, // Needs 6 hours
    });
    expect(imminentRain.spraying.code).toBe('WAIT');
  });

  it('advises WAIT for harvesting if rain probability is high', () => {
    const rainy = evaluateFarmOrNot({
      temperatureC: 19,
      windSpeedKmh: 8,
      precipitationMm: 2,
      rainProbabilityPct: 65, // Exceeds 20%
    });
    expect(rainy.harvesting.code).toBe('WAIT');
  });
});

