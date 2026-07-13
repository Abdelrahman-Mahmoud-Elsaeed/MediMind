const mongoose = require('mongoose');
const Account = require('../../auth/models/Account.model');
const Patient = require('../../auth/models/Patient.model');
const Caregiver = require('../../auth/models/Caregiver.model');
const Pharmacy = require('../../auth/models/Pharmacy.model');
const Doctor = require('../../auth/models/Doctor.model');
const Medication = require('../../medications/models/Medication.model');
const DoseEvent = require('../../doses/models/DoseEvent.model');
const Relationship = require('../../relationships/models/Relationship.model');
const NotificationLog = require('../../notifications/models/NotificationLog.model');
const { logger } = require('../../../sheared/utils/logger');

/**
 * Admin Service — وفاء (Wafa)
 *
 * Platform-wide analytics for super_admin, ops_admin, finance_admin.
 * Different admin levels see different data (finance sees revenue only).
 */
class AdminService {

  /**
   * Get platform overview dashboard
   */
  async getDashboard() {
    const [
      totalAccounts,
      totalPatients,
      totalCaregivers,
      totalPharmacies,
      totalDoctors,
      totalMedications,
      totalDoseEvents,
      totalRelationships,
      activeSubscriptions
    ] = await Promise.all([
      Account.countDocuments({ isActive: true }),
      Patient.countDocuments(),
      Caregiver.countDocuments(),
      Pharmacy.countDocuments(),
      Doctor.countDocuments(),
      Medication.countDocuments({ isActive: true }),
      DoseEvent.countDocuments(),
      Relationship.countDocuments({ status: 'ACCEPTED' }),
      Account.countDocuments({ 'subscription.status': 'active' })
    ]);

    // ===== Last 30 days stats =====
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [newAccounts30d, newDoses30d, notificationsSent30d] = await Promise.all([
      Account.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      DoseEvent.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      NotificationLog.countDocuments({ createdAt: { $gte: thirtyDaysAgo } })
    ]);

    // ===== Pilot pharmacies =====
    const pilotPharmacies = await Pharmacy.countDocuments({
      'subscription.isPilot': true
    });

    // ===== Average adherence =====
    const adherenceAgg = await DoseEvent.aggregate([
      { $match: { scheduledFor: { $gte: thirtyDaysAgo } } },
      { $group: {
        _id: null,
        total: { $sum: 1 },
        taken: { $sum: { $cond: [{ $eq: ['$status', 'TAKEN'] }, 1, 0] } }
      }}
    ]);
    const avgAdherence = adherenceAgg.length > 0
      ? Math.round((adherenceAgg[0].taken / adherenceAgg[0].total) * 100)
      : 0;

    return {
      users: {
        totalAccounts,
        totalPatients,
        totalCaregivers,
        totalPharmacies,
        totalDoctors,
        newAccounts30d
      },
      content: {
        totalMedications,
        totalDoseEvents,
        newDoses30d,
        totalRelationships
      },
      notifications: {
        sent30d: notificationsSent30d
      },
      subscriptions: {
        active: activeSubscriptions,
        pilotPharmacies
      },
      health: {
        avgAdherence,
        dosesScheduled30d: adherenceAgg[0]?.total || 0,
        dosesTaken30d: adherenceAgg[0]?.taken || 0
      }
    };
  }

  /**
   * Get user growth chart data (last 12 months)
   */
  async getUserGrowth() {
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
    twelveMonthsAgo.setDate(1);
    twelveMonthsAgo.setHours(0, 0, 0, 0);

    const growth = await Account.aggregate([
      { $match: { createdAt: { $gte: twelveMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          total: { $sum: 1 },
          patients: { $sum: { $cond: [{ $eq: ['$role', 'PATIENT'] }, 1, 0] } },
          caregivers: { $sum: { $cond: [{ $eq: ['$role', 'CAREGIVER'] }, 1, 0] } },
          pharmacies: { $sum: { $cond: [{ $eq: ['$role', 'PHARMACY'] }, 1, 0] } },
          doctors: { $sum: { $cond: [{ $eq: ['$role', 'DOCTOR'] }, 1, 0] } }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Format and calculate cumulative
    let cumulative = { total: 0, patients: 0, caregivers: 0, pharmacies: 0, doctors: 0 };
    return growth.map(g => {
      cumulative.total += g.total;
      cumulative.patients += g.patients;
      cumulative.caregivers += g.caregivers;
      cumulative.pharmacies += g.pharmacies;
      cumulative.doctors += g.doctors;

      const monthNames = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
        'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];

      return {
        month: `${monthNames[g._id.month - 1]} ${g._id.year}`,
        new: g.total,
        newPatients: g.patients,
        newCaregivers: g.caregivers,
        newPharmacies: g.pharmacies,
        newDoctors: g.doctors,
        cumulative: { ...cumulative }
      };
    });
  }

  /**
   * Get financial summary (for finance_admin and super_admin)
   */
  async getFinancials() {
    // Calculate MRR (Monthly Recurring Revenue)
    const activePharmacies = await Account.find({
      role: 'PHARMACY',
      'subscription.status': 'active',
      'subscription.plan': { $in: ['monthly', 'yearly'] }
    });
    const activeCaregiversPremium = await Account.find({
      role: 'CAREGIVER',
      'subscription.status': 'active',
      'subscription.plan': 'premium'
    });
    const activeDoctors = await Account.find({
      role: 'DOCTOR',
      'subscription.status': 'active',
      'subscription.plan': { $in: ['monthly', 'yearly'] }
    });

    // Estimated revenue (using mid-tier pricing)
    const pharmacyRevenue = activePharmacies.length * 400; // avg 400 EGP/month
    const caregiverRevenue = activeCaregiversPremium.length * 99; // 99 EGP/month
    const doctorRevenue = activeDoctors.length * 300; // avg 300 EGP/month
    const mrr = pharmacyRevenue + caregiverRevenue + doctorRevenue;

    // Pilot (free) pharmacies
    const pilotPharmacies = await Account.countDocuments({
      role: 'PHARMACY',
      'subscription.isPilot': true
    });

    // Subscription breakdown
    const subscriptionBreakdown = await Account.aggregate([
      { $match: { 'subscription.status': { $ne: 'none' } } },
      {
        $group: {
          _id: '$subscription.plan',
          count: { $sum: 1 }
        }
      }
    ]);

    // Projected annual revenue (MRR × 12)
    const arr = mrr * 12;

    return {
      mrr,
      arr,
      revenueBySource: {
        pharmacies: pharmacyRevenue,
        caregivers: caregiverRevenue,
        doctors: doctorRevenue
      },
      activeSubscriptions: {
        pharmacies: activePharmacies.length,
        caregiversPremium: activeCaregiversPremium.length,
        doctors: activeDoctors.length
      },
      pilotPharmacies,
      subscriptionBreakdown: subscriptionBreakdown.reduce((acc, s) => {
        acc[s._id] = s.count;
        return acc;
      }, {}),
      currency: 'EGP'
    };
  }

  /**
   * Get all users with pagination (for ops_admin)
   */
  async getUsers(options = {}) {
    const { role, search, page = 1, limit = 20 } = options;
    const query = {};
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      Account.find(query)
        .select('-passwordHash -otp')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Account.countDocuments(query)
    ]);

    return {
      users: users.map(u => ({
        _id: u._id,
        phone: u.phone,
        email: u.email,
        role: u.role,
        adminLevel: u.adminLevel,
        isActive: u.isActive,
        isPhoneVerified: u.isPhoneVerified,
        whatsappOptIn: u.whatsappOptIn,
        subscription: u.subscription,
        lastLoginAt: u.lastLoginAt,
        createdAt: u.createdAt
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get system health (for ops_admin)
   */
  async getSystemHealth() {
    const dbStats = await mongoose.connection.db.stats();
    const notificationStats = await NotificationLog.aggregate([
      { $group: {
        _id: '$status',
        count: { $sum: 1 }
      }}
    ]);

    const doseStats = await DoseEvent.aggregate([
      { $group: {
        _id: '$status',
        count: { $sum: 1 }
      }}
    ]);

    return {
      database: {
        collections: dbStats.collections,
        dataSize: dbStats.dataSize,
        storageSize: dbStats.storageSize,
        indexes: dbStats.indexes,
        indexSize: dbStats.indexSize
      },
      notifications: notificationStats.reduce((acc, s) => {
        acc[s._id] = s.count;
        return acc;
      }, {}),
      doses: doseStats.reduce((acc, s) => {
        acc[s._id] = s.count;
        return acc;
      }, {}),
      uptime: process.uptime(),
      memory: process.memoryUsage()
    };
  }

  /**
   * Get engagement metrics (for super_admin)
   */
  async getEngagement() {
    const now = new Date();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);

    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // ===== DAU/MAU =====
    const [dau, wau, mau] = await Promise.all([
      // Daily Active Users (patients who confirmed a dose today)
      DoseEvent.distinct('patientId', {
        status: 'TAKEN',
        takenAt: { $gte: today }
      }).then(arr => arr.length),

      // Weekly Active Users
      DoseEvent.distinct('patientId', {
        status: 'TAKEN',
        takenAt: { $gte: sevenDaysAgo }
      }).then(arr => arr.length),

      // Monthly Active Users
      DoseEvent.distinct('patientId', {
        status: 'TAKEN',
        takenAt: { $gte: thirtyDaysAgo }
      }).then(arr => arr.length)
    ]);

    // ===== Stickiness (DAU/MAU ratio) =====
    const totalPatients = await Patient.countDocuments();
    const stickiness = mau > 0 ? Math.round((dau / mau) * 100) : 0;

    // ===== Adherence distribution =====
    const adherenceDist = await DoseEvent.aggregate([
      { $match: { scheduledFor: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: '$patientId',
          total: { $sum: 1 },
          taken: { $sum: { $cond: [{ $eq: ['$status', 'TAKEN'] }, 1, 0] } }
        }
      },
      {
        $project: {
          rate: {
            $cond: [
              { $eq: ['$total', 0] },
              0,
              { $multiply: [{ $divide: ['$taken', '$total'] }, 100] }
            ]
          }
        }
      },
      {
        $bucket: {
          groupBy: '$rate',
          boundaries: [0, 30, 50, 70, 90, 101],
          default: 'other',
          output: { count: { $sum: 1 } }
        }
      }
    ]);

    return {
      activeUsers: {
        daily: dau,
        weekly: wau,
        monthly: mau
      },
      stickiness, // DAU/MAU %
      totalRegisteredPatients: totalPatients,
      engagementRate: totalPatients > 0 ? Math.round((mau / totalPatients) * 100) : 0,
      adherenceDistribution: adherenceDist.map(d => ({
        range: d._id,
        count: d.count
      }))
    };
  }
}

module.exports = new AdminService();
