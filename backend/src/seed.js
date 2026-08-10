const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

// Models
const Account = require("./modules/auth/models/Account.model");
const Admin = require("./modules/auth/models/Admin.model");
const Patient = require("./modules/auth/models/Patient.model");
const FamilyCaregiver = require("./modules/auth/models/FamilyCaregiver.model");
const Pharmacist = require("./modules/auth/models/Pharmacist.model");
const MedicalCondition = require("./modules/conditions/models/MedicalCondition.model");
const Medication = require("./modules/medications/models/Medication.model");
const RefillOrder = require("./modules/medications/models/RefillOrder.model");
const DoseEvent = require("./modules/doses/models/DoseEvent.model");
const Relationship = require("./modules/relationships/models/Relationship.model");
const { MONGO_URI } = require("./config/env");

async function seed() {
  console.log("Starting idempotent MediMind Patient Module Seed...");
  await mongoose.connect(MONGO_URI);
  const defaultPassword = "Password123!";

  // Reset existing accounts to ensure pre("save") hook hashes Password123! once
  const existingAccounts = await Account.find({});
  for (const acc of existingAccounts) {
    acc.passwordHash = defaultPassword;
    await acc.save();
  }

  // 0. Create Super Admin Account
  let adminAccount = await Account.findOne({ email: "admin@medimind.io" });
  if (!adminAccount) {
    adminAccount = await Account.create({
      email: "admin@medimind.io",
      passwordHash: defaultPassword,
      role: "ADMIN",
      isEmailVerified: true,
      isActive: true,
    });
  }

  let adminProfile = await Admin.findOne({ accountId: adminAccount._id });
  if (!adminProfile) {
    await Admin.create({
      accountId: adminAccount._id,
      firstName: "Super",
      lastName: "Admin",
      adminType: "super_admin",
      department: "Operations",
      permissions: ["*"],
    });
  }

  // 1. Create Default Pharmacist (for Refill Orders)
  let pharmAccount = await Account.findOne({ email: "pharmacy@medimind.io" });
  if (!pharmAccount) {
    pharmAccount = await Account.create({
      email: "pharmacy@medimind.io",
      passwordHash: defaultPassword,
      role: "PHARMACIST",
      isEmailVerified: true,
      isActive: true,
    });
  }

  let pharmacist = await Pharmacist.findOne({ accountId: pharmAccount._id });
  if (!pharmacist) {
    pharmacist = await Pharmacist.create({
      accountId: pharmAccount._id,
      pharmacyName: "MediMind Central Pharmacy",
      ownerName: "Dr. Karim Al-Saeed",
      licenseNumber: "PH-99201",
      address: {
        governorate: "Cairo",
        city: "New Cairo",
        street: "90th Street",
      },
      location: {
        type: "Point",
        coordinates: [31.2357, 30.0444],
      },
      pharmacyPhone: "+20 100 123 4567",
      offersDelivery: true,
    });
  }

  // 1.1 Create Additional Partner Pharmacies
  const partnerPharmaciesSeed = [
    {
      email: "elezaby@medimind.io",
      pharmacyName: "El-Ezaby Pharmacy (Mohandessin)",
      ownerName: "Dr. Ahmed El-Ezaby",
      licenseNumber: "PH-88412",
      address: { governorate: "Giza", city: "Mohandessin", street: "Shehab Street" },
      location: { type: "Point", coordinates: [31.2007, 30.0524] },
      pharmacyPhone: "+20 19777",
      offersDelivery: true,
    },
    {
      email: "seif@medimind.io",
      pharmacyName: "Seif Pharmacy (Smouha)",
      ownerName: "Dr. Mohamed Seif",
      licenseNumber: "PH-77309",
      address: { governorate: "Alexandria", city: "Smouha", street: "Victor Emanuel St" },
      location: { type: "Point", coordinates: [29.9553, 31.2156] },
      pharmacyPhone: "+20 19199",
      offersDelivery: true,
    },
    {
      email: "carecure@medimind.io",
      pharmacyName: "Care & Cure Pharmacy (Maadi)",
      ownerName: "Dr. Mona El-Shazly",
      licenseNumber: "PH-66104",
      address: { governorate: "Cairo", city: "Maadi", street: "Road 9" },
      location: { type: "Point", coordinates: [31.2585, 29.9602] },
      pharmacyPhone: "+20 102 999 8877",
      offersDelivery: false,
    },
  ];

  for (const pSeed of partnerPharmaciesSeed) {
    let pAcc = await Account.findOne({ email: pSeed.email });
    if (!pAcc) {
      pAcc = await Account.create({
        email: pSeed.email,
        passwordHash: defaultPassword,
        role: "PHARMACIST",
        isEmailVerified: true,
        isActive: true,
      });
    }
    let pProfile = await Pharmacist.findOne({ accountId: pAcc._id });
    if (!pProfile) {
      await Pharmacist.create({
        accountId: pAcc._id,
        pharmacyName: pSeed.pharmacyName,
        ownerName: pSeed.ownerName,
        licenseNumber: pSeed.licenseNumber,
        address: pSeed.address,
        location: pSeed.location,
        pharmacyPhone: pSeed.pharmacyPhone,
        offersDelivery: pSeed.offersDelivery,
      });
    }
  }

  // 2. Create 2 Caregivers (for Relationships)
  const caregiverData = [
    { email: "caregiver1@medimind.io", firstName: "Nour", lastName: "Al-Sayed" },
    { email: "caregiver2@medimind.io", firstName: "Hassan", lastName: "Ibrahim" },
  ];

  const caregiverDocs = [];
  for (const cg of caregiverData) {
    let cgAcc = await Account.findOne({ email: cg.email });
    if (!cgAcc) {
      cgAcc = await Account.create({
        email: cg.email,
        passwordHash: defaultPassword,
        role: "FAMILY_CAREGIVER",
        isEmailVerified: true,
        isActive: true,
      });
    }

    let cgProfile = await FamilyCaregiver.findOne({ accountId: cgAcc._id });
    if (!cgProfile) {
      cgProfile = await FamilyCaregiver.create({
        accountId: cgAcc._id,
        firstName: cg.firstName,
        lastName: cg.lastName,
        address: { street: "El-Tahrir St", city: "Cairo", country: "Egypt" },
      });
    }
    caregiverDocs.push(cgProfile);
  }

  // 3. Create 10 Patient Accounts & Complete Datasets
  const patientsSeedInfo = [
    {
      email: "patient1@medimind.io",
      firstName: "Sarah",
      lastName: "Jenkins",
      dob: "1988-04-12",
      bloodType: "A+",
      height: 165,
      weight: 62,
      allergies: ["Penicillin", "Peanuts"],
      phone: "+1 (555) 012-3456",
      conditions: [
        { diseaseName: "Type 2 Diabetes", isChronic: true, notes: "Diagnosed 2021. Managed with Metformin." },
        { diseaseName: "Hypertension", isChronic: true, notes: "Monitor blood pressure daily." },
      ],
      meds: [
        { name: "Metformin ER", strength: "500mg", formType: "TABLET", frequency: "DAILY", dosesPerDay: 2, stock: 45, initial: 60, refillThresh: 10, meal: "AFTER_MEALS", relation: "Diabetes" },
        { name: "Lisinopril", strength: "10mg", formType: "TABLET", frequency: "DAILY", dosesPerDay: 1, stock: 8, initial: 30, refillThresh: 10, meal: "BEFORE_MEALS", relation: "Hypertension" },
        { name: "Atorvastatin", strength: "20mg", formType: "TABLET", frequency: "DAILY", dosesPerDay: 1, stock: 25, initial: 30, refillThresh: 5, meal: "WITH_FOOD", relation: "Hypertension" },
      ],
    },
    {
      email: "patient2@medimind.io",
      firstName: "Ahmed",
      lastName: "Hassan",
      dob: "1975-09-20",
      bloodType: "O+",
      height: 178,
      weight: 84,
      allergies: ["Sulfa Drugs"],
      phone: "+20 101 555 1234",
      conditions: [
        { diseaseName: "Bronchial Asthma", isChronic: true, notes: "Requires rescue inhaler during severe cold." },
        { diseaseName: "High Cholesterol", isChronic: true, notes: "Low sodium and lipid diet." },
      ],
      meds: [
        { name: "Albuterol Inhaler", strength: "90mcg", formType: "OTHER", frequency: "AS_NEEDED", dosesPerDay: 1, stock: 120, initial: 200, refillThresh: 20, meal: "NONE", relation: "Bronchial Asthma" },
        { name: "Rosuvastatin", strength: "10mg", formType: "TABLET", frequency: "DAILY", dosesPerDay: 1, stock: 4, initial: 30, refillThresh: 7, meal: "AFTER_MEALS", relation: "High Cholesterol" },
      ],
    },
    {
      email: "patient3@medimind.io",
      firstName: "Fatima",
      lastName: "Al-Mansoor",
      dob: "1992-11-05",
      bloodType: "B+",
      height: 160,
      weight: 58,
      allergies: ["Aspirin"],
      phone: "+971 50 987 6543",
      conditions: [
        { diseaseName: "Migraine with Aura", isChronic: true, notes: "Triggers include stress and bright light." },
      ],
      meds: [
        { name: "Sumatriptan", strength: "50mg", formType: "TABLET", frequency: "AS_NEEDED", dosesPerDay: 1, stock: 6, initial: 10, refillThresh: 2, meal: "ON_EMPTY_STOMACH", relation: "Migraine with Aura" },
        { name: "Magnesium Glycinate", strength: "400mg", formType: "CAPSULE", frequency: "DAILY", dosesPerDay: 1, stock: 60, initial: 90, refillThresh: 15, meal: "WITH_FOOD", relation: "Migraine with Aura" },
      ],
    },
    {
      email: "patient4@medimind.io",
      firstName: "Omar",
      lastName: "Khaled",
      dob: "1968-01-30",
      bloodType: "AB+",
      height: 172,
      weight: 79,
      allergies: [],
      phone: "+20 112 444 8899",
      conditions: [
        { diseaseName: "Rheumatoid Arthritis", isChronic: true, notes: "Morning stiffness." },
        { diseaseName: "Gastroesophageal Reflux (GERD)", isChronic: true, notes: "Avoid acidic food." },
      ],
      meds: [
        { name: "Methotrexate", strength: "2.5mg", formType: "TABLET", frequency: "WEEKLY", dosesPerDay: 1, stock: 16, initial: 24, refillThresh: 4, meal: "AFTER_MEALS", relation: "Rheumatoid Arthritis" },
        { name: "Omeprazole", strength: "20mg", formType: "CAPSULE", frequency: "DAILY", dosesPerDay: 1, stock: 2, initial: 30, refillThresh: 5, meal: "BEFORE_MEALS", relation: "Gastroesophageal Reflux (GERD)" },
      ],
    },
    {
      email: "patient5@medimind.io",
      firstName: "Maria",
      lastName: "Garcia",
      dob: "1995-07-14",
      bloodType: "O-",
      height: 168,
      weight: 64,
      allergies: ["Ibuprofen"],
      phone: "+1 (555) 321-9876",
      conditions: [
        { diseaseName: "Hypothyroidism", isChronic: true, notes: "Take Levothyroxine first thing in the morning." },
      ],
      meds: [
        { name: "Levothyroxine", strength: "75mcg", formType: "TABLET", frequency: "DAILY", dosesPerDay: 1, stock: 22, initial: 30, refillThresh: 7, meal: "ON_EMPTY_STOMACH", relation: "Hypothyroidism" },
      ],
    },
    {
      email: "patient6@medimind.io",
      firstName: "James",
      lastName: "Wilson",
      dob: "1983-03-22",
      bloodType: "A-",
      height: 182,
      weight: 90,
      allergies: ["Codeine"],
      phone: "+1 (555) 888-2211",
      conditions: [
        { diseaseName: "Generalized Anxiety Disorder", isChronic: true, notes: "Therapy + daily SSRI." },
      ],
      meds: [
        { name: "Sertraline", strength: "50mg", formType: "TABLET", frequency: "DAILY", dosesPerDay: 1, stock: 18, initial: 30, refillThresh: 5, meal: "WITH_FOOD", relation: "Generalized Anxiety Disorder" },
      ],
    },
    {
      email: "patient7@medimind.io",
      firstName: "Layla",
      lastName: "Mahmoud",
      dob: "2000-06-18",
      bloodType: "B-",
      height: 163,
      weight: 55,
      allergies: [],
      phone: "+20 102 777 3344",
      conditions: [
        { diseaseName: "Iron Deficiency Anemia", isChronic: false, notes: "3-month course of oral iron." },
      ],
      meds: [
        { name: "Ferrous Sulfate", strength: "325mg", formType: "TABLET", frequency: "DAILY", dosesPerDay: 1, stock: 40, initial: 60, refillThresh: 10, meal: "AFTER_MEALS", relation: "Iron Deficiency Anemia" },
        { name: "Vitamin C", strength: "500mg", formType: "TABLET", frequency: "DAILY", dosesPerDay: 1, stock: 40, initial: 60, refillThresh: 10, meal: "WITH_FOOD", relation: "Iron Deficiency Anemia" },
      ],
    },
    {
      email: "patient8@medimind.io",
      firstName: "Tariq",
      lastName: "Ziad",
      dob: "1979-12-01",
      bloodType: "AB-",
      height: 175,
      weight: 81,
      allergies: ["Latex"],
      phone: "+966 50 111 2233",
      conditions: [
        { diseaseName: "Coronary Artery Disease", isChronic: true, notes: "Post-stent management." },
      ],
      meds: [
        { name: "Clopidogrel", strength: "75mg", formType: "TABLET", frequency: "DAILY", dosesPerDay: 1, stock: 14, initial: 30, refillThresh: 5, meal: "AFTER_MEALS", relation: "Coronary Artery Disease" },
        { name: "Aspirin Protect", strength: "100mg", formType: "TABLET", frequency: "DAILY", dosesPerDay: 1, stock: 14, initial: 30, refillThresh: 5, meal: "AFTER_MEALS", relation: "Coronary Artery Disease" },
      ],
    },
    {
      email: "patient9@medimind.io",
      firstName: "Emily",
      lastName: "Chen",
      dob: "1991-08-15",
      bloodType: "O+",
      height: 162,
      weight: 59,
      allergies: ["Dairy"],
      phone: "+1 (555) 666-4433",
      conditions: [
        { diseaseName: "Seasonal Allergies", isChronic: false, notes: "Spring/Autumn flareups." },
      ],
      meds: [
        { name: "Cetirizine", strength: "10mg", formType: "TABLET", frequency: "DAILY", dosesPerDay: 1, stock: 15, initial: 30, refillThresh: 5, meal: "NONE", relation: "Seasonal Allergies" },
      ],
    },
    {
      email: "patient10@medimind.io",
      firstName: "Youssef",
      lastName: "Ibrahim",
      dob: "1972-05-25",
      bloodType: "A+",
      height: 180,
      weight: 86,
      allergies: [],
      phone: "+20 111 999 5566",
      conditions: [
        { diseaseName: "Osteoarthritis", isChronic: true, notes: "Knee pain." },
      ],
      meds: [
        { name: "Meloxicam", strength: "15mg", formType: "TABLET", frequency: "DAILY", dosesPerDay: 1, stock: 10, initial: 30, refillThresh: 5, meal: "AFTER_MEALS", relation: "Osteoarthritis" },
        { name: "Glucosamine Chondroitin", strength: "1500mg", formType: "CAPSULE", frequency: "DAILY", dosesPerDay: 2, stock: 30, initial: 60, refillThresh: 10, meal: "WITH_FOOD", relation: "Osteoarthritis" },
      ],
    },
  ];

  for (const info of patientsSeedInfo) {
    let account = await Account.findOne({ email: info.email });
    if (!account) {
      account = await Account.create({
        email: info.email,
        phone: info.phone,
        passwordHash: defaultPassword,
        role: "PATIENT",
        isEmailVerified: true,
        isPhoneVerified: true,
        isActive: true,
      });
    }

    let patient = await Patient.findOne({ accountId: account._id });
    if (!patient) {
      patient = await Patient.create({
        accountId: account._id,
        firstName: info.firstName,
        lastName: info.lastName,
        dateOfBirth: new Date(info.dob),
        bloodType: info.bloodType,
        height: info.height,
        weight: info.weight,
        allergies: info.allergies,
        emergencyContact: [
          { name: "Emergency Contact 1", phone: info.phone },
          { name: "Emergency Contact 2", phone: "+1 (555) 999-0000" },
        ],
        address: [
          {
            street: "123 Health Ave",
            city: "Cairo",
            state: "Cairo",
            postalCode: "11511",
            country: "Egypt",
          },
        ],
        preferredLanguage: "en",
        consents: { familyCaregiver: true, professionalCaregiver: false, doctor: true, pharmacy: true },
      });
    }

    // Seed Conditions
    const createdConditions = [];
    for (const cond of info.conditions) {
      let condition = await MedicalCondition.findOne({
        patientId: patient._id,
        diseaseName: cond.diseaseName,
      });
      if (!condition) {
        condition = await MedicalCondition.create({
          patientId: patient._id,
          diseaseName: cond.diseaseName,
          isChronic: cond.isChronic,
          diagnosedDate: new Date("2023-01-15"),
          notes: cond.notes,
        });
      }
      createdConditions.push(condition);
    }

    // Seed Medications
    const createdMeds = [];
    for (const med of info.meds) {
      let medication = await Medication.findOne({
        patientId: patient._id,
        name: med.name,
      });

      const matchedCondition = createdConditions.find((c) => c.diseaseName === med.relation) || createdConditions[0];

      if (!medication) {
        medication = await Medication.create({
          patientId: patient._id,
          conditionId: matchedCondition ? matchedCondition._id : null,
          addedBy: account._id,
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
            notes: `Take with water. ${med.strength}`,
          },
          schedule: {
            frequency: med.frequency,
            dosesPerDay: med.dosesPerDay,
            firstDoseTime: "08:00",
            timesOfDay: med.dosesPerDay === 2 ? ["08:00", "20:00"] : ["08:00"],
            startDate: new Date("2024-01-01"),
          },
          expirationDate: new Date("2027-12-31"),
          isActive: true,
        });
      }
      createdMeds.push(medication);
    }

    // Seed Dose Events (Past 7 days, Today, Next 7 days)
    for (const med of createdMeds) {
      const existingDose = await DoseEvent.findOne({ medicationId: med._id, patientId: patient._id });
      if (!existingDose) {
        const today = new Date();
        for (let dayOffset = -7; dayOffset <= 7; dayOffset++) {
          const doseDate = new Date(today);
          doseDate.setDate(today.getDate() + dayOffset);
          doseDate.setHours(8, 0, 0, 0);

          let status = "PENDING";
          let takenAt = null;

          if (dayOffset < 0) {
            // Past doses
            status = dayOffset % 4 === 0 ? "MISSED" : "TAKEN";
            takenAt = status === "TAKEN" ? doseDate : null;
          } else if (dayOffset === 0) {
            status = "TAKEN";
            takenAt = new Date();
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

    // Seed Relationships
    if (caregiverDocs.length > 0) {
      const cg1 = caregiverDocs[0];
      const rel1 = await Relationship.findOne({ patientId: patient._id, caregiverId: cg1._id });
      if (!rel1) {
        await Relationship.create({
          patientId: patient._id,
          caregiverId: cg1._id,
          caregiverType: "FamilyCaregiver",
          relation: "Family Member",
          status: "ACCEPTED",
          permissions: { canAddMedication: true, canEditMedication: true, canDeleteMedication: true, canViewMedicalRecords: true, canOrderRefills: true },
        });
      }

      if (caregiverDocs.length > 1) {
        const cg2 = caregiverDocs[1];
        const rel2 = await Relationship.findOne({ patientId: patient._id, caregiverId: cg2._id });
        if (!rel2) {
          await Relationship.create({
            patientId: patient._id,
            caregiverId: cg2._id,
            caregiverType: "FamilyCaregiver",
            relation: "Primary Caregiver",
            status: "PENDING",
            permissions: { canAddMedication: true, canEditMedication: true, canDeleteMedication: true, canViewMedicalRecords: false, canOrderRefills: true },
          });
        }
      }
    }

    // Seed Refill Orders with realistic status distribution
    const statuses = ["SUBMITTED", "APPROVED", "DISPENSED", "READY_FOR_PICKUP", "COMPLETED"];
    let statusIdx = 0;

    for (const med of createdMeds) {
      const existingRefill = await RefillOrder.findOne({ patientId: patient._id, medicationId: med._id });
      if (!existingRefill) {
        const currentStatus = statuses[statusIdx % statuses.length];
        statusIdx++;

        const isDelivery = statusIdx % 2 === 0;
        await RefillOrder.create({
          patientId: patient._id,
          medicationId: med._id,
          requestedBy: account._id,
          targetPharmacyId: pharmacist._id,
          orderStatus: currentStatus,
          fulfillmentType: isDelivery ? "DELIVERY" : "PICKUP",
          deliveryAddress: { street: "123 Health Ave, Building 4", city: "Cairo", zipCode: "11511" },
          quantityRequested: med.inventory.initialQuantity || 30,
          pharmacistNotes:
            currentStatus === "APPROVED"
              ? "تم التأكد من الوصفة وتخصيص العبوة للصرف."
              : currentStatus === "DISPENSED"
              ? "تم صرف الدواء وتغليفه بنجاح."
              : currentStatus === "READY_FOR_PICKUP"
              ? "الطلب جاهز للاستلام من الفرع الرئيسي."
              : currentStatus === "COMPLETED"
              ? "تم توصيل وتأكيد استلام المريض وتحديث الرصيد."
              : "طلب تعبئة جديد بانتظام الدواء.",
        });
      }
    }
  }

  console.log("SUCCESS! Seeded 10 complete patient accounts with all related entities.");
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("Error seeding data:", err);
  process.exit(1);
});
