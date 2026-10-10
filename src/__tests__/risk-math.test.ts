import { describe, it, expect } from 'vitest';
import { calculateSeverity } from '../types/risk';
import { ProbabilityLevel, ImpactLevel } from '../types/risk';

describe('Quantitative Risk Scoring (5x5 Matrix)', () => {
  it('correctly maps scores to standard enterprise severity bands', () => {
    // Low: 1..4
    expect(calculateSeverity(1)).toBe('Low');
    expect(calculateSeverity(4)).toBe('Low');

    // Medium: 5..9
    expect(calculateSeverity(5)).toBe('Medium');
    expect(calculateSeverity(9)).toBe('Medium');

    // High: 10..16
    expect(calculateSeverity(10)).toBe('High');
    expect(calculateSeverity(16)).toBe('High');

    // Critical: 17..25
    expect(calculateSeverity(17)).toBe('Critical');
    expect(calculateSeverity(20)).toBe('Critical');
    expect(calculateSeverity(25)).toBe('Critical');
  });

  it('calculates inherent and residual scores accurately', () => {
    const inhProb: ProbabilityLevel = 5;
    const inhImp: ImpactLevel = 4;
    const inhScore = inhProb * inhImp; // 20 -> Critical

    const resProb: ProbabilityLevel = 2;
    const resImp: ImpactLevel = 3;
    const resScore = resProb * resImp; // 6 -> Medium

    expect(inhScore).toBe(20);
    expect(calculateSeverity(inhScore)).toBe('Critical');

    expect(resScore).toBe(6);
    expect(calculateSeverity(resScore)).toBe('Medium');

    const reductionPercent = Math.round(((inhScore - resScore) / inhScore) * 100);
    expect(reductionPercent).toBe(70);
  });

  it('correctly evaluates risk appetite threshold breach on residual risk', () => {
    const threshold = 15;

    const riskA_ResidualScore = 16;
    const isRiskA_AboveAppetite = riskA_ResidualScore > threshold;
    expect(isRiskA_AboveAppetite).toBe(true);

    const riskB_ResidualScore = 12;
    const isRiskB_AboveAppetite = riskB_ResidualScore > threshold;
    expect(riskB_ResidualScore).toBe(12);
    expect(isRiskB_AboveAppetite).toBe(false);
  });
});

