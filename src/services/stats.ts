import { CheckIn, CheckInStats } from '@/types/checkin';
import { CheckInService } from './checkins';

export class StatsService {
  /**
   * Calculate coefficient of variation (CV) for consistency scoring
   */
  static calculateCV(values: number[]): number {
    if (values.length === 0) return 0;
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    if (mean === 0) return 0;
    const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    return stdDev / mean;
  }

  /**
   * Calculate Pearson correlation coefficient
   */
  static calculateCorrelation(x: number[], y: number[]): number {
    if (x.length !== y.length || x.length === 0) return 0;
    
    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sumYY = y.reduce((sum, yi) => sum + yi * yi, 0);
    
    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));
    
    return denominator === 0 ? 0 : numerator / denominator;
  }

  /**
   * Calculate linear regression slope
   */
  static calculateSlope(values: number[]): number {
    if (values.length < 2) return 0;
    
    const n = values.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = values.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * values[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    return isNaN(slope) ? 0 : slope;
  }

  /**
   * Get average of array
   */
  static average(values: number[]): number {
    return values.length === 0 ? 0 : values.reduce((a, b) => a + b, 0) / values.length;
  }

  /**
   * Calculate comprehensive statistics for a user
   */
  static async calculateStats(userId: string, days: number = 30): Promise<CheckInStats> {
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const checkIns = await CheckInService.getCheckInsByDateRange(userId, startDate, endDate);
    
    if (checkIns.length === 0) {
      return this.getEmptyStats();
    }

    // Calculate averages
    const averages = {
      mood: this.average(checkIns.map(c => c.mood)),
      stress_management: this.average(checkIns.map(c => c.stress_management)),
      energy: this.average(checkIns.map(c => c.energy)),
      motivation: this.average(checkIns.map(c => c.motivation)),
      sleep: this.average(checkIns.map(c => c.sleep)),
  soreness: this.average(checkIns.map(c => (c.soreness ?? 0))),
      focus: this.average(checkIns.map(c => c.focus))
    };

    // Calculate deltas vs previous period
    const previousPeriodStart = new Date(Date.now() - (days * 2) * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const previousCheckIns = await CheckInService.getCheckInsByDateRange(userId, previousPeriodStart, startDate);
    
    const previousAverages = previousCheckIns.length > 0 ? {
      mood: this.average(previousCheckIns.map(c => c.mood)),
      stress_management: this.average(previousCheckIns.map(c => c.stress_management)),
      energy: this.average(previousCheckIns.map(c => c.energy)),
      motivation: this.average(previousCheckIns.map(c => c.motivation)),
      sleep: this.average(previousCheckIns.map(c => c.sleep)),
  soreness: this.average(previousCheckIns.map(c => (c.soreness ?? 0))),
      focus: this.average(previousCheckIns.map(c => c.focus))
    } : averages;

    const deltas = {
      mood: averages.mood - previousAverages.mood,
      stress_management: averages.stress_management - previousAverages.stress_management,
      energy: averages.energy - previousAverages.energy,
      motivation: averages.motivation - previousAverages.motivation,
      sleep: averages.sleep - previousAverages.sleep,
      soreness: averages.soreness - previousAverages.soreness,
      focus: averages.focus - previousAverages.focus
    };

    // Calculate variability (CV)
    const variability = {
      mood: this.calculateCV(checkIns.map(c => c.mood)),
      stress_management: this.calculateCV(checkIns.map(c => c.stress_management)),
      energy: this.calculateCV(checkIns.map(c => c.energy)),
      motivation: this.calculateCV(checkIns.map(c => c.motivation)),
      sleep: this.calculateCV(checkIns.map(c => c.sleep)),
  soreness: this.calculateCV(checkIns.map(c => (c.soreness ?? 0))),
      focus: this.calculateCV(checkIns.map(c => c.focus))
    };

    // Sleep-stress management correlation
    const sleepValues = checkIns.map(c => c.sleep);
    const stressManagementValues = checkIns.map(c => c.stress_management);
    const sleepStressManagementCorrelation = this.calculateCorrelation(sleepValues, stressManagementValues);

    // Training load impact (next-day effects)
    const trainingImpact = this.calculateTrainingImpact(checkIns);

    // Soreness recovery curve
    const sorenessRecovery = this.calculateSorenessRecovery(checkIns);

    // Pre-competition effects
    const preCompetitionEffect = this.calculatePreCompetitionEffect(checkIns);

    // 7-day trends
    const last7Days = checkIns.slice(0, 7).reverse(); // Most recent 7 days
    const stressManagementTrend = this.calculateSlope(last7Days.map(c => c.stress_management));
    const motivationTrend = this.calculateSlope(last7Days.map(c => c.motivation));

    // Consistency score (1-100, lower CV = higher consistency)
    const avgCV = Object.values(variability).reduce((a, b) => a + b, 0) / Object.values(variability).length;
    const consistencyScore = Math.max(1, Math.min(100, Math.round(100 - (avgCV * 100))));

    return {
      averages,
      deltas,
      variability,
      correlations: { sleepStressManagement: sleepStressManagementCorrelation },
      trainingImpact,
      sorenessRecovery,
      preCompetitionEffect,
      trends: { stress_management: stressManagementTrend, motivation: motivationTrend },
      consistencyScore
    };
  }

  private static calculateTrainingImpact(checkIns: CheckIn[]) {
    const impact = {
      none: { energy: 0, motivation: 0, count: 0 },
      light: { energy: 0, motivation: 0, count: 0 },
      moderate: { energy: 0, motivation: 0, count: 0 },
      hard: { energy: 0, motivation: 0, count: 0 }
    };

    // Look at next-day effects
    for (let i = 0; i < checkIns.length - 1; i++) {
      const current = checkIns[i];
      const nextDay = checkIns[i + 1];
      
      // Check if they're consecutive days
      const currentDate = new Date(current.date);
      const nextDate = new Date(nextDay.date);
      const dayDiff = (currentDate.getTime() - nextDate.getTime()) / (1000 * 60 * 60 * 24);
      
      if (Math.abs(dayDiff - 1) < 0.1) { // Allow small floating point errors
        impact[current.trainingLoad].energy += nextDay.energy;
        impact[current.trainingLoad].motivation += nextDay.motivation;
        impact[current.trainingLoad].count++;
      }
    }

    // Calculate averages
    return {
      none: {
        energy: impact.none.count > 0 ? impact.none.energy / impact.none.count : 0,
        motivation: impact.none.count > 0 ? impact.none.motivation / impact.none.count : 0
      },
      light: {
        energy: impact.light.count > 0 ? impact.light.energy / impact.light.count : 0,
        motivation: impact.light.count > 0 ? impact.light.motivation / impact.light.count : 0
      },
      moderate: {
        energy: impact.moderate.count > 0 ? impact.moderate.energy / impact.moderate.count : 0,
        motivation: impact.moderate.count > 0 ? impact.moderate.motivation / impact.moderate.count : 0
      },
      hard: {
        energy: impact.hard.count > 0 ? impact.hard.energy / impact.hard.count : 0,
        motivation: impact.hard.count > 0 ? impact.hard.motivation / impact.hard.count : 0
      }
    };
  }

  private static calculateSorenessRecovery(checkIns: CheckIn[]) {
    const recovery = { day0: [], day1: [], day2: [], day3: [] } as { [key: string]: number[] };
    
    // Find hard training days and track soreness recovery
    const hardDays = checkIns.filter(c => c.trainingLoad === 'hard');
    
    hardDays.forEach(hardDay => {
      const hardDate = new Date(hardDay.date);
      
      for (let dayOffset = 0; dayOffset <= 3; dayOffset++) {
        const recoveryDate = new Date(hardDate.getTime() + dayOffset * 24 * 60 * 60 * 1000);
        const recoveryDateStr = recoveryDate.toISOString().split('T')[0];
        
        const recoveryCheckIn = checkIns.find(c => c.date === recoveryDateStr);
        if (recoveryCheckIn) {
          recovery[`day${dayOffset}`].push(recoveryCheckIn.soreness ?? 0);
        }
      }
    });

    return {
      day0: this.average(recovery.day0),
      day1: this.average(recovery.day1),
      day2: this.average(recovery.day2),
      day3: this.average(recovery.day3)
    };
  }

  private static calculatePreCompetitionEffect(checkIns: CheckIn[]) {
    const preCompDays = checkIns.filter(c => c.preCompetition);
    const normalDays = checkIns.filter(c => !c.preCompetition);

    return {
      focus: {
        preComp: this.average(preCompDays.map(c => c.focus)),
        normal: this.average(normalDays.map(c => c.focus))
      },
      stress_management: {
        preComp: this.average(preCompDays.map(c => c.stress_management)),
        normal: this.average(normalDays.map(c => c.stress_management))
      }
    };
  }

  private static getEmptyStats(): CheckInStats {
    return {
      averages: { mood: 0, stress_management: 0, energy: 0, motivation: 0, sleep: 0, soreness: 0, focus: 0 },
      deltas: { mood: 0, stress_management: 0, energy: 0, motivation: 0, sleep: 0, soreness: 0, focus: 0 },
      variability: { mood: 0, stress_management: 0, energy: 0, motivation: 0, sleep: 0, soreness: 0, focus: 0 },
      correlations: { sleepStressManagement: 0 },
      trainingImpact: {
        none: { energy: 0, motivation: 0 },
        light: { energy: 0, motivation: 0 },
        moderate: { energy: 0, motivation: 0 },
        hard: { energy: 0, motivation: 0 }
      },
      sorenessRecovery: { day0: 0, day1: 0, day2: 0, day3: 0 },
      preCompetitionEffect: {
        focus: { preComp: 0, normal: 0 },
        stress_management: { preComp: 0, normal: 0 }
      },
      trends: { stress_management: 0, motivation: 0 },
      consistencyScore: 0
    };
  }
}
