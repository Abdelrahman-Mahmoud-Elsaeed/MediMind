const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

// Models
const Account = require("./modules/auth/models/Account.model");
const Admin = require("./modules/auth/models/Admin.model");
const Patient = require("./modules/auth/models/Patient.model");
const Doctor = require("./modules/auth/models/Doctor.model");
const Pharmacist = require("./modules/auth/models/Pharmacist.model");
const FamilyCaregiver = require("./modules/auth/models/FamilyCaregiver.model");
const ProfessionalCaregiver = require("./modules/auth/models/ProfessionalCaregiver.model");
const MedicalCondition = require("./modules/conditions/models/MedicalCondition.model");
const Medication = require("./modules/medications/models/Medication.model");
const RefillOrder = require("./modules/medications/models/RefillOrder.model");
const DoseEvent = require("./modules/doses/models/DoseEvent.model");
const Relationship = require("./modules/relationships/models/Relationship.model");
const Notification = require("./modules/notifications/models/Notification.model");
const { MONGO_URI } = require("./config/env");

async function seed() {
  console.log("🚀 Starting Comprehensive MediMind Production-Grade Seed...");
  await mongoose.connect(MONGO_URI);
  const defaultPassword = "Password123!";

  // Clear existing collections for a clean, deterministic seed state
  console.log("🧹 Cleaning old seed collections...");
  await Promise.all([
    Account.deleteMany({}),
    Admin.deleteMany({}),
    Patient.deleteMany({}),
    Doctor.deleteMany({}),
    Pharmacist.deleteMany({}),
    FamilyCaregiver.deleteMany({}),
    ProfessionalCaregiver.deleteMany({}),
    MedicalCondition.deleteMany({}),
    Medication.deleteMany({}),
    RefillOrder.deleteMany({}),
    DoseEvent.deleteMany({}),
    Relationship.deleteMany({}),
    Notification.deleteMany({}),
  ]);

  const passwordHash = defaultPassword;

  // ---------------------------------------------------------------------------
  // 1. ADMIN ACCOUNTS
  // ---------------------------------------------------------------------------
  console.log("👤 Seeding Admins...");
  const adminAccount = await Account.create({
    email: "admin@medimind.io",
    passwordHash,
    role: "ADMIN",
    isEmailVerified: true,
    isPhoneVerified: true,
    isActive: true,
  });

  await Admin.create({
    accountId: adminAccount._id,
    firstName: "Super",
    lastName: "Admin",
    adminType: "super_admin",
    department: "Operations & Governance",
    permissions: ["*"],
  });

  // ---------------------------------------------------------------------------
  // 2. DOCTOR ACCOUNTS
  // ---------------------------------------------------------------------------
  console.log("🩺 Seeding Doctors...");
  const doctorSeedList = [
    {
      email: "doctor.smith@medimind.io",
      phone: "+20 100 888 1111",
      firstName: "Alexander",
      lastName: "Smith",
      specialty: "Cardiology",
      syndicateId: "DOC-SYND-9901",
      clinicName: "Cairo Heart & Vascular Center",
      governorate: "Cairo",
      city: "New Cairo",
      street: "Road 90 North",
      isVerified: true,
      title: "Consultant",
      bio: "Senior Consultant Cardiologist with 15+ years of clinical experience in hypertension and vascular care.",
    },
    {
      email: "doctor.layla@medimind.io",
      phone: "+20 101 777 2222",
      firstName: "Layla",
      lastName: "Nabil",
      specialty: "Endocrinology",
      syndicateId: "DOC-SYND-8802",
      clinicName: "Nile Endocrine & Diabetes Clinic",
      governorate: "Giza",
      city: "Mohandessin",
      street: "Batel El-Dossory St",
      isVerified: true,
      title: "Professor",
      bio: "Professor of Endocrinology specializing in Type 1 and Type 2 Diabetes management and insulin therapy.",
    },
    {
      email: "doctor.tariq@medimind.io",
      phone: "+20 102 666 3333",
      firstName: "Tariq",
      lastName: "Farouk",
      specialty: "Internal Medicine",
      syndicateId: "DOC-SYND-7703",
      clinicName: "Farouk Care Practice",
      governorate: "Alexandria",
      city: "Smouha",
      street: "Fawzy Moath St",
      isVerified: false, // Pending Admin Review
      title: "Specialist",
      bio: "Specialist in internal medicine and chronic care coordination.",
    },
  ];

  const doctorsMap = {};
  for (const docData of doctorSeedList) {
    const acc = await Account.create({
      email: docData.email,
      phone: docData.phone,
      passwordHash,
      role: "DOCTOR",
      isEmailVerified: true,
      isPhoneVerified: true,
      isActive: docData.isVerified,
    });

    const docProfile = await Doctor.create({
      accountId: acc._id,
      firstName: docData.firstName,
      lastName: docData.lastName,
      specialty: docData.specialty,
      syndicateId: docData.syndicateId,
      clinicName: docData.clinicName,
      clinicAddress: {
        governorate: docData.governorate,
        city: docData.city,
        street: docData.street,
      },
      location: {
        type: "Point",
        coordinates: [31.2357, 30.0444],
      },
      isVerified: docData.isVerified,
      title: docData.title,
      bio: docData.bio,
      experienceYears: 12,
      consultationFee: 400,
      subscription: { status: "active", startDate: new Date() },
    });

    doctorsMap[docData.email] = docProfile;
  }

  // ---------------------------------------------------------------------------
  // 3. PHARMACIST ACCOUNTS
  // ---------------------------------------------------------------------------
  console.log("💊 Seeding Pharmacies...");
  const pharmacySeedList = [
    {
      email: "pharmacy@medimind.io",
      phone: "+20 100 123 4567",
      pharmacyName: "MediMind Central Pharmacy",
      ownerName: "Dr. Karim Al-Saeed",
      licenseNumber: "PH-99201",
      governorate: "Cairo",
      city: "New Cairo",
      street: "90th Street",
      offersDelivery: true,
      isVerified: true,
    },
    {
      email: "elezaby@medimind.io",
      phone: "+20 19777",
      pharmacyName: "El-Ezaby Pharmacy (Mohandessin)",
      ownerName: "Dr. Ahmed El-Ezaby",
      licenseNumber: "PH-88412",
      governorate: "Giza",
      city: "Mohandessin",
      street: "Shehab Street",
      offersDelivery: true,
      isVerified: true,
    },
    {
      email: "seif@medimind.io",
      phone: "+20 19199",
      pharmacyName: "Seif Pharmacy (Smouha)",
      ownerName: "Dr. Mohamed Seif",
      licenseNumber: "PH-77309",
      governorate: "Alexandria",
      city: "Smouha",
      street: "Victor Emanuel St",
      offersDelivery: true,
      isVerified: true,
    },
    {
      email: "pending.pharmacy@medimind.io",
      phone: "+20 105 444 3322",
      pharmacyName: "Nour Community Pharmacy",
      ownerName: "Dr. Youssef Nour",
      licenseNumber: "PH-11005",
      governorate: "Cairo",
      city: "Nasr City",
      street: "Abbas El-Akkad St",
      offersDelivery: true,
      isVerified: false, // Pending Admin Approval
    },
  ];

  const pharmaciesList = [];
  for (const pSeed of pharmacySeedList) {
    const acc = await Account.create({
      email: pSeed.email,
      phone: pSeed.phone,
      passwordHash,
      role: "PHARMACIST",
      isEmailVerified: true,
      isPhoneVerified: true,
      isActive: pSeed.isVerified,
    });

    const pharmProfile = await Pharmacist.create({
      accountId: acc._id,
      pharmacyName: pSeed.pharmacyName,
      ownerName: pSeed.ownerName,
      licenseNumber: pSeed.licenseNumber,
      address: {
        governorate: pSeed.governorate,
        city: pSeed.city,
        street: pSeed.street,
      },
      location: { type: "Point", coordinates: [31.2357, 30.0444] },
      pharmacyPhone: pSeed.phone,
      offersDelivery: pSeed.offersDelivery,
      subscription: { status: pSeed.isVerified ? "active" : "pilot", startDate: new Date() },
    });

    pharmaciesList.push(pharmProfile);
  }
  const defaultPharmacy = pharmaciesList[0];

  // ---------------------------------------------------------------------------
  // 4. CAREGIVER ACCOUNTS (Family & Professional)
  // ---------------------------------------------------------------------------
  console.log("🤝 Seeding Caregivers...");
  const familyCaregiverSeedList = [
    { email: "caregiver1@medimind.io", phone: "+20 109 111 2233", firstName: "Nour", lastName: "Al-Sayed" },
    { email: "caregiver2@medimind.io", phone: "+20 109 222 3344", firstName: "Hassan", lastName: "Ibrahim" },
  ];

  const familyCaregivers = [];
  for (const fcData of familyCaregiverSeedList) {
    const acc = await Account.create({
      email: fcData.email,
      phone: fcData.phone,
      passwordHash,
      role: "FAMILY_CAREGIVER",
      isEmailVerified: true,
      isPhoneVerified: true,
      isActive: true,
    });

    const fcProfile = await FamilyCaregiver.create({
      accountId: acc._id,
      firstName: fcData.firstName,
      lastName: fcData.lastName,
      address: { street: "El-Tahrir St", city: "Cairo", country: "Egypt" },
    });

    familyCaregivers.push(fcProfile);
  }

  // Professional Caregivers
  const proCaregiverSeedList = [
    {
      email: "caregiver3@medimind.io",
      phone: "+20 109 333 4455",
      firstName: "Mona",
      lastName: "Farouk",
      licenseNumber: "NURSE-LIC-5501",
      specialties: ["Geriatric", "General Nursing"],
      hourlyRate: 150,
      isVerified: true,
    },
    {
      email: "pro.caregiver@medimind.io",
      phone: "+20 109 444 5566",
      firstName: "Ayman",
      lastName: "Mansour",
      licenseNumber: "NURSE-LIC-6602",
      specialties: ["Post-Surgery Recovery", "Palliative Care"],
      hourlyRate: 200,
      isVerified: false, // Pending Admin Approval
    },
  ];

  const proCaregivers = [];
  for (const pcData of proCaregiverSeedList) {
    const acc = await Account.create({
      email: pcData.email,
      phone: pcData.phone,
      passwordHash,
      role: "PROFESSIONAL_CAREGIVER",
      isEmailVerified: true,
      isPhoneVerified: true,
      isActive: pcData.isVerified,
    });

    const pcProfile = await ProfessionalCaregiver.create({
      accountId: acc._id,
      firstName: pcData.firstName,
      lastName: pcData.lastName,
      licenseNumber: pcData.licenseNumber,
      specialties: pcData.specialties,
      hourlyRate: pcData.hourlyRate,
      location: { type: "Point", coordinates: [31.2357, 30.0444] },
      isAvailable: true,
      experienceYears: 7,
      rating: 4.9,
    });

    proCaregivers.push(pcProfile);
  }

  // ---------------------------------------------------------------------------
  // 5. PATIENT ACCOUNTS, CONDITIONS, MEDICATIONS & DOSE LOGS
  // ---------------------------------------------------------------------------
  console.log("🏥 Seeding Patients, Medications, and Multi-Day Adherence History...");
  const patientsSeedInfo = [
    {
      email: "patient1@medimind.io",
      phone: "+1 (555) 012-3456",
      firstName: "Sarah",
      lastName: "Jenkins",
      dob: "1988-04-12",
      bloodType: "A+",
      height: 165,
      weight: 62,
      allergies: ["Penicillin", "Peanuts"],
      conditions: [
        { diseaseName: "Type 2 Diabetes", isChronic: true, notes: "Diagnosed 2021. Managed with Metformin." },
        { diseaseName: "Hypertension", isChronic: true, notes: "Monitor blood pressure daily." },
      ],
      meds: [
        { name: "Metformin ER", strength: "500mg", formType: "TABLET", frequency: "DAILY", dosesPerDay: 2, stock: 42, initial: 60, refillThresh: 10, meal: "AFTER_MEALS", relation: "Type 2 Diabetes", times: ["08:00", "20:00"] },
        { name: "Lisinopril", strength: "10mg", formType: "TABLET", frequency: "DAILY", dosesPerDay: 1, stock: 8, initial: 30, refillThresh: 10, meal: "BEFORE_MEALS", relation: "Hypertension", times: ["08:00"] },
        { name: "Atorvastatin", strength: "20mg", formType: "TABLET", frequency: "DAILY", dosesPerDay: 1, stock: 25, initial: 30, refillThresh: 5, meal: "WITH_FOOD", relation: "Hypertension", times: ["21:00"] },
      ],
    },
    {
      email: "patient2@medimind.io",
      phone: "+20 101 555 1234",
      firstName: "Ahmed",
      lastName: "Hassan",
      dob: "1975-09-20",
      bloodType: "O+",
      height: 178,
      weight: 84,
      allergies: ["Sulfa Drugs"],
      conditions: [
        { diseaseName: "Bronchial Asthma", isChronic: true, notes: "Requires rescue inhaler during severe cold." },
        { diseaseName: "High Cholesterol", isChronic: true, notes: "Low sodium and lipid diet." },
      ],
      meds: [
        { name: "Albuterol Inhaler", strength: "90mcg", formType: "OTHER", frequency: "AS_NEEDED", dosesPerDay: 1, stock: 120, initial: 200, refillThresh: 20, meal: "NONE", relation: "Bronchial Asthma", times: ["09:00"] },
        { name: "Rosuvastatin", strength: "10mg", formType: "TABLET", frequency: "DAILY", dosesPerDay: 1, stock: 4, initial: 30, refillThresh: 7, meal: "AFTER_MEALS", relation: "High Cholesterol", times: ["20:00"] },
      ],
    },
    {
      email: "patient3@medimind.io",
      phone: "+971 50 987 6543",
      firstName: "Fatima",
      lastName: "Al-Mansoor",
      dob: "1992-11-05",
      bloodType: "B+",
      height: 160,
      weight: 58,
      allergies: ["Aspirin"],
      conditions: [
        { diseaseName: "Migraine with Aura", isChronic: true, notes: "Triggers include stress and bright light." },
      ],
      meds: [
        { name: "Sumatriptan", strength: "50mg", formType: "TABLET", frequency: "AS_NEEDED", dosesPerDay: 1, stock: 6, initial: 10, refillThresh: 2, meal: "ON_EMPTY_STOMACH", relation: "Migraine with Aura", times: ["10:00"] },
        { name: "Magnesium Glycinate", strength: "400mg", formType: "CAPSULE", frequency: "DAILY", dosesPerDay: 1, stock: 55, initial: 90, refillThresh: 15, meal: "WITH_FOOD", relation: "Migraine with Aura", times: ["21:00"] },
      ],
    },
    {
      email: "patient4@medimind.io",
      phone: "+20 112 444 8899",
      firstName: "Omar",
      lastName: "Khaled",
      dob: "1968-01-30",
      bloodType: "AB+",
      height: 172,
      weight: 79,
      allergies: [],
      conditions: [
        { diseaseName: "Rheumatoid Arthritis", isChronic: true, notes: "Morning stiffness." },
        { diseaseName: "Gastroesophageal Reflux (GERD)", isChronic: true, notes: "Avoid acidic food." },
      ],
      meds: [
        { name: "Methotrexate", strength: "2.5mg", formType: "TABLET", frequency: "WEEKLY", dosesPerDay: 1, stock: 16, initial: 24, refillThresh: 4, meal: "AFTER_MEALS", relation: "Rheumatoid Arthritis", times: ["08:00"] },
        { name: "Omeprazole", strength: "20mg", formType: "CAPSULE", frequency: "DAILY", dosesPerDay: 1, stock: 2, initial: 30, refillThresh: 5, meal: "BEFORE_MEALS", relation: "Gastroesophageal Reflux (GERD)", times: ["07:30"] },
      ],
    },
    {
      email: "patient5@medimind.io",
      phone: "+1 (555) 321-9876",
      firstName: "Maria",
      lastName: "Garcia",
      dob: "1995-07-14",
      bloodType: "O-",
      height: 168,
      weight: 64,
      allergies: ["Ibuprofen"],
      conditions: [
        { diseaseName: "Hypothyroidism", isChronic: true, notes: "Take Levothyroxine first thing in the morning." },
      ],
      meds: [
        { name: "Levothyroxine", strength: "75mcg", formType: "TABLET", frequency: "DAILY", dosesPerDay: 1, stock: 22, initial: 30, refillThresh: 7, meal: "ON_EMPTY_STOMACH", relation: "Hypothyroidism", times: ["07:00"] },
      ],
    },
  ];

  for (const info of patientsSeedInfo) {
    const acc = await Account.create({
      email: info.email,
      phone: info.phone,
      passwordHash,
      role: "PATIENT",
      isEmailVerified: true,
      isPhoneVerified: true,
      isActive: true,
    });

    const patient = await Patient.create({
      accountId: acc._id,
      firstName: info.firstName,
      lastName: info.lastName,
      dateOfBirth: new Date(info.dob),
      bloodType: info.bloodType,
      height: info.height,
      weight: info.weight,
      allergies: info.allergies,
      emergencyContact: [
        { name: "Family Support", phone: info.phone },
      ],
      address: [
        {
          street: "123 Healthcare Blvd",
          city: "Cairo",
          state: "Cairo",
          postalCode: "11511",
          country: "Egypt",
        },
      ],
      preferredLanguage: "en",
      consents: { familyCaregiver: true, professionalCaregiver: true, doctor: true, pharmacy: true },
    });

    // Create Conditions
    const createdConditionsMap = {};
    for (const cond of info.conditions) {
      const condition = await MedicalCondition.create({
        patientId: patient._id,
        diseaseName: cond.diseaseName,
        isChronic: cond.isChronic,
        diagnosedDate: new Date("2023-01-15"),
        notes: cond.notes,
      });
      createdConditionsMap[cond.diseaseName] = condition;
    }

    // Create Medications
    const createdMeds = [];
    for (const med of info.meds) {
      const matchedCondition = createdConditionsMap[med.relation] || Object.values(createdConditionsMap)[0];

      const medication = await Medication.create({
        patientId: patient._id,
        conditionId: matchedCondition ? matchedCondition._id : null,
        addedBy: acc._id,
        name: med.name,
        formType: med.formType,
        isChronic: true,
        inventory: {
          initialQuantity: med.initial,
          currentQuantity: med.stock,
          doseAmount: 1,
          refillThreshold: med.refillThresh,
        },
        instructions: {
          relationToMeals: med.meal,
          notes: `Take with water. Dosage: ${med.strength}`,
        },
        schedule: {
          frequency: med.frequency,
          dosesPerDay: med.dosesPerDay,
          firstDoseTime: med.times[0] || "08:00",
          timesOfDay: med.times,
          startDate: new Date("2025-01-01"),
        },
        expirationDate: new Date("2027-12-31"),
        isActive: true,
      });

      createdMeds.push(medication);
    }

    // -------------------------------------------------------------------------
    // Generate Realistic Dose Events over 5 Days History (Past 4 Days + Today)
    // -------------------------------------------------------------------------
    const now = new Date();

    for (const med of createdMeds) {
      const timesOfDay = med.schedule.timesOfDay || [med.schedule.firstDoseTime || "08:00"];

      for (let dayOffset = -4; dayOffset <= 1; dayOffset++) {
        for (const timeStr of timesOfDay) {
          const [hour, min] = timeStr.split(":").map(Number);
          const doseDate = new Date(now);
          doseDate.setDate(now.getDate() + dayOffset);
          doseDate.setHours(hour, min, 0, 0);

          let status = "PENDING";
          let takenAt = null;

          if (dayOffset < 0) {
            // Past days history: 85% TAKEN, 10% MISSED, 5% SKIPPED
            const rand = (Math.abs(dayOffset) + hour) % 10;
            if (rand === 0) {
              status = "MISSED";
            } else if (rand === 1) {
              status = "SKIPPED";
            } else {
              status = "TAKEN";
              // Took medication 5-15 mins after scheduled time
              takenAt = new Date(doseDate.getTime() + (rand * 2 + 3) * 60 * 1000);
            }
          } else if (dayOffset === 0) {
            // Today's doses
            const isPastHour = doseDate.getTime() <= now.getTime();
            if (isPastHour) {
              status = "TAKEN";
              takenAt = new Date(doseDate.getTime() + 5 * 60 * 1000);
            } else {
              status = "PENDING";
            }
          } else {
            // Tomorrow's doses
            status = "PENDING";
          }

          await DoseEvent.create({
            medicationId: med._id,
            patientId: patient._id,
            scheduledFor: doseDate,
            status,
            takenAt,
            source: "manual",
          });
        }
      }
    }

    // -------------------------------------------------------------------------
    // Seed Caregiver Relationships
    // -------------------------------------------------------------------------
    if (familyCaregivers.length > 0) {
      // Connect patient to Nour Al-Sayed (ACCEPTED) and Hassan Ibrahim (PENDING)
      await Relationship.create({
        patientId: patient._id,
        caregiverId: familyCaregivers[0]._id,
        caregiverType: "FamilyCaregiver",
        relation: "Family Member & Primary Caregiver",
        status: "ACCEPTED",
        initiatedBy: "CAREGIVER",
        permissions: {
          canViewMedications: true,
          canAddMedication: true,
          canEditMedication: true,
          canDeleteMedication: true,
          canViewMedicalRecords: true,
          canEditMedicalRecords: true,
          canViewDoseSchedule: true,
          canConfirmDose: true,
          canOrderRefills: true,
          canReceiveNotifications: true,
        },
      });

      if (info.email === "patient1@medimind.io" || info.email === "patient2@medimind.io") {
        await Relationship.create({
          patientId: patient._id,
          caregiverId: familyCaregivers[1]._id,
          caregiverType: "FamilyCaregiver",
          relation: "Secondary Caregiver",
          status: "PENDING",
          initiatedBy: "PATIENT",
          permissions: {
            canViewMedications: true,
            canAddMedication: false,
            canEditMedication: false,
            canDeleteMedication: false,
            canViewMedicalRecords: true,
            canEditMedicalRecords: false,
            canViewDoseSchedule: true,
            canConfirmDose: false,
            canOrderRefills: false,
            canReceiveNotifications: true,
          },
        });
      }
    }

    // -------------------------------------------------------------------------
    // Seed Refill Orders
    // -------------------------------------------------------------------------
    const refillStatuses = ["SUBMITTED", "APPROVED", "DISPENSED", "COMPLETED"];
    let statusIndex = 0;

    for (const med of createdMeds) {
      if (med.inventory.currentQuantity <= med.inventory.refillThreshold + 5) {
        const orderStatus = refillStatuses[statusIndex % refillStatuses.length];
        statusIndex++;

        await RefillOrder.create({
          patientId: patient._id,
          medicationId: med._id,
          requestedBy: acc._id,
          targetPharmacyId: defaultPharmacy._id,
          orderStatus,
          fulfillmentType: statusIndex % 2 === 0 ? "DELIVERY" : "PICKUP",
          deliveryAddress: { street: "123 Healthcare Blvd", city: "Cairo", zipCode: "11511" },
          quantityRequested: med.inventory.initialQuantity || 30,
          pharmacistNotes:
            orderStatus === "APPROVED"
              ? "تمت مراجعة الوصفة وتخصيص الدواء للصرف."
              : orderStatus === "DISPENSED"
                ? "تم تجهيز وتغليف العبوة بنجاح."
                : orderStatus === "COMPLETED"
                  ? "تم استلام الدواء وتحديث الخزانة."
                  : "طلب إعادة تعبئة بانتظار المراجعة.",
        });
      }
    }

    // -------------------------------------------------------------------------
    // Seed Notifications
    // -------------------------------------------------------------------------
    await Notification.create({
      recipientId: acc._id,
      recipientAccountId: acc._id,
      type: "DOSE_REMINDER",
      recipientRole: "PATIENT",
      title: "Medication Due Reminder",
      titleAr: "تذكير بموعد الدواء",
      message: `Reminder to take ${createdMeds[0]?.name || "your medication"}.`,
      messageAr: `تذكير بموعد تناول ${createdMeds[0]?.name || "الدواء"}.`,
      isRead: false,
      data: { medicationId: createdMeds[0]?._id },
    });

    await Notification.create({
      recipientId: acc._id,
      recipientAccountId: acc._id,
      type: "REFILL_ORDER_UPDATED",
      recipientRole: "PATIENT",
      title: "Pharmacy Refill Order Status",
      titleAr: "تحديث طلب صيدلية",
      message: `Your refill order for ${createdMeds[0]?.name || "medication"} is currently being processed by MediMind Central Pharmacy.`,
      messageAr: `طلب إعادة تعبئة ${createdMeds[0]?.name || "الدواء"} قيد المراجعة في صيدلية MediMind Central.`,
      isRead: true,
      data: { medicationId: createdMeds[0]?._id },
    });
  }

  console.log("✅ SUCCESS! Comprehensive MediMind database seeded with multi-day realistic adherence, caregiver networks, pharmacies, doctor profiles, and refill orders!");
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Error seeding data:", err);
  process.exit(1);
});
