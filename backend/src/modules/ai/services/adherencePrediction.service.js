const DoseEvent = require('../../doses/models/DoseEvent.model');
const Medication = require('../../medications/models/Medication.model');
const Patient = require('../../auth/models/Patient.model');
const { logger } = require('../../../sheared/utils/logger');

/**
 * Adherence Prediction Service — وفاء (Wafa)
 *
 * Predicts a patient's likelihood of missing future doses based on:
 *  - Historical adherence patterns
 *  - Day-of-week patterns (some patients miss more on weekends)
 *  - Time-of-day patterns (morning vs evening doses)
 *  - Recent trend (improving or declining)
 *  - Medication complexity (number of meds, doses per day)
 *  - Streak history
 *
 * Uses a rule-based scoring system (no external ML library needed).
 * Score: 0-100 (higher = more likely to miss doses)
 *
 * Risk levels:
 *  - 0-20: LOW RISK ( adherent patient)
 *  - 21-50: MODERATE RISK (some concerns)
 *  - 51-75: HIGH RISK (likely to miss doses)
 *  - 76-100: CRITICAL RISK (urgent intervention needed)
 */
class AdherencePredictionService {

  /**
   * Predict adherence risk for a patient
   * @param {String} patientId - Patient ID
   * @param {Number} forecastDays - Days to forecast (default 7)
   * @returns {Object} { riskScore, riskLevel, factors, predictions, recommendations }
   */
  async predictAdherenceRisk(patientId, forecastDays = 7) {
    // Get patient with gamification stats
    const patient = await Patient.findById(patientId);
    if (!patient) throw new Error('Patient not found');

    // Get last 90 days of dose events
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const events = await DoseEvent.find({
      patientId,
      scheduledFor: { $gte: ninetyDaysAgo }
    }).populate('medicationId', 'name schedule.timesOfDay');

    if (events.length === 0) {
      return {
        riskScore: 0,
        riskLevel: 'NO_DATA',
        factors: [],
        predictions: [],
        recommendations: [{
          priority: 'INFO',
          title: '📊 مفيش بيانات كافية',
          description: 'محتاجين على الأقل أسبوع من بيانات الأدوية عشان نقدر نتنبأ',
          action: 'استمر في استخدام وفاء لأسبوع على الأقل'
        }]
      };
    }

    // ===== Analyze patterns =====
    const factors = [];

    // 1. Overall adherence rate (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentEvents = events.filter(e => e.scheduledFor >= thirtyDaysAgo);
    const recentTaken = recentEvents.filter(e => e.status === 'TAKEN').length;
    const recentTotal = recentEvents.length;
    const recentRate = recentTotal > 0 ? recentTaken / recentTotal : 0;

    const adherenceScore = (1 - recentRate) * 40; // 0-40 points
    factors.push({
      name: 'نسبة الالتزام (30 يوم)',
      value: `${Math.round(recentRate * 100)}%`,
      score: Math.round(adherenceScore),
      maxScore: 40,
      description: recentRate >= 0.8 ? 'التزام ممتاز' :
                  recentRate >= 0.6 ? 'التزام كويس' :
                  recentRate >= 0.4 ? 'التزام ضعيف' : 'التزام سيء جداً'
    });

    // 2. Trend direction (last 7 days vs previous 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

    const last7 = events.filter(e => e.scheduledFor >= sevenDaysAgo);
    const prev7 = events.filter(e => e.scheduledFor >= fourteenDaysAgo && e.scheduledFor < sevenDaysAgo);

    const last7Rate = last7.length > 0 ? last7.filter(e => e.status === 'TAKEN').length / last7.length : 0;
    const prev7Rate = prev7.length > 0 ? prev7.filter(e => e.status === 'TAKEN').length / prev7.length : 0;

    let trendScore = 0;
    let trendDescription = 'مستقر';
    if (last7Rate < prev7Rate - 0.1) {
      trendScore = 20; // declining
      trendDescription = '↘ في انخفاض';
    } else if (last7Rate > prev7Rate + 0.1) {
      trendScore = -10; // improving (negative = good)
      trendDescription = '↗ في تحسن';
    }

    factors.push({
      name: 'الاتجاه الأخير',
      value: trendDescription,
      score: Math.max(0, trendScore),
      maxScore: 20,
      description: `آخر 7 أيام: ${Math.round(last7Rate * 100)}% vs الأسبوع اللي فات: ${Math.round(prev7Rate * 100)}%`
    });

    // 3. Day-of-week pattern (weekends vs weekdays)
    const dayPattern = this._analyzeDayOfWeekPattern(events);
    factors.push({
      name: 'نمط أيام الأسبوع',
      value: dayPattern.description,
      score: dayPattern.score,
      maxScore: 15,
      description: dayPattern.detail
    });

    // 4. Time-of-day pattern (morning vs evening misses)
    const timePattern = this._analyzeTimeOfDayPattern(events);
    factors.push({
      name: 'نمط أوقات الجرعات',
      value: timePattern.description,
      score: timePattern.score,
      maxScore: 15,
      description: timePattern.detail
    });

    // 5. Medication complexity (number of meds, doses per day)
    const meds = await Medication.find({ patientId, isActive: true });
    const complexityScore = this._calculateComplexityScore(meds);
    factors.push({
      name: 'تعقيد الأدوية',
      value: `${meds.length} أدوية`,
      score: complexityScore.score,
      maxScore: 10,
      description: complexityScore.description
    });

    // 6. Current streak (gamification)
    const streak = patient.gamification?.currentStreak || 0;
    let streakScore = 0;
    if (streak === 0) streakScore = 10;
    else if (streak < 3) streakScore = 5;
    else if (streak < 7) streakScore = 2;

    factors.push({
      name: 'الستريك الحالي',
      value: `${streak} يوم`,
      score: streakScore,
      maxScore: 10,
      description: streak >= 7 ? '🔥 ستريك قوي!' :
                  streak >= 3 ? '👍 ستريك كويس' :
                  streak > 0 ? '💪 ابدأ بس الجديد' : '⚠️ الستريك مكسور'
    });

    // ===== Calculate total risk score =====
    const totalScore = factors.reduce((sum, f) => sum + f.score, 0);
    const riskScore = Math.min(100, Math.max(0, totalScore));
    const riskLevel = this._getRiskLevel(riskScore);

    // ===== Generate predictions for next N days =====
    const predictions = await this._generatePredictions(patientId, events, forecastDays);

    // ===== Generate recommendations =====
    const recommendations = this._generateRecommendations(riskLevel, factors, predictions);

    return {
      riskScore,
      riskLevel,
      factors,
      predictions,
      recommendations,
      summary: {
        overallAdherence: Math.round(recentRate * 100),
        trend: trendDescription,
        streak,
        medicationsCount: meds.length,
        forecastDays
      }
    };
  }

  /**
   * Analyze which days of week patient misses most
   */
  _analyzeDayOfWeekPattern(events) {
    const dayNames = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    const dayStats = Array(7).fill(null).map(() => ({ total: 0, missed: 0 }));

    events.forEach(e => {
      const day = e.scheduledFor.getDay();
      dayStats[day].total++;
      if (e.status === 'MISSED') {
        dayStats[day].missed++;
      }
    });

    // Find worst day
    let worstDay = 0;
    let worstRate = 0;
    dayStats.forEach((s, i) => {
      if (s.total > 0) {
        const missRate = s.missed / s.total;
        if (missRate > worstRate) {
          worstRate = missRate;
          worstDay = i;
        }
      }
    });

    // Check weekend pattern (Friday + Saturday in Egypt)
    const weekendMisses = dayStats[5].missed + dayStats[6].missed;
    const weekendTotal = dayStats[5].total + dayStats[6].total;
    const weekdayMisses = dayStats.slice(0, 5).reduce((sum, s) => sum + s.missed, 0);
    const weekdayTotal = dayStats.slice(0, 5).reduce((sum, s) => sum + s.total, 0);

    const weekendRate = weekendTotal > 0 ? weekendMisses / weekendTotal : 0;
    const weekdayRate = weekdayTotal > 0 ? weekdayMisses / weekdayTotal : 0;

    let score = 0;
    let description = 'مستقر';
    let detail = 'مفيش نمط واضح';

    if (weekendRate > weekdayRate + 0.15) {
      score = 12;
      description = 'يفوت أكثر في الويك إند';
      detail = `نسبة الفوات في الجمعة والسبت: ${Math.round(weekendRate * 100)}% vs باقي الأيام: ${Math.round(weekdayRate * 100)}%`;
    } else if (worstRate > 0.4 && dayStats[worstDay].total >= 3) {
      score = 8;
      description = `يفوت أكثر يوم ${dayNames[worstDay]}`;
      detail = `نسبة الفوات يوم ${dayNames[worstDay]}: ${Math.round(worstRate * 100)}%`;
    }

    return { score, description, detail };
  }

  /**
   * Analyze which time of day patient misses most
   */
  _analyzeTimeOfDayPattern(events) {
    const slots = {
      morning: { total: 0, missed: 0 },     // 6-12
      noon: { total: 0, missed: 0 },         // 12-15
      evening: { total: 0, missed: 0 },      // 15-19
      night: { total: 0, missed: 0 },        // 19-24
      dawn: { total: 0, missed: 0 }          // 0-6
    };

    events.forEach(e => {
      const hour = e.scheduledFor.getHours();
      let slot;
      if (hour >= 6 && hour < 12) slot = 'morning';
      else if (hour >= 12 && hour < 15) slot = 'noon';
      else if (hour >= 15 && hour < 19) slot = 'evening';
      else if (hour >= 19) slot = 'night';
      else slot = 'dawn';

      slots[slot].total++;
      if (e.status === 'MISSED') {
        slots[slot].missed++;
      }
    });

    const slotNames = {
      morning: 'الصباح',
      noon: 'الضهر',
      evening: 'المساء',
      night: 'الليل',
      dawn: 'الفجر'
    };

    // Find worst time slot
    let worstSlot = null;
    let worstRate = 0;
    Object.entries(slots).forEach(([slot, stats]) => {
      if (stats.total >= 3) {
        const rate = stats.missed / stats.total;
        if (rate > worstRate) {
          worstRate = rate;
          worstSlot = slot;
        }
      }
    });

    let score = 0;
    let description = 'مستقر';
    let detail = 'مفيش نمط واضح';

    if (worstSlot && worstRate > 0.3) {
      score = 10;
      description = `يفوت أكثر ${slotNames[worstSlot]}`;
      detail = `نسبة الفوات في ${slotNames[worstSlot]}: ${Math.round(worstRate * 100)}%`;
    }

    return { score, description, detail };
  }

  /**
   * Calculate medication complexity score
   */
  _calculateComplexityScore(medications) {
    const medCount = medications.length;
    const totalDailyDoses = medications.reduce((sum, m) =>
      sum + (m.schedule?.dosesPerDay || 1), 0
    );

    let score = 0;
    let description = '';

    if (medCount >= 5) {
      score = 8;
      description = `${medCount} أدوية — تعقيد عالي`;
    } else if (medCount >= 3) {
      score = 5;
      description = `${medCount} أدوية — تعقيد متوسط`;
    } else if (medCount >= 1) {
      score = 2;
      description = `${medCount} أدوية — تعقيد منخفض`;
    }

    if (totalDailyDoses >= 6) {
      score += 2;
      description += ` (${totalDailyDoses} جرعات يومياً)`;
    }

    return { score: Math.min(10, score), description };
  }

  /**
   * Generate day-by-day predictions for next N days
   */
  async _generatePredictions(patientId, events, forecastDays) {
    const predictions = [];

    // Get day-of-week miss rates
    const dayStats = Array(7).fill(null).map(() => ({ total: 0, missed: 0, taken: 0 }));
    events.forEach(e => {
      const day = e.scheduledFor.getDay();
      dayStats[day].total++;
      if (e.status === 'MISSED') dayStats[day].missed++;
      if (e.status === 'TAKEN') dayStats[day].taken++;
    });

    const now = new Date();
    const dayNames = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

    for (let i = 0; i < forecastDays; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() + i);
      const dayOfWeek = date.getDay();

      const stats = dayStats[dayOfWeek];
      const missProbability = stats.total > 0 ? stats.missed / stats.total : 0.2;

      let riskLevel = 'LOW';
      if (missProbability > 0.5) riskLevel = 'CRITICAL';
      else if (missProbability > 0.3) riskLevel = 'HIGH';
      else if (missProbability > 0.15) riskLevel = 'MEDIUM';

      predictions.push({
        date: date.toISOString().split('T')[0],
        dayName: dayNames[dayOfWeek],
        missProbability: Math.round(missProbability * 100),
        riskLevel,
        isToday: i === 0,
        isTomorrow: i === 1
      });
    }

    return predictions;
  }

  /**
   * Get risk level from score
   */
  _getRiskLevel(score) {
    if (score <= 20) return 'LOW';
    if (score <= 50) return 'MODERATE';
    if (score <= 75) return 'HIGH';
    return 'CRITICAL';
  }

  /**
   * Generate actionable recommendations based on risk
   */
  _generateRecommendations(riskLevel, factors, predictions) {
    const recommendations = [];

    // Risk-based recommendation
    const riskRecs = {
      LOW: {
        priority: 'INFO',
        title: '✅ أنت في حالة كويسة',
        description: 'التزامك ممتاز، استمر كده!',
        action: 'حافظ على روتينك الحالي'
      },
      MODERATE: {
        priority: 'MEDIUM',
        title: '⚠️ فيه مجال للتحسين',
        description: 'التزامك متوسط، فيه بعض الجرعات بتفوتك',
        action: 'حاول تلتزم أكتر بمواعيد الأدوية'
      },
      HIGH: {
        priority: 'HIGH',
        title: '🚨 خطر مرتفع',
        description: 'أنت معرض لفوات جرعات كتير، محتاج تدخل',
        action: 'فكر في تذكيرات إضافية أو اطلب مساعدة من أهلك'
      },
      CRITICAL: {
        priority: 'CRITICAL',
        title: '🆘 خطر حرج',
        description: 'احتمال كبير إنك تفوت جرعات — ده ممكن يؤثر على صحتك',
        action: 'كلم دكتورك فوراً وفكر في تعديل خطة العلاج'
      }
    };

    recommendations.push(riskRecs[riskLevel] || riskRecs.LOW);

    // Factor-specific recommendations
    const dayPatternFactor = factors.find(f => f.name === 'نمط أيام الأسبوع');
    if (dayPatternFactor && dayPatternFactor.score > 0) {
      recommendations.push({
        priority: 'MEDIUM',
        title: '📅 اهتم أكثر في أيام معينة',
        description: dayPatternFactor.description,
        action: 'ضبط منبه إضافي في الأيام اللي بتفوت فيها أكتر'
      });
    }

    const timePatternFactor = factors.find(f => f.name === 'نمط أوقات الجرعات');
    if (timePatternFactor && timePatternFactor.score > 0) {
      recommendations.push({
        priority: 'MEDIUM',
        title: '⏰ انتبه لمواعيد معينة',
        description: timePatternFactor.description,
        action: 'فكر في تعديل مواعيد الجرعات مع دكتورك'
      });
    }

    const trendFactor = factors.find(f => f.name === 'الاتجاه الأخير');
    if (trendFactor && trendFactor.score >= 20) {
      recommendations.push({
        priority: 'HIGH',
        title: '📉 الالتزام بينخفض',
        description: 'التزامك في آخر أسبوع أقل من اللي فاته',
        action: 'راجع سبب التغيير — ممكن يكون دواء جديد أو تغير في الروتين'
      });
    }

    const complexityFactor = factors.find(f => f.name === 'تعقيد الأدوية');
    if (complexityFactor && complexityFactor.score >= 5) {
      recommendations.push({
        priority: 'LOW',
        title: '💊 أدوية كتيرة',
        description: complexityFactor.description,
        action: 'اسأل دكتورك لو ممكن تبسط جدول الأدوية'
      });
    }

    // Find high-risk days in predictions
    const highRiskDays = predictions.filter(p => p.riskLevel === 'HIGH' || p.riskLevel === 'CRITICAL');
    if (highRiskDays.length > 0) {
      recommendations.push({
        priority: 'HIGH',
        title: '⚠️ أيام高风险 قادمة',
        description: `فيه ${highRiskDays.length} أيام بالتقويم الجاي فيها خطر فوات الجرعات`,
        action: `خد بالك خاصة: ${highRiskDays.map(d => d.dayName).join('، ')}`
      });
    }

    return recommendations;
  }
}

module.exports = new AdherencePredictionService();
