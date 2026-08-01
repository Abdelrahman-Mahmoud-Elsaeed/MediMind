const Patient = require('../../auth/models/Patient.model');
const Caregiver = require('../../auth/models/FamilyCaregiver.model');
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
    const caregiver = await Caregiver.findOne({ accountId });
    if (!caregiver) {
      throw new AppError('Caregiver profile not found', 404, 'CAREGIVER_NOT_FOUND');
    }
    return caregiver;
  }

  async updateCaregiverProfile(accountId, updateData) {
    const caregiver = await Caregiver.findOne({ accountId });
    if (!caregiver) {
      throw new AppError('Caregiver profile not found', 404, 'CAREGIVER_NOT_FOUND');
    }

    if (updateData.phone !== undefined) {
      caregiver.phone = updateData.phone;
    }

    await caregiver.save();
    return caregiver;
  }
}

module.exports = new ProfilesService();
