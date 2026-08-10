const Patient = require('../../auth/models/Patient.model');
const FamilyCaregiver = require('../../auth/models/FamilyCaregiver.model');
const ProfessionalCaregiver = require('../../auth/models/ProfessionalCaregiver.model');
const AppError = require('../../../shared/utils/AppError');

class ProfilesService {
  async getPatientProfile(accountId) {
    const patient = await Patient.findOne({ accountId });
    if (!patient) {
      throw new AppError('Patient profile not found', 404, 'PATIENT_NOT_FOUND');
    }
    return patient;
  }

  async updatePatientProfile(accountId, updateData) {
    const patient = await Patient.findOne({ accountId });
    if (!patient) {
      throw new AppError('Patient profile not found', 404, 'PATIENT_NOT_FOUND');
    }

    if (updateData.firstName !== undefined) patient.firstName = updateData.firstName;
    if (updateData.lastName !== undefined) patient.lastName = updateData.lastName;
    if (updateData.bloodType !== undefined) patient.bloodType = updateData.bloodType;
    if (updateData.dateOfBirth !== undefined) patient.dateOfBirth = updateData.dateOfBirth;
    if (updateData.height !== undefined) patient.height = updateData.height;
    if (updateData.weight !== undefined) patient.weight = updateData.weight;
    if (updateData.allergies !== undefined) patient.allergies = updateData.allergies;
    if (updateData.profilePictureUrl !== undefined) patient.profilePictureUrl = updateData.profilePictureUrl;
    if (updateData.address !== undefined) patient.address = updateData.address;

    if (updateData.emergencyContact !== undefined) {
      if (Array.isArray(updateData.emergencyContact)) {
        patient.emergencyContact = updateData.emergencyContact;
      } else {
        patient.emergencyContact = [{
          name: updateData.emergencyContact.name || patient.emergencyContact?.[0]?.name,
          phone: updateData.emergencyContact.phone || patient.emergencyContact?.[0]?.phone
        }];
      }
    }

    await patient.save();
    return patient;
  }

  async getCaregiverProfile(accountId) {
    let caregiver = await FamilyCaregiver.findOne({ accountId });
    let type = 'FAMILY_CAREGIVER';

    if (!caregiver) {
      caregiver = await ProfessionalCaregiver.findOne({ accountId });
      type = 'PROFESSIONAL_CAREGIVER';
    }

    if (!caregiver) {
      throw new AppError('Caregiver profile not found', 404, 'CAREGIVER_NOT_FOUND');
    }

    return {
      ...caregiver.toObject(),
      caregiverType: type
    };
  }

  async updateCaregiverProfile(accountId, updateData) {
    let caregiver = await FamilyCaregiver.findOne({ accountId });
    let isProfessional = false;

    if (!caregiver) {
      caregiver = await ProfessionalCaregiver.findOne({ accountId });
      isProfessional = true;
    }

    if (!caregiver) {
      throw new AppError('Caregiver profile not found', 404, 'CAREGIVER_NOT_FOUND');
    }

    // Common fields
    if (updateData.firstName !== undefined) caregiver.firstName = updateData.firstName;
    if (updateData.lastName !== undefined) caregiver.lastName = updateData.lastName;
    if (updateData.address !== undefined) caregiver.address = updateData.address;
    if (updateData.profilePictureUrl !== undefined) caregiver.profilePictureUrl = updateData.profilePictureUrl;
    if (updateData.whatsappOptIn !== undefined) caregiver.whatsappOptIn = updateData.whatsappOptIn;
    if (updateData.preferredLanguage !== undefined) caregiver.preferredLanguage = updateData.preferredLanguage;
    if (updateData.alertSettings !== undefined) {
      caregiver.alertSettings = {
        ...caregiver.alertSettings,
        ...updateData.alertSettings
      };
    }

    // Professional Caregiver specific fields
    if (isProfessional) {
      if (updateData.hourlyRate !== undefined) caregiver.hourlyRate = updateData.hourlyRate;
      if (updateData.bio !== undefined) caregiver.bio = updateData.bio;
      if (updateData.isAvailable !== undefined) caregiver.isAvailable = updateData.isAvailable;
      if (updateData.specialties !== undefined) caregiver.specialties = updateData.specialties;
      if (updateData.skills !== undefined) caregiver.skills = updateData.skills;
      if (updateData.experienceYears !== undefined) caregiver.experienceYears = updateData.experienceYears;
      if (updateData.licenseNumber !== undefined) caregiver.licenseNumber = updateData.licenseNumber;
      if (updateData.alternativePhone !== undefined) caregiver.alternativePhone = updateData.alternativePhone;
    }

    await caregiver.save();
    return caregiver;
  }
}

module.exports = new ProfilesService();
