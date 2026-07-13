const Medication = require('../../medications/models/Medication.model');
const Patient = require('../../auth/models/Patient.model');
const { checkAllInteractions, findInteractionsForDrug, getSeverityScore } = require('../data/drugInteractions');
const { logger } = require('../../../sheared/utils/logger');

/**
 * Drug Interaction Service — وفاء (Wafa)
 *
 * Checks for drug-drug interactions in a patient's medication list.
 * Also checks food/drug interactions and provides recommendations.
 */
class DrugInteractionService {

  /**
   * Check all interactions for a patient's active medications
   * @param {String} patientId - Patient ID
   * @returns {Object} { interactions, summary, recommendations }
   */
  async checkPatientMedications(patientId) {
    const medications = await Medication.find({
      patientId,
      isActive: true
    }).select('name nameAr formType isChronic schedule.timesOfDay');

    if (medications.length === 0) {
      return {
        interactions: [],
        summary: {
          totalMedications: 0,
          totalInteractions: 0,
          severeCount: 0,
          moderateCount: 0,
          mildCount: 0,
          contraindicatedCount: 0,
          riskLevel: 'NONE'
        },
        recommendations: []
      };
    }

    const drugNames = medications.map(m => m.name);
    const interactions = checkAllInteractions(drugNames);

    // Enrich with medication details
    const enrichedInteractions = interactions.map(interaction => ({
      ...interaction,
      drugADetails: medications.find(m => m.name === interaction.drugAName),
      drugBDetails: medications.find(m => m.name === interaction.drugBName)
    }));

    // Sort by severity (most severe first)
    enrichedInteractions.sort((a, b) => getSeverityScore(b.severity) - getSeverityScore(a.severity));

    // Calculate summary
    const summary = {
      totalMedications: medications.length,
      totalInteractions: interactions.length,
      severeCount: interactions.filter(i => i.severity === 'severe').length,
      moderateCount: interactions.filter(i => i.severity === 'moderate').length,
      mildCount: interactions.filter(i => i.severity === 'mild').length,
      contraindicatedCount: interactions.filter(i => i.severity === 'contraindicated').length,
      riskLevel: this._calculateRiskLevel(interactions)
    };

    // Generate recommendations
    const recommendations = this._generateRecommendations(enrichedInteractions, summary);

    return {
      interactions: enrichedInteractions,
      summary,
      recommendations
    };
  }

  /**
   * Check interactions when adding a new medication (before saving)
   * @param {String} patientId - Patient ID
   * @param {String} newDrugName - New medication name
   * @returns {Object} { hasInteractions, interactions, warning }
   */
  async checkNewMedication(patientId, newDrugName) {
    const existingMeds = await Medication.find({
      patientId,
      isActive: true
    }).select('name nameAr');

    const existingNames = existingMeds.map(m => m.name);
    const allNames = [...existingNames, newDrugName];

    const interactions = checkAllInteractions(allNames);

    // Filter to only interactions involving the new drug
    const newDrugInteractions = interactions.filter(i =>
      i.drugAName === newDrugName || i.drugBName === newDrugName
    );

    const hasSevere = newDrugInteractions.some(i =>
      i.severity === 'severe' || i.severity === 'contraindicated'
    );

    let warning = null;
    if (newDrugInteractions.length > 0) {
      if (hasSevere) {
        warning = `⚠️ تحذير: ${newDrugName} فيه تفاعل خطير مع ${newDrugInteractions.length} من أدويتك الحالية. برجاء استشارة الطبيب قبل الإضافة.`;
      } else {
        warning = `ℹ️ ${newDrugName} فيه تفاعل ${newDrugInteractions[0].severity} مع ${newDrugInteractions.length} من أدويتك. خد بالك من التوصيات.`;
      }
    }

    return {
      hasInteractions: newDrugInteractions.length > 0,
      interactions: newDrugInteractions,
      warning,
      hasSevere
    };
  }

  /**
   * Check a specific medication against all known interactions
   * @param {String} drugName - Drug name
   * @returns {Array} All known interactions for this drug
   */
  checkSingleDrug(drugName) {
    const interactions = findInteractionsForDrug(drugName);
    return interactions.map(i => ({
      ...i,
      severityScore: getSeverityScore(i.severity)
    })).sort((a, b) => b.severityScore - a.severityScore);
  }

  /**
   * Calculate overall risk level based on interactions
   */
  _calculateRiskLevel(interactions) {
    if (interactions.length === 0) return 'NONE';

    const hasContraindicated = interactions.some(i => i.severity === 'contraindicated');
    const hasSevere = interactions.some(i => i.severity === 'severe');
    const hasModerate = interactions.some(i => i.severity === 'moderate');

    if (hasContraindicated) return 'CRITICAL';
    if (hasSevere) return 'HIGH';
    if (hasModerate) return 'MEDIUM';
    return 'LOW';
  }

  /**
   * Generate actionable recommendations based on interactions
   */
  _generateRecommendations(interactions, summary) {
    const recommendations = [];

    // Contraindicated
    if (summary.contraindicatedCount > 0) {
      recommendations.push({
        priority: 'CRITICAL',
        title: '🚨 تفاعلات ممنوعة (contraindicated)',
        description: `فيه ${summary.contraindicatedCount} تفاعل ممنوع بين أدويتك. ده يعني إنه لازم توقف واحد من الأدوية أو تستبدله فوراً.`,
        action: 'كلم دكتورك فوراً قبل ما تكمل أخذ الأدوية دي'
      });
    }

    // Severe
    if (summary.severeCount > 0) {
      recommendations.push({
        priority: 'HIGH',
        title: '⚠️ تفاعلات خطيرة',
        description: `فيه ${summary.severeCount} تفاعل خطير بين أدويتك. الأدوية دي ممكن تتفاعل بشكل مؤثر.`,
        action: 'استشارة الطبيب في أقرب فرصة لمراجعة الجرعات'
      });
    }

    // Moderate
    if (summary.moderateCount > 0) {
      recommendations.push({
        priority: 'MEDIUM',
        title: 'ℹ️ تفاعلات متوسطة',
        description: `فيه ${summary.moderateCount} تفاعل متوسط. الأدوية دي ممكن تتفاعل بس مش خطر مباشر.`,
        action: 'راقب حالتك واخبر الطبيب في الزيارة الجاية'
      });
    }

    // General advice
    if (summary.totalInteractions > 0) {
      recommendations.push({
        priority: 'LOW',
        title: '💡 نصائح عامة',
        description: 'خد أدويتك بالترتيب الصحيح، واشرب مية كفاية، وما تنساش مواعيد الفحص',
        action: 'سجل أي أعراض جديدة في تطبيق وفاء وشاركها مع دكتورك'
      });
    } else {
      recommendations.push({
        priority: 'INFO',
        title: '✅ كل حاجة تمام',
        description: 'مفيش تفاعلات معروفة بين أدويتك الحالية',
        action: 'استمر في الالتزام بمواعيد أدويتك 💪'
      });
    }

    return recommendations;
  }
}

module.exports = new DrugInteractionService();
