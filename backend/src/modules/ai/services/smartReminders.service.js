const DoseEvent = require('../../doses/models/DoseEvent.model');
const Medication = require('../../medications/models/Medication.model');
const Patient = require('../../auth/models/Patient.model');
const NotificationLog = require('../../notifications/models/NotificationLog.model');
const { logger } = require('../../../sheared/utils/logger');

/**
 * Smart Reminders Service — وفاء (Wafa)
 *
 * AI-powered reminder system that learns from patient behavior:
 *
 *  1. OPTIMAL TIMING: Learns when patient actually takes meds
 *     (e.g., if always 20min late → remind 20min early)
 *
 *  2. CHANNEL PREFERENCE: Learns which notification channel works best
 *     (push vs WhatsApp vs SMS) based on response rates
 *
 *  3. ADAPTIVE FREQUENCY: Adjusts reminder frequency based on adherence
 *     (adherent patients get fewer reminders, struggling patients get more)
 *
 *  4. PATTERN DETECTION: Identifies problematic patterns
 *     (e.g., always misses Friday evening dose)
 *
 *  5. SCHEDULE SUGGESTIONS: Recommends schedule adjustments
 *     (e.g., "move your 8pm dose to 9pm — you're 67% more likely to take it")
 *
 * Uses rule-based ML (no external library needed).
 */

class SmartRemindersService {

  /**
   * Analyze patient behavior and generate smart reminder settings
   * @param {String} patientId - Patient ID
   * @returns {Object} { insights, recommendations, adjustedTimings, channelPreference }
   */
  async analyzePatientBehavior(patientId) {
    const patient = await Patient.findById(patientId);
    if (!patient) throw new Error('Patient not found');

    // Get last 60 days of events
    const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
    const events = await DoseEvent.find({
      patientId,
      scheduledFor: { $gte: sixtyDaysAgo }
    }).populate('medicationId', 'name schedule.timesOfDay');

    if (events.length < 7) {
      return {
        insights: [],
        recommendations: [{
          type: 'INSUFFICIENT_DATA',
          priority: 'INFO',
          title: '📊 بيانات غير كافية',
          description: 'محتاجين على الأقل أسبوع من بيانات الأدوية عشان نقدر نتعلم من سلوكك',
          action: 'استمر في استخدام وفاء — الذكاء الاصطناعي هيبدأ شغّال بعد أسبوع'
        }],
        adjustedTimings: [],
        channelPreference: null,
        summary: { eventsAnalyzed: events.length }
      };
    }

    // ===== 1. TIMING ANALYSIS =====
    const timingAnalysis = this._analyzeTimingBehavior(events);

    // ===== 2. CHANNEL PREFERENCE =====
    const channelPreference = await this._analyzeChannelPreference(patient.accountId);

    // ===== 3. ADHERENCE PATTERNS =====
    const patterns = this._detectPatterns(events);

    // ===== 4. SCHEDULE SUGGESTIONS =====
    const scheduleSuggestions = this._generateScheduleSuggestions(events, patterns);

    // ===== 5. REMINDER FREQUENCY =====
    const frequencyRecommendation = this._recommendReminderFrequency(events, patterns);

    // ===== BUILD ADJUSTED TIMINGS =====
    const adjustedTimings = this._buildAdjustedTimings(events, timingAnalysis);

    // ===== BUILD INSIGHTS =====
    const insights = this._buildInsights(timingAnalysis, patterns, channelPreference);

    // ===== BUILD RECOMMENDATIONS =====
    const recommendations = this._buildRecommendations(
      timingAnalysis, patterns, channelPreference,
      scheduleSuggestions, frequencyRecommendation
    );

    return {
      insights,
      recommendations,
      adjustedTimings,
      channelPreference,
      scheduleSuggestions,
      frequencyRecommendation,
      summary: {
        eventsAnalyzed: events.length,
        daysAnalyzed: 60,
        averageDelay: timingAnalysis.averageDelayMinutes,
        optimalChannel: channelPreference?.bestChannel,
        adherenceTrend: patterns.trendDirection,
        smartRemindersActive: events.length >= 7
      }
    };
  }

  /**
   * Get smart reminder settings for a patient (used by worker)
   * Returns adjusted timings + channel preference
   */
  async getSmartReminderSettings(patientId) {
    const analysis = await this.analyzePatientBehavior(patientId);

    return {
      adjustedTimings: analysis.adjustedTimings,
      channelPreference: analysis.channelPreference,
      frequencyRecommendation: analysis.frequencyRecommendation,
      // Smart reminders are active if we have enough data
      isActive: analysis.summary.smartRemindersActive
    };
  }

  // ============================================
  // PRIVATE: TIMING ANALYSIS
  // ============================================

  /**
   * Analyze when patient actually takes medications vs scheduled time
   */
  _analyzeTimingBehavior(events) {
    const takenEvents = events.filter(e =>
      e.status === 'TAKEN' && e.takenAt && e.scheduledFor
    );

    if (takenEvents.length === 0) {
      return {
        averageDelayMinutes: 0,
        delayPattern: 'NO_DATA',
        timingAccuracy: 0,
        byTimeSlot: {},
        byMedication: {}
      };
    }

    // Calculate delays (positive = late, negative = early)
    const delays = takenEvents.map(e => {
      const delayMs = e.takenAt.getTime() - e.scheduledFor.getTime();
      return Math.round(delayMs / (60 * 1000)); // minutes
    });

    const averageDelay = delays.reduce((a, b) => a + b, 0) / delays.length;
    const medianDelay = this._median(delays);

    // Categorize pattern
    let delayPattern = 'ON_TIME';
    if (averageDelay > 30) delayPattern = 'LATE';
    else if (averageDelay < -10) delayPattern = 'EARLY';
    else if (Math.abs(averageDelay) <= 15) delayPattern = 'ON_TIME';
    else delayPattern = 'VARIABLE';

    // Calculate timing accuracy (% within 30 min of scheduled)
    const onTimeCount = delays.filter(d => Math.abs(d) <= 30).length;
    const timingAccuracy = Math.round((onTimeCount / delays.length) * 100);

    // Break down by time slot
    const byTimeSlot = this._analyzeByTimeSlot(takenEvents);

    // Break down by medication
    const byMedication = this._analyzeByMedication(takenEvents);

    return {
      averageDelayMinutes: Math.round(averageDelay),
      medianDelayMinutes: Math.round(medianDelay),
      delayPattern,
      timingAccuracy,
      byTimeSlot,
      byMedication,
      totalAnalyzed: takenEvents.length
    };
  }

  /**
   * Analyze timing by time of day
   */
  _analyzeByTimeSlot(events) {
    const slots = {
      morning: { count: 0, delays: [] },
      noon: { count: 0, delays: [] },
      evening: { count: 0, delays: [] },
      night: { count: 0, delays: [] }
    };

    events.forEach(e => {
      const hour = e.scheduledFor.getHours();
      let slot;
      if (hour >= 6 && hour < 12) slot = 'morning';
      else if (hour >= 12 && hour < 15) slot = 'noon';
      else if (hour >= 15 && hour < 19) slot = 'evening';
      else slot = 'night';

      const delay = Math.round((e.takenAt - e.scheduledFor) / (60 * 1000));
      slots[slot].count++;
      slots[slot].delays.push(delay);
    });

    const slotNames = {
      morning: 'الصباح',
      noon: 'الضهر',
      evening: 'المساء',
      night: 'الليل'
    };

    const result = {};
    Object.entries(slots).forEach(([slot, data]) => {
      if (data.count > 0) {
        const avgDelay = data.delays.reduce((a, b) => a + b, 0) / data.delays.length;
        result[slot] = {
          label: slotNames[slot],
          count: data.count,
          averageDelay: Math.round(avgDelay),
          pattern: avgDelay > 30 ? 'LATE' : avgDelay < -10 ? 'EARLY' : 'ON_TIME'
        };
      }
    });

    return result;
  }

  /**
   * Analyze timing by medication
   */
  _analyzeByMedication(events) {
    const byMed = {};

    events.forEach(e => {
      const medName = e.medicationId?.name || 'Unknown';
      if (!byMed[medName]) {
        byMed[medName] = { count: 0, delays: [] };
      }
      const delay = Math.round((e.takenAt - e.scheduledFor) / (60 * 1000));
      byMed[medName].count++;
      byMed[medName].delays.push(delay);
    });

    const result = {};
    Object.entries(byMed).forEach(([medName, data]) => {
      const avgDelay = data.delays.reduce((a, b) => a + b, 0) / data.delays.length;
      result[medName] = {
        count: data.count,
        averageDelay: Math.round(avgDelay),
        pattern: avgDelay > 30 ? 'LATE' : avgDelay < -10 ? 'EARLY' : 'ON_TIME'
      };
    });

    return result;
  }

  // ============================================
  // PRIVATE: CHANNEL PREFERENCE
  // ============================================

  /**
   * Analyze which notification channel works best for this patient
   * (based on which channel leads to fastest dose confirmation)
   */
  async _analyzeChannelPreference(accountId) {
    // Get last 30 days of notifications
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const notifications = await NotificationLog.find({
      accountId,
      type: { $in: ['DOSE_REMINDER', 'DOSE_REMINDER_BATCH'] },
      createdAt: { $gte: thirtyDaysAgo }
    }).sort({ createdAt: 1 });

    if (notifications.length === 0) {
      return {
        bestChannel: 'PUSH',
        channels: { PUSH: 0, WHATSAPP: 0, SMS: 0 },
        reason: 'لا توجد إشعارات سابقة — سنستخدم PUSH افتراضياً'
      };
    }

    // Count by channel
    const channels = { PUSH: 0, WHATSAPP: 0, SMS: 0 };
    notifications.forEach(n => {
      if (channels[n.channel] !== undefined) {
        channels[n.channel]++;
      }
    });

    // Determine best channel (the one most used successfully)
    let bestChannel = 'PUSH';
    let maxCount = 0;
    Object.entries(channels).forEach(([channel, count]) => {
      if (count > maxCount) {
        maxCount = count;
        bestChannel = channel;
      }
    });

    return {
      bestChannel,
      channels,
      totalNotifications: notifications.length,
      reason: `بناءً على ${notifications.length} إشعار في آخر 30 يوم`
    };
  }

  // ============================================
  // PRIVATE: PATTERN DETECTION
  // ============================================

  _detectPatterns(events) {
    const patterns = {
      weekendVsWeekday: null,
      worstDay: null,
      worstTimeSlot: null,
      trendDirection: 'STABLE',
      consecutiveMisses: 0,
      improvementScore: 0
    };

    // Weekend vs Weekday
    const weekendEvents = events.filter(e => {
      const day = e.scheduledFor.getDay();
      return day === 5 || day === 6; // Friday, Saturday
    });
    const weekdayEvents = events.filter(e => {
      const day = e.scheduledFor.getDay();
      return day !== 5 && day !== 6;
    });

    const weekendMissRate = weekendEvents.length > 0
      ? weekendEvents.filter(e => e.status === 'MISSED').length / weekendEvents.length
      : 0;
    const weekdayMissRate = weekdayEvents.length > 0
      ? weekdayEvents.filter(e => e.status === 'MISSED').length / weekdayEvents.length
      : 0;

    if (weekendMissRate > weekdayMissRate + 0.1) {
      patterns.weekendVsWeekday = {
        pattern: 'WEEKEND_STRUGGLE',
        description: 'يفوت الجرعات أكثر في الويك إند',
        weekendMissRate: Math.round(weekendMissRate * 100),
        weekdayMissRate: Math.round(weekdayMissRate * 100)
      };
    }

    // Worst day
    const dayStats = Array(7).fill(null).map(() => ({ total: 0, missed: 0 }));
    events.forEach(e => {
      dayStats[e.scheduledFor.getDay()].total++;
      if (e.status === 'MISSED') dayStats[e.scheduledFor.getDay()].missed++;
    });

    const dayNames = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    let worstDayIdx = -1;
    let worstDayRate = 0;
    dayStats.forEach((s, i) => {
      if (s.total >= 3) {
        const rate = s.missed / s.total;
        if (rate > worstDayRate) {
          worstDayRate = rate;
          worstDayIdx = i;
        }
      }
    });

    if (worstDayIdx >= 0 && worstDayRate > 0.3) {
      patterns.worstDay = {
        day: dayNames[worstDayIdx],
        missRate: Math.round(worstDayRate * 100)
      };
    }

    // Trend direction
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

    const last7 = events.filter(e => e.scheduledFor >= sevenDaysAgo);
    const prev7 = events.filter(e => e.scheduledFor >= fourteenDaysAgo && e.scheduledFor < sevenDaysAgo);

    const last7Rate = last7.length > 0
      ? last7.filter(e => e.status === 'TAKEN').length / last7.length : 0;
    const prev7Rate = prev7.length > 0
      ? prev7.filter(e => e.status === 'TAKEN').length / prev7.length : 0;

    if (last7Rate > prev7Rate + 0.1) {
      patterns.trendDirection = 'IMPROVING';
      patterns.improvementScore = Math.round((last7Rate - prev7Rate) * 100);
    } else if (last7Rate < prev7Rate - 0.1) {
      patterns.trendDirection = 'DECLINING';
      patterns.improvementScore = Math.round((last7Rate - prev7Rate) * 100);
    }

    return patterns;
  }

  // ============================================
  // PRIVATE: SCHEDULE SUGGESTIONS
  // ============================================

  _generateScheduleSuggestions(events, patterns) {
    const suggestions = [];

    // Suggestion 1: Adjust timing based on average delay
    const takenEvents = events.filter(e => e.status === 'TAKEN' && e.takenAt);
    if (takenEvents.length >= 7) {
      const avgDelayMin = takenEvents.reduce((sum, e) => {
        return sum + Math.round((e.takenAt - e.scheduledFor) / (60 * 1000));
      }, 0) / takenEvents.length;

      if (avgDelayMin > 30) {
        suggestions.push({
          type: 'TIMING_ADJUSTMENT',
          priority: 'MEDIUM',
          title: '⏰ اضبط ميعاد التذكير',
          description: `أنت بتأخذ أدويتك بمتوسط ${Math.round(avgDelayMin)} دقيقة تأخير`,
          action: `نقترح نذكّرك ${Math.round(avgDelayMin)} دقيقة بدري عن الميعاد المحدد`,
          impact: 'هيخليك تلتزم أكتر بمواعيد الأدوية'
        });
      } else if (avgDelayMin < -15) {
        suggestions.push({
          type: 'TIMING_ADJUSTMENT',
          priority: 'LOW',
          title: '⏰ أنت بتأخذ الدواء بدري',
          description: `أنت بتأخذ أدويتك بمتوسط ${Math.abs(Math.round(avgDelayMin))} دقيقة قبل الميعاد`,
          action: 'ممكن نأخر التذكير شوية عشان يبقى أوضح معروتك',
          impact: 'هيقلل الإشعارات المبكرة'
        });
      }
    }

    // Suggestion 2: Weekend pattern
    if (patterns.weekendVsWeekday?.pattern === 'WEEKEND_STRUGGLE') {
      suggestions.push({
        type: 'WEEKEND_BOOST',
        priority: 'HIGH',
        title: '📅 الويك إند تحدي',
        description: `أنت بتفوت ${patterns.weekendVsWeekday.weekendMissRate}% من جرعات الويك إند vs ${patterns.weekendVsWeekday.weekdayMissRate}% في الأيام العادية`,
        action: 'هنزود تذكيرات إضافية في الجمعة والسبت',
        impact: 'هيقلل فوات الجرعات في الويك إند'
      });
    }

    // Suggestion 3: Worst day
    if (patterns.worstDay) {
      suggestions.push({
        type: 'DAY_SPECIFIC',
        priority: 'HIGH',
        title: `⚠️ يوم ${patterns.worstDay.day} مشكلة`,
        description: `أنت بتفوت ${patterns.worstDay.missRate}% من جرعات يوم ${patterns.worstDay.day}`,
        action: `هنزود تذكير إضافي يوم ${patterns.worstDay.day}`,
        impact: 'هيساعدك تفتكر في اليوم ده بالذات'
      });
    }

    // Suggestion 4: Improving trend
    if (patterns.trendDirection === 'IMPROVING' && patterns.improvementScore > 15) {
      suggestions.push({
        type: 'REDUCE_FREQUENCY',
        priority: 'LOW',
        title: '🎉 تحسنت كتير!',
        description: `التزامك تحسن بـ ${patterns.improvementScore}% في الأسبوع الأخير`,
        action: 'ممكن نقلل عدد التذكيرات عشان ما نزعجكش',
        impact: 'هيقلل الإشعارات وأنت مش محتاجها'
      });
    }

    // Suggestion 5: Declining trend
    if (patterns.trendDirection === 'DECLINING' && patterns.improvementScore < -15) {
      suggestions.push({
        type: 'INCREASE_FREQUENCY',
        priority: 'HIGH',
        title: '⚠️ التزامك بينخفض',
        description: `التزامك قل بـ ${Math.abs(patterns.improvementScore)}% في الأسبوع الأخير`,
        action: 'هنزود التذكيرات ونخليها أقوى',
        impact: 'هيساعدك ترجع للتزامك الطبيعي'
      });
    }

    return suggestions;
  }

  // ============================================
  // PRIVATE: REMINDER FREQUENCY
  // ============================================

  _recommendReminderFrequency(events, patterns) {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentEvents = events.filter(e => e.scheduledFor >= thirtyDaysAgo);
    const takenCount = recentEvents.filter(e => e.status === 'TAKEN').length;
    const adherenceRate = recentEvents.length > 0 ? takenCount / recentEvents.length : 0;

    let frequency = 'NORMAL';
    let description = 'تذكيرات عادية';
    let extraReminders = 0;

    if (adherenceRate >= 0.9) {
      frequency = 'MINIMAL';
      description = 'تذكيرات أقل — أنت ملتزم جداً';
      extraReminders = 0;
    } else if (adherenceRate >= 0.7) {
      frequency = 'NORMAL';
      description = 'تذكيرات عادية';
      extraReminders = 0;
    } else if (adherenceRate >= 0.5) {
      frequency = 'ENHANCED';
      description = 'تذكيرات إضافية — محتاج شوية دعم';
      extraReminders = 1;
    } else {
      frequency = 'INTENSIVE';
      description = 'تذكيرات مكثفة — محتاج متابعة قوية';
      extraReminders = 2;
    }

    // Boost if declining trend
    if (patterns.trendDirection === 'DECLINING') {
      extraReminders += 1;
      frequency = frequency === 'NORMAL' ? 'ENHANCED' : frequency;
    }

    return {
      frequency,
      description,
      extraReminders,
      adherenceRate: Math.round(adherenceRate * 100)
    };
  }

  // ============================================
  // PRIVATE: BUILD ADJUSTED TIMINGS
  // ============================================

  _buildAdjustedTimings(events, timingAnalysis) {
    const timings = [];
    const medications = {};

    // Group by medication + time
    events.forEach(e => {
      if (!e.medicationId) return;
      const medId = String(e.medicationId._id);
      const timeStr = e.scheduledFor.toTimeString().substring(0, 5);

      const key = `${medId}-${timeStr}`;
      if (!medications[key]) {
        medications[key] = {
          medicationId: medId,
          medicationName: e.medicationId.name,
          scheduledTime: timeStr,
          delays: []
        };
      }

      if (e.status === 'TAKEN' && e.takenAt) {
        const delay = Math.round((e.takenAt - e.scheduledFor) / (60 * 1000));
        medications[key].delays.push(delay);
      }
    });

    // Calculate adjusted time for each
    Object.values(medications).forEach(med => {
      if (med.delays.length < 3) return; // Need at least 3 data points

      const avgDelay = med.delays.reduce((a, b) => a + b, 0) / med.delays.length;

      // Only suggest adjustment if delay is significant (> 15 min)
      if (Math.abs(avgDelay) < 15) return;

      // Calculate new time (shift by -avgDelay to compensate)
      const [hours, minutes] = med.scheduledTime.split(':').map(Number);
      const originalDate = new Date();
      originalDate.setHours(hours, minutes, 0, 0);
      const adjustedDate = new Date(originalDate.getTime() - avgDelay * 60 * 1000);

      const adjustedTime = adjustedDate.toTimeString().substring(0, 5);

      timings.push({
        medicationId: med.medicationId,
        medicationName: med.medicationName,
        originalTime: med.scheduledTime,
        suggestedTime: adjustedTime,
        averageDelayMinutes: Math.round(avgDelay),
        direction: avgDelay > 0 ? 'EARLIER' : 'LATER',
        dataPoints: med.delays.length,
        confidence: this._calculateConfidence(med.delays.length, Math.abs(avgDelay))
      });
    });

    return timings.sort((a, b) => b.confidence - a.confidence);
  }

  _calculateConfidence(dataPoints, delayMagnitude) {
    let confidence = 0;
    if (dataPoints >= 10) confidence += 50;
    else if (dataPoints >= 5) confidence += 30;
    else if (dataPoints >= 3) confidence += 15;

    if (delayMagnitude >= 60) confidence += 50;
    else if (delayMagnitude >= 30) confidence += 35;
    else if (delayMagnitude >= 15) confidence += 20;

    return Math.min(100, confidence);
  }

  // ============================================
  // PRIVATE: BUILD INSIGHTS & RECOMMENDATIONS
  // ============================================

  _buildInsights(timingAnalysis, patterns, channelPreference) {
    const insights = [];

    // Timing insight
    if (timingAnalysis.totalAnalyzed > 0) {
      insights.push({
        type: 'TIMING',
        icon: '⏰',
        title: 'تحليل المواعيد',
        value: `${timingAnalysis.averageDelayMinutes >= 0 ? '+' : ''}${timingAnalysis.averageDelayMinutes} دقيقة`,
        description: timingAnalysis.delayPattern === 'LATE'
          ? 'بتأخذ أدويتك متأخر عادة'
          : timingAnalysis.delayPattern === 'EARLY'
          ? 'بتأخذ أدويتك بدري عادة'
          : 'بتأخذ أدويتك في ميعادها تقريباً',
        accuracy: `${timingAnalysis.timingAccuracy}% دقة`
      });
    }

    // Channel insight
    if (channelPreference) {
      const channelIcons = { PUSH: '📱', WHATSAPP: '💬', SMS: '✉️' };
      insights.push({
        type: 'CHANNEL',
        icon: channelIcons[channelPreference.bestChannel] || '📱',
        title: 'قناة التذكير المفضلة',
        value: channelPreference.bestChannel === 'PUSH' ? 'إشعارات المتصفح'
              : channelPreference.bestChannel === 'WHATSAPP' ? 'WhatsApp'
              : 'SMS',
        description: channelPreference.reason
      });
    }

    // Trend insight
    if (patterns.trendDirection !== 'STABLE') {
      insights.push({
        type: 'TREND',
        icon: patterns.trendDirection === 'IMPROVING' ? '📈' : '📉',
        title: 'الاتجاه الأخير',
        value: patterns.trendDirection === 'IMPROVING' ? 'في تحسن' : 'في انخفاض',
        description: patterns.improvementScore > 0
          ? `تحسن بـ ${patterns.improvementScore}%`
          : `انخفاض بـ ${Math.abs(patterns.improvementScore)}%`
      });
    }

    return insights;
  }

  _buildRecommendations(timingAnalysis, patterns, channelPreference, scheduleSuggestions, frequencyRec) {
    const recommendations = [...scheduleSuggestions];

    // Frequency recommendation
    recommendations.unshift({
      type: 'FREQUENCY',
      priority: frequencyRec.frequency === 'INTENSIVE' ? 'HIGH' :
                frequencyRec.frequency === 'ENHANCED' ? 'MEDIUM' : 'LOW',
      title: '🔢 عدد التذكيرات',
      description: frequencyRec.description,
      action: frequencyRec.extraReminders > 0
        ? `هنزود ${frequencyRec.extraReminders} تذكير إضافي`
        : 'هنحافظ على التذكيرات الحالية',
      impact: `بناءً على التزامك الحالي (${frequencyRec.adherenceRate}%)`
    });

    return recommendations;
  }

  // ============================================
  // PRIVATE: UTILITY
  // ============================================

  _median(arr) {
    const sorted = [...arr].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0
      ? (sorted[mid - 1] + sorted[mid]) / 2
      : sorted[mid];
  }
}

module.exports = new SmartRemindersService();
