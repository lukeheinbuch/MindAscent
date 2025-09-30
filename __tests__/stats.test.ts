import { StatsService } from '../src/services/stats';

describe('StatsService Core Math Functions', () => {
  describe('calculateCV', () => {
    it('should return 0 for empty array', () => {
      expect(StatsService.calculateCV([])).toBe(0);
    });

    it('should return 0 for array with mean of 0', () => {
      expect(StatsService.calculateCV([0, 0, 0])).toBe(0);
    });

    it('should calculate coefficient of variation correctly', () => {
      // For values [1, 2, 3], mean = 2, std = ~0.816, CV = 0.408
      const result = StatsService.calculateCV([1, 2, 3]);
      expect(result).toBeCloseTo(0.408, 2);
    });

    it('should handle single value (CV = 0)', () => {
      expect(StatsService.calculateCV([5])).toBe(0);
    });

    it('should handle identical values (CV = 0)', () => {
      expect(StatsService.calculateCV([4, 4, 4, 4])).toBe(0);
    });
  });

  describe('calculateCorrelation', () => {
    it('should return 0 for empty arrays', () => {
      expect(StatsService.calculateCorrelation([], [])).toBe(0);
    });

    it('should return 0 for arrays of different lengths', () => {
      expect(StatsService.calculateCorrelation([1, 2], [1, 2, 3])).toBe(0);
    });

    it('should return 1 for perfect positive correlation', () => {
      const result = StatsService.calculateCorrelation([1, 2, 3, 4], [2, 4, 6, 8]);
      expect(result).toBeCloseTo(1, 5);
    });

    it('should return -1 for perfect negative correlation', () => {
      const result = StatsService.calculateCorrelation([1, 2, 3, 4], [4, 3, 2, 1]);
      expect(result).toBeCloseTo(-1, 5);
    });

    it('should return low correlation for unrelated data', () => {
      const result = StatsService.calculateCorrelation([1, 2, 3, 4], [1, 4, 2, 3]);
      expect(Math.abs(result)).toBeLessThan(0.5); // Relaxed threshold for unrelated data
    });

    it('should handle identical values (correlation undefined -> 0)', () => {
      expect(StatsService.calculateCorrelation([5, 5, 5], [3, 3, 3])).toBe(0);
    });
  });

  describe('calculateSlope', () => {
    it('should return 0 for arrays with less than 2 elements', () => {
      expect(StatsService.calculateSlope([])).toBe(0);
      expect(StatsService.calculateSlope([5])).toBe(0);
    });

    it('should calculate positive slope correctly', () => {
      // y = x + 1: points (0,1), (1,2), (2,3), (3,4)
      const result = StatsService.calculateSlope([1, 2, 3, 4]);
      expect(result).toBeCloseTo(1, 5);
    });

    it('should calculate negative slope correctly', () => {
      // y = -2x + 10: points (0,10), (1,8), (2,6), (3,4)
      const result = StatsService.calculateSlope([10, 8, 6, 4]);
      expect(result).toBeCloseTo(-2, 5);
    });

    it('should return 0 for horizontal line', () => {
      const result = StatsService.calculateSlope([5, 5, 5, 5]);
      expect(result).toBeCloseTo(0, 5);
    });

    it('should handle floating point values', () => {
      const result = StatsService.calculateSlope([1.5, 2.7, 3.9, 5.1]);
      expect(result).toBeCloseTo(1.2, 1);
    });
  });

  describe('average', () => {
    it('should return 0 for empty array', () => {
      expect(StatsService.average([])).toBe(0);
    });

    it('should calculate average correctly', () => {
      expect(StatsService.average([1, 2, 3, 4, 5])).toBe(3);
      expect(StatsService.average([10, 20, 30])).toBe(20);
    });

    it('should handle negative numbers', () => {
      expect(StatsService.average([-1, 0, 1])).toBe(0);
      expect(StatsService.average([-5, -10, -15])).toBe(-10);
    });

    it('should handle floating point numbers', () => {
      const result = StatsService.average([1.1, 2.2, 3.3]);
      expect(result).toBeCloseTo(2.2, 1);
    });

    it('should handle single value', () => {
      expect(StatsService.average([42])).toBe(42);
    });
  });

  describe('Edge Cases and Real-World Scenarios', () => {
    it('should handle wellness scores (0-10 range)', () => {
      const moodScores = [7, 8, 6, 9, 7, 8, 7];
      const stressScores = [3, 2, 4, 1, 3, 2, 3];
      
      const moodAvg = StatsService.average(moodScores);
      const stressAvg = StatsService.average(stressScores);
      const correlation = StatsService.calculateCorrelation(moodScores, stressScores);
      const moodTrend = StatsService.calculateSlope(moodScores);
      
      expect(moodAvg).toBeCloseTo(7.43, 1);
      expect(stressAvg).toBeCloseTo(2.57, 1);
      expect(correlation).toBeCloseTo(-1, 0); // Strong negative correlation
      expect(Math.abs(moodTrend)).toBeLessThan(0.5); // Relatively stable
    });

    it('should handle high variability data', () => {
      const variableData = [1, 10, 2, 9, 3, 8, 4];
      const cv = StatsService.calculateCV(variableData);
      
      expect(cv).toBeGreaterThan(0.5); // High variability
    });

    it('should handle consistent data', () => {
      const consistentData = [7, 7.1, 6.9, 7.2, 6.8, 7, 7.1];
      const cv = StatsService.calculateCV(consistentData);
      
      expect(cv).toBeLessThan(0.1); // Low variability
    });
  });
});
