/**
 * Drug Interaction Service Tests — وفاء (Wafa)
 *
 * Tests the drug interaction database and checker logic.
 * Does not require MongoDB — tests the pure logic.
 */

const {
  interactions,
  findInteractionsForDrug,
  findInteractionsBetween,
  checkAllInteractions,
  getSeverityScore
} = require('../../modules/ai/data/drugInteractions');

describe('🤖 Drug Interaction Database', () => {

  describe('Database Content', () => {
    test('should have interactions loaded', () => {
      expect(interactions).toBeDefined();
      expect(interactions.length).toBeGreaterThan(10);
    });

    test('should have all required fields per interaction', () => {
      interactions.forEach((interaction, i) => {
        expect(interaction.drugA).toBeDefined();
        expect(interaction.drugB).toBeDefined();
        expect(interaction.severity).toBeDefined();
        expect(interaction.description).toBeDefined();
        expect(interaction.recommendation).toBeDefined();
      });
    });

    test('should only have valid severity values', () => {
      const validSeverities = ['mild', 'moderate', 'severe', 'contraindicated'];
      interactions.forEach(interaction => {
        expect(validSeverities).toContain(interaction.severity);
      });
    });

    test('should cover common chronic disease medications', () => {
      const drugNames = interactions.map(i => `${i.drugA} ${i.drugB}`).join(' ').toLowerCase();

      // Diabetes
      expect(drugNames).toMatch(/metformin/);
      // Hypertension
      expect(drugNames).toMatch(/lisinopril|amlodipine|atenolol/);
      // Cholesterol
      expect(drugNames).toMatch(/simvastatin|atorvastatin|rosuvastatin/);
      // Blood thinner
      expect(drugNames).toMatch(/warfarin/);
      // Thyroid
      expect(drugNames).toMatch(/levothyroxine/);
    });
  });

  describe('findInteractionsForDrug()', () => {
    test('should find interactions for metformin', () => {
      const results = findInteractionsForDrug('metformin');
      expect(results.length).toBeGreaterThan(2);
      results.forEach(r => {
        expect(r.drugA.includes('metformin') || r.drugB.includes('metformin')).toBe(true);
      });
    });

    test('should find interactions for warfarin', () => {
      const results = findInteractionsForDrug('warfarin');
      expect(results.length).toBeGreaterThan(2);
    });

    test('should return empty array for unknown drug', () => {
      const results = findInteractionsForDrug('unknowndrug12345');
      expect(results).toHaveLength(0);
    });

    test('should be case-insensitive', () => {
      const lower = findInteractionsForDrug('metformin');
      const upper = findInteractionsForDrug('METFORMIN');
      const mixed = findInteractionsForDrug('Metformin');
      expect(lower.length).toBe(upper.length);
      expect(lower.length).toBe(mixed.length);
    });
  });

  describe('findInteractionsBetween()', () => {
    test('should find interactions between metformin and alcohol', () => {
      const results = findInteractionsBetween('metformin', 'alcohol');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].severity).toBe('contraindicated');
    });

    test('should find interactions between warfarin and aspirin', () => {
      const results = findInteractionsBetween('warfarin', 'aspirin');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].severity).toBe('severe');
    });

    test('should return empty for non-interacting drugs', () => {
      const results = findInteractionsBetween('unknowndrug1', 'unknowndrug2');
      expect(results).toHaveLength(0);
    });
  });

  describe('checkAllInteractions()', () => {
    test('should check all combinations in a medication list', () => {
      const drugList = ['metformin', 'alcohol', 'lisinopril', 'potassium'];
      const results = checkAllInteractions(drugList);

      expect(results.length).toBeGreaterThan(0);

      // Should find metformin + alcohol
      const metforminAlcohol = results.find(r =>
        (r.drugAName === 'metformin' && r.drugBName === 'alcohol') ||
        (r.drugAName === 'alcohol' && r.drugBName === 'metformin')
      );
      expect(metforminAlcohol).toBeDefined();
      expect(metforminAlcohol.severity).toBe('contraindicated');

      // Should find lisinopril + potassium
      const lisinoprilPotassium = results.find(r =>
        (r.drugAName === 'lisinopril' && r.drugBName === 'potassium') ||
        (r.drugAName === 'potassium' && r.drugBName === 'lisinopril')
      );
      expect(lisinoprilPotassium).toBeDefined();
    });

    test('should return empty for non-interacting list', () => {
      const drugList = ['unknowndrug1', 'unknowndrug2', 'unknowndrug3'];
      const results = checkAllInteractions(drugList);
      expect(results).toHaveLength(0);
    });

    test('should handle single drug (no interactions possible)', () => {
      const results = checkAllInteractions(['metformin']);
      expect(results).toHaveLength(0);
    });

    test('should handle empty list', () => {
      const results = checkAllInteractions([]);
      expect(results).toHaveLength(0);
    });

    test('should not duplicate interactions', () => {
      const drugList = ['metformin', 'alcohol', 'alcohol'];
      const results = checkAllInteractions(drugList);

      // Should not have duplicate entries for same interaction
      const metforminAlcohol = results.filter(r =>
        (r.drugAName === 'metformin' && r.drugBName === 'alcohol') ||
        (r.drugAName === 'alcohol' && r.drugBName === 'metformin')
      );
      expect(metforminAlcohol.length).toBe(1);
    });
  });

  describe('getSeverityScore()', () => {
    test('should return correct scores for each severity', () => {
      expect(getSeverityScore('mild')).toBe(1);
      expect(getSeverityScore('moderate')).toBe(2);
      expect(getSeverityScore('severe')).toBe(3);
      expect(getSeverityScore('contraindicated')).toBe(4);
    });

    test('should return 0 for unknown severity', () => {
      expect(getSeverityScore('unknown')).toBe(0);
      expect(getSeverityScore('')).toBe(0);
      expect(getSeverityScore(null)).toBe(0);
    });
  });
});

describe('🤖 Drug Interaction Service', () => {

  describe('Service Configuration', () => {
    test('should instantiate without errors', () => {
      const service = require('../../modules/ai/services/drugInteraction.service');
      expect(service).toBeDefined();
      expect(typeof service.checkPatientMedications).toBe('function');
      expect(typeof service.checkNewMedication).toBe('function');
      expect(typeof service.checkSingleDrug).toBe('function');
    });
  });

  describe('checkSingleDrug()', () => {
    test('should return interactions for metformin', () => {
      const service = require('../../modules/ai/services/drugInteraction.service');
      const results = service.checkSingleDrug('metformin');
      expect(results.length).toBeGreaterThan(0);
      results.forEach(r => {
        expect(r).toHaveProperty('severityScore');
      });
    });

    test('should sort by severity (most severe first)', () => {
      const service = require('../../modules/ai/services/drugInteraction.service');
      const results = service.checkSingleDrug('metformin');
      for (let i = 1; i < results.length; i++) {
        expect(results[i].severityScore).toBeLessThanOrEqual(results[i - 1].severityScore);
      }
    });
  });

  describe('_calculateRiskLevel()', () => {
    test('should return CRITICAL for contraindicated', () => {
      const service = require('../../modules/ai/services/drugInteraction.service');
      const result = service._calculateRiskLevel([{ severity: 'contraindicated' }]);
      expect(result).toBe('CRITICAL');
    });

    test('should return HIGH for severe', () => {
      const service = require('../../modules/ai/services/drugInteraction.service');
      const result = service._calculateRiskLevel([{ severity: 'severe' }]);
      expect(result).toBe('HIGH');
    });

    test('should return MEDIUM for moderate', () => {
      const service = require('../../modules/ai/services/drugInteraction.service');
      const result = service._calculateRiskLevel([{ severity: 'moderate' }]);
      expect(result).toBe('MEDIUM');
    });

    test('should return NONE for empty interactions', () => {
      const service = require('../../modules/ai/services/drugInteraction.service');
      const result = service._calculateRiskLevel([]);
      expect(result).toBe('NONE');
    });
  });

  describe('_generateRecommendations()', () => {
    test('should generate CRITICAL recommendation for contraindicated', () => {
      const service = require('../../modules/ai/services/drugInteraction.service');
      const summary = { contraindicatedCount: 1, severeCount: 0, moderateCount: 0, mildCount: 0, totalInteractions: 1 };
      const recs = service._generateRecommendations([], summary);
      expect(recs.some(r => r.priority === 'CRITICAL')).toBe(true);
    });

    test('should generate positive recommendation for no interactions', () => {
      const service = require('../../modules/ai/services/drugInteraction.service');
      const summary = { contraindicatedCount: 0, severeCount: 0, moderateCount: 0, mildCount: 0, totalInteractions: 0 };
      const recs = service._generateRecommendations([], summary);
      expect(recs.some(r => r.priority === 'INFO' && r.title.includes('تمام'))).toBe(true);
    });
  });
});
