/**
 * Seed Script — وفاء (Wafa)
 *
 * Populates the database with realistic test data for development.
 *
 * Creates:
 *  - 3 Patients (with different adherence patterns)
 *  - 2 Caregivers (children of patient 1 and 2)
 *  - 1 Pharmacy (linked to all patients)
 *  - 1 Doctor (linked to all patients)
 *  - 1 Admin (super_admin)
 *  - Medical conditions for each patient
 *  - 3-5 Medications per patient (mix of chronic and acute)
 *  - DoseEvents for the past 30 days (with realistic adherence patterns)
 *
 * Usage:
 *   node scripts/seed.js
 *
 * Options:
 *   --clean   Drop all collections before seeding
 *   --verbose Show detailed progress
 */

const path = require('path');
const fs = require('fs');

// Load env — try .env first, then fall back to .env.example
const envPath = path.join(__dirname, '..', '.env');
const envExamplePath = path.join(__dirname, '..', '.env.example');
const envToLoad = fs.existsSync(envPath) ? envPath : envExamplePath;
if (fs.existsSync(envToLoad)) {
  fs.readFileSync(envToLoad, 'utf8').split('\n').forEach(line => {
    const match = line.match(/^([A-Z_]+)=(.*)$/);
    if (match) process.env[match[1]] = match[2];
  });
}

// Use backend's node_modules
const backendNodeModules = path.join(__dirname, '..', 'backend', 'node_modules');
const mongoose = require(path.join(backendNodeModules, 'mongoose'));
const crypto = require('crypto');

// Models
const Account = require('../backend/src/modules/auth/models/Account.model');
const Patient = require('../backend/src/modules/auth/models/Patient.model');
const Caregiver = require('../backend/src/modules/auth/models/Caregiver.model');
const Pharmacy = require('../backend/src/modules/auth/models/Pharmacy.model');
const Doctor = require('../backend/src/modules/auth/models/Doctor.model');
const MedicalCondition = require('../backend/src/modules/conditions/models/MedicalCondition.model');
const Medication = require('../backend/src/modules/medications/models/Medication.model');
const DoseEvent = require('../backend/src/modules/doses/models/DoseEvent.model');

// Args
const args = process.argv.slice(2);
const shouldClean = args.includes('--clean');
const verbose = args.includes('--verbose');

const log = (...msgs) => verbose && console.log('  ', ...msgs);
const info = (msg) => console.log('\n📋 ' + msg);
const success = (msg) => console.log('✅ ' + msg);
const warn = (msg) => console.warn('⚠️  ' + msg);

// ===== HELPERS =====

function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function daysAgo(days) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

function daysFromNow(days) {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

// ===== SEED DATA =====

const PATIENTS_DATA = [
  {
    firstName: 'محمد',
    lastName: 'أحمد',
    phone: '+201001234567',
    age: 65,
    gender: 'male',
    bloodType: 'O+',
    adherenceRate: 0.85, // 85% adherence — good patient
    conditions: [
      { diseaseName: 'Type 2 Diabetes', diseaseNameAr: 'سكر من النوع الثاني', isChronic: true },
      { diseaseName: 'Hypertension', diseaseNameAr: 'ضغط دم مرتفع', isChronic: true }
    ]
  },
  {
    firstName: 'فاطمة',
    lastName: 'علي',
    phone: '+201001234568',
    age: 58,
    gender: 'female',
    bloodType: 'A+',
    adherenceRate: 0.55, // 55% — moderate
    conditions: [
      { diseaseName: 'Hypertension', diseaseNameAr: 'ضغط دم مرتفع', isChronic: true }
    ]
  },
  {
    firstName: 'خالد',
    lastName: 'إبراهيم',
    phone: '+201001234569',
    age: 72,
    gender: 'male',
    bloodType: 'B+',
    adherenceRate: 0.30, // 30% — poor adherence, needs intervention
    conditions: [
      { diseaseName: 'Type 2 Diabetes', diseaseNameAr: 'سكر من النوع الثاني', isChronic: true },
      { diseaseName: 'Heart Disease', diseaseNameAr: 'مرض قلبي', isChronic: true }
    ]
  }
];

const MEDICATIONS_DATA = [
  // For diabetes
  {
    name: 'Glucophage',
    nameAr: 'جلوكوفاج',
    formType: 'TABLET',
    isChronic: true,
    doseAmount: 1,
    unit: 'pill',
    timesOfDay: ['08:00', '20:00'],
    relationToMeals: 'AFTER_MEALS',
    notes: 'اشرب معاه كوباية مية كبيرة',
    forCondition: 'Type 2 Diabetes'
  },
  {
    name: 'Lantus',
    nameAr: 'لانتوس',
    formType: 'INJECTION',
    isChronic: true,
    doseAmount: 0.5,
    unit: 'ml',
    timesOfDay: ['22:00'],
    relationToMeals: 'NONE',
    notes: 'حقنة تحت الجلد قبل النوم',
    forCondition: 'Type 2 Diabetes'
  },
  // For hypertension
  {
    name: 'Concor',
    nameAr: 'كونكور',
    formType: 'TABLET',
    isChronic: true,
    doseAmount: 1,
    unit: 'pill',
    timesOfDay: ['08:00'],
    relationToMeals: 'BEFORE_MEALS',
    notes: 'مهم جداً ما تنساهوش',
    forCondition: 'Hypertension'
  },
  {
    name: 'Aspirin',
    nameAr: 'أسبرين',
    formType: 'TABLET',
    isChronic: true,
    doseAmount: 1,
    unit: 'pill',
    timesOfDay: ['21:00'],
    relationToMeals: 'AFTER_MEALS',
    notes: 'للوقاية من الجلطات',
    forCondition: 'Heart Disease'
  },
  {
    name: 'Crestor',
    nameAr: 'كريستور',
    formType: 'TABLET',
    isChronic: true,
    doseAmount: 1,
    unit: 'pill',
    timesOfDay: ['22:00'],
    relationToMeals: 'NONE',
    notes: 'للحد من الكوليسترول',
    forCondition: 'Heart Disease'
  }
];

const CAREGIVERS_DATA = [
  {
    firstName: 'أحمد',
    lastName: 'محمد',
    phone: '+201001234570',
    relation: 'son',
    patientIndex: 0 // son of patient 0 (محمد أحمد)
  },
  {
    firstName: 'سارة',
    lastName: 'علي',
    phone: '+201001234571',
    relation: 'daughter',
    patientIndex: 1 // daughter of patient 1 (فاطمة علي)
  }
];

const PHARMACY_DATA = {
  pharmacyName: 'صيدلية النور',
  ownerName: 'د.محمود سعيد',
  phone: '+201001234572',
  licenseNumber: 'PH-2026-001234',
  governorate: 'القاهرة',
  city: 'مدينة نصر',
  street: 'شارع عباس العقاد',
  buildingNumber: '42'
};

const DOCTOR_DATA = {
  fullName: 'د. سعيد محمد',
  phone: '+201001234573',
  specialty: 'endocrinology',
  syndicateId: 'MD-2026-56789',
  clinicName: 'عيادة الدكتور سعيد محمد',
  clinicGovernorate: 'القاهرة',
  clinicCity: 'مدينة نصر',
  clinicPhone: '+201001234574'
};

// ===== SEED FUNCTIONS =====

async function connectDB() {
  info('Connecting to MongoDB...');
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/wafa';

  try {
    await mongoose.connect(mongoUri);
    success('Connected to MongoDB');
  } catch (err) {
    console.error('❌ Failed to connect to MongoDB:', err.message);
    console.error('   Make sure MongoDB is running:');
    console.error('   - Local: mongod --port 27017');
    console.error('   - Docker: docker run -d -p 27017:27017 mongo:7.0');
    process.exit(1);
  }
}

async function cleanDB() {
  if (!shouldClean) return;
  info('Cleaning existing data...');

  await Promise.all([
    Account.deleteMany({}),
    Patient.deleteMany({}),
    Caregiver.deleteMany({}),
    Pharmacy.deleteMany({}),
    Doctor.deleteMany({}),
    MedicalCondition.deleteMany({}),
    Medication.deleteMany({}),
    DoseEvent.deleteMany({})
  ]);

  success('All collections cleared');
}

async function seedAdmin() {
  info('Creating super admin account...');

  const admin = new Account({
    phone: '+201001234500',
    email: 'admin@wafa.app',
    passwordHash: 'admin123456',
    role: 'ADMIN',
    adminLevel: 'super_admin',
    isActive: true,
    isPhoneVerified: true,
    consents: {
      termsAccepted: true,
      termsAcceptedAt: new Date(),
      privacyPolicyAccepted: true,
      privacyPolicyAcceptedAt: new Date()
    }
  });
  await admin.save();
  log('Created admin:', admin.email);
  success('Super admin created (email: admin@wafa.app, password: admin123456)');
  return admin;
}

async function seedPharmacy() {
  info('Creating pharmacy account...');

  const account = new Account({
    phone: PHARMACY_DATA.phone,
    role: 'PHARMACY',
    isActive: true,
    isPhoneVerified: true,
    consents: { termsAccepted: true, termsAcceptedAt: new Date(), privacyPolicyAccepted: true, privacyPolicyAcceptedAt: new Date() },
    subscription: {
      plan: 'pilot',
      status: 'trial',
      startDate: new Date(),
      isPilot: true
    }
  });
  await account.save();

  const pharmacy = new Pharmacy({
    accountId: account._id,
    pharmacyName: PHARMACY_DATA.pharmacyName,
    ownerName: PHARMACY_DATA.ownerName,
    phone: PHARMACY_DATA.phone,
    licenseNumber: PHARMACY_DATA.licenseNumber,
    address: {
      governorate: PHARMACY_DATA.governorate,
      city: PHARMACY_DATA.city,
      street: PHARMACY_DATA.street,
      buildingNumber: PHARMACY_DATA.buildingNumber,
      location: { type: 'Point', coordinates: [31.3656, 30.0566] }
    },
    settings: {
      autoReminder: true,
      refillAlertDays: 5,
      weeklyReport: true
    },
    isVerified: true,
    verifiedAt: new Date()
  });
  await pharmacy.save();

  log('Created pharmacy:', pharmacy.pharmacyName);
  success('Pharmacy created: ' + PHARMACY_DATA.pharmacyName);
  return pharmacy;
}

async function seedDoctor() {
  info('Creating doctor account...');

  const account = new Account({
    phone: DOCTOR_DATA.phone,
    role: 'DOCTOR',
    isActive: true,
    isPhoneVerified: true,
    whatsappOptIn: true,
    consents: { termsAccepted: true, termsAcceptedAt: new Date(), privacyPolicyAccepted: true, privacyPolicyAcceptedAt: new Date() },
    subscription: { plan: 'monthly', status: 'active', startDate: new Date() }
  });
  await account.save();

  const doctor = new Doctor({
    accountId: account._id,
    fullName: DOCTOR_DATA.fullName,
    phone: DOCTOR_DATA.phone,
    specialty: DOCTOR_DATA.specialty,
    syndicateId: DOCTOR_DATA.syndicateId,
    clinic: {
      name: DOCTOR_DATA.clinicName,
      address: { governorate: DOCTOR_DATA.clinicGovernorate, city: DOCTOR_DATA.clinicCity },
      phone: DOCTOR_DATA.clinicPhone
    },
    whatsappReport: {
      enabled: true,
      day: 'friday',
      time: '18:00',
      includeLowAdherence: true,
      includeRefillSoon: true,
      includeNewPatients: true
    },
    isVerified: true,
    verifiedAt: new Date()
  });
  await doctor.save();

  log('Created doctor:', doctor.fullName);
  success('Doctor created: ' + DOCTOR_DATA.fullName);
  return doctor;
}

async function seedPatients(pharmacy, doctor) {
  info('Creating patient accounts + profiles...');
  const patients = [];

  for (let i = 0; i < PATIENTS_DATA.length; i++) {
    const data = PATIENTS_DATA[i];

    const account = new Account({
      phone: data.phone,
      role: 'PATIENT',
      isActive: true,
      isPhoneVerified: true,
      consents: {
        termsAccepted: true,
        termsAcceptedAt: new Date(),
        privacyPolicyAccepted: true,
        privacyPolicyAcceptedAt: new Date(),
        caregiverAccess: true,
        doctorAccess: true,
        pharmacyAccess: true
      },
      subscription: { plan: 'free', status: 'active' }
    });
    await account.save();

    const patient = new Patient({
      accountId: account._id,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      dateOfBirth: new Date(Date.now() - data.age * 365 * 24 * 60 * 60 * 1000),
      gender: data.gender,
      bloodType: data.bloodType,
      primaryPharmacyId: pharmacy._id,
      emergencyContact: {
        name: 'أحد الأقارب',
        phone: '+201001234580',
        relation: 'son'
      },
      gamification: {
        currentStreak: data.adherenceRate > 0.5 ? randomInt(3, 14) : 0,
        longestStreak: randomInt(7, 30),
        totalDosesTaken: 0,
        totalDosesScheduled: 0,
        badges: data.adherenceRate > 0.7 ? [
          { type: 'first_week', awardedAt: daysAgo(14) },
          { type: 'streak_7', awardedAt: daysAgo(7) }
        ] : []
      }
    });
    await patient.save();

    // Link patient to pharmacy and doctor
    pharmacy.patientIds.push(patient._id);
    doctor.patientIds.push(patient._id);

    log(`Created patient ${i + 1}:`, patient.firstName, patient.lastName);
    patients.push({ ...data, _id: patient._id, accountId: account._id, patientDoc: patient });
  }

  await pharmacy.save();
  await doctor.save();

  success(`Created ${patients.length} patients`);
  return patients;
}

async function seedCaregivers(patients) {
  info('Creating caregiver accounts...');
  const caregivers = [];

  for (const cgData of CAREGIVERS_DATA) {
    const patient = patients[cgData.patientIndex];

    const account = new Account({
      phone: cgData.phone,
      role: 'CAREGIVER',
      isActive: true,
      isPhoneVerified: true,
      consents: { termsAccepted: true, termsAcceptedAt: new Date(), privacyPolicyAccepted: true, privacyPolicyAcceptedAt: new Date() },
      subscription: { plan: 'premium', status: 'active', startDate: daysAgo(30) }
    });
    await account.save();

    const caregiver = new Caregiver({
      accountId: account._id,
      firstName: cgData.firstName,
      lastName: cgData.lastName,
      phone: cgData.phone,
      patientIds: [patient._id],
      alertSettings: {
        instantMissed: true,
        dailySummary: true,
        weeklyReport: true,
        refillAlert: true,
        quietHoursStart: '22:00',
        quietHoursEnd: '06:00'
      },
      channels: { push: true, whatsapp: true, sms: false }
    });
    await caregiver.save();

    // Link caregiver to patient
    patient.patientDoc.caregiverIds.push(caregiver._id);
    await patient.patientDoc.save();

    log(`Created caregiver:`, caregiver.firstName, '→', patient.firstName);
    caregivers.push(caregiver);
  }

  success(`Created ${caregivers.length} caregivers`);
  return caregivers;
}

async function seedConditions(patients) {
  info('Creating medical conditions...');
  let total = 0;

  for (const patient of patients) {
    for (const condData of patient.conditions) {
      const condition = new MedicalCondition({
        patientId: patient._id,
        diseaseName: condData.diseaseName,
        diseaseNameAr: condData.diseaseNameAr,
        isChronic: condData.isChronic,
        diagnosedDate: daysAgo(randomInt(365, 1825)), // 1-5 years ago
        notes: 'تم التشخيص من قبل الطبيب المعالج',
        addedBy: patient.accountId
      });
      await condition.save();
      patient.conditionId = condition._id;
      total++;
      log(`  Condition: ${condData.diseaseName} → ${patient.firstName}`);
    }
  }

  success(`Created ${total} medical conditions`);
  return patients;
}

async function seedMedications(patients, pharmacy) {
  info('Creating medications...');
  let total = 0;
  const allMedications = [];

  for (const patient of patients) {
    // Get medications matching this patient's conditions
    const matchingMeds = MEDICATIONS_DATA.filter(med =>
      patient.conditions.some(c => c.diseaseName === med.forCondition)
    );

    for (const medData of matchingMeds) {
      // Vary the inventory — some need refill
      const daysOfSupply = randomChoice([2, 5, 10, 30, 60]);
      const dosesPerDay = medData.timesOfDay.length;
      const currentQuantity = daysOfSupply * dosesPerDay * medData.doseAmount;

      const medication = new Medication({
        patientId: patient._id,
        conditionId: patient.conditionId,
        addedBy: patient.accountId,
        name: medData.name,
        nameAr: medData.nameAr,
        formType: medData.formType,
        isChronic: medData.isChronic,
        inventory: {
          initialQuantity: 60,
          currentQuantity,
          doseAmount: medData.doseAmount,
          unit: medData.unit,
          refillThreshold: 5
        },
        instructions: {
          relationToMeals: medData.relationToMeals,
          notes: medData.notes
        },
        schedule: {
          frequency: 'DAILY',
          dosesPerDay,
          firstDoseTime: medData.timesOfDay[0],
          timesOfDay: medData.timesOfDay,
          startDate: daysAgo(90)
        },
        pharmacyId: pharmacy._id,
        expirationDate: daysFromNow(randomInt(180, 365)),
        isActive: true
      });
      await medication.save();
      allMedications.push(medication);
      total++;
      log(`  Medication: ${medData.name} → ${patient.firstName} (${currentQuantity} ${medData.unit} متبقي)`);
    }
  }

  success(`Created ${total} medications`);
  return allMedications;
}

async function seedDoseEvents(patients, medications) {
  info('Creating dose events for last 30 days...');
  let total = 0;
  let taken = 0;

  for (const patient of patients) {
    const patientMeds = medications.filter(m => m.patientId.equals(patient._id));

    for (const med of patientMeds) {
      // Generate events for last 30 days
      for (let dayOffset = 30; dayOffset >= 0; dayOffset--) {
        const date = daysAgo(dayOffset);
        date.setHours(0, 0, 0, 0);

        for (const timeStr of med.schedule.timesOfDay) {
          const [hours, minutes] = timeStr.split(':').map(Number);
          const scheduledFor = new Date(date);
          scheduledFor.setHours(hours, minutes, 0, 0);

          // Skip future events for today
          if (scheduledFor > new Date()) continue;

          // Determine status based on patient's adherence rate
          let status, takenAt = null;
          const random = Math.random();

          if (random < patient.adherenceRate) {
            status = 'TAKEN';
            takenAt = new Date(scheduledFor.getTime() + randomInt(0, 30) * 60 * 1000);
            taken++;
          } else if (random < patient.adherenceRate + 0.1) {
            status = 'SKIPPED';
          } else {
            status = 'MISSED';
          }

          const event = new DoseEvent({
            medicationId: med._id,
            patientId: patient._id,
            scheduledFor,
            status,
            takenAt,
            takenVia: status === 'TAKEN' ? 'PWA' : null,
            escalationState: status === 'MISSED' ? 'CAREGIVER_NOTIFIED' : 'NONE',
            batchGroup: hours < 11 ? 'morning' :
                       hours < 15 ? 'noon' :
                       hours < 19 ? 'evening' : 'night'
          });
          await event.save();
          total++;
        }
      }
    }
  }

  // Update medication stats
  for (const med of medications) {
    const events = await DoseEvent.find({ medicationId: med._id });
    med.stats.totalDosesScheduled = events.length;
    med.stats.totalDosesTaken = events.filter(e => e.status === 'TAKEN').length;
    med.stats.adherenceRate = events.length > 0
      ? Math.round((med.stats.totalDosesTaken / events.length) * 100)
      : 0;
    med.stats.lastDoseTakenAt = events.find(e => e.status === 'TAKEN')?.takenAt;
    med.stats.currentStreak = randomInt(0, 14);
    await med.save();
  }

  // Update patient gamification
  for (const patient of patients) {
    const events = await DoseEvent.find({ patientId: patient._id });
    patient.patientDoc.gamification.totalDosesScheduled = events.length;
    patient.patientDoc.gamification.totalDosesTaken = events.filter(e => e.status === 'TAKEN').length;
    await patient.patientDoc.save();
  }

  success(`Created ${total} dose events (${taken} taken, ${total - taken} missed/skipped)`);
}

// ===== MAIN =====

async function main() {
  console.log('========================================');
  console.log('💊 وفاء (Wafa) — Database Seed Script');
  console.log('========================================');

  if (shouldClean) warn('⚠️  --clean flag set: all existing data will be deleted');
  if (verbose) warn('Verbose mode enabled');

  await connectDB();
  await cleanDB();

  const admin = await seedAdmin();
  const pharmacy = await seedPharmacy();
  const doctor = await seedDoctor();
  const patients = await seedPatients(pharmacy, doctor);
  await seedCaregivers(patients);
  await seedConditions(patients);
  const medications = await seedMedications(patients, pharmacy);
  await seedDoseEvents(patients, medications);

  console.log('\n========================================');
  console.log('🎉 Seed completed successfully!');
  console.log('========================================\n');

  console.log('📋 Test Accounts (use these phones for OTP login):');
  console.log('  👑 Admin:    admin@wafa.app / admin123456');
  console.log('  💊 Pharmacy: +20 100 123 4572');
  console.log('  👨‍⚕️ Doctor:   +20 100 123 4573');
  PATIENTS_DATA.forEach((p, i) => {
    console.log(`  🧓 Patient ${i + 1}: ${p.firstName} ${p.lastName} — ${p.phone}`);
  });
  CAREGIVERS_DATA.forEach((c, i) => {
    console.log(`  👨‍👩‍👧 Caregiver ${i + 1}: ${c.firstName} ${c.lastName} — ${c.phone}`);
  });

  console.log('\n📊 Seed Summary:');
  console.log(`  • ${PATIENTS_DATA.length} patients (with varied adherence: 85%, 55%, 30%)`);
  console.log(`  • ${CAREGIVERS_DATA.length} caregivers (linked to patients)`);
  console.log(`  • 1 pharmacy (صيدلية النور)`);
  console.log(`  • 1 doctor (د. سعيد محمد)`);
  console.log(`  • ${MEDICATIONS_DATA.length} unique medication types`);
  console.log(`  • 30 days of dose events per medication\n`);

  await mongoose.connection.close();
  process.exit(0);
}

main().catch(err => {
  console.error('\n❌ Seed failed:', err);
  console.error(err.stack);
  process.exit(1);
});
