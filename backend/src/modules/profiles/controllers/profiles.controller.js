const profilesService = require('../services/profiles.service');
const ServiceResponse = require('../../../shared/utils/ServiceResponse');
const { logger } = require('../../../shared/utils/logger');

class ProfilesController {
  async getPatientMe(req, res, next) {
    try {
      const profile = await profilesService.getPatientProfile(req.accountId);
      return new ServiceResponse({
        en: 'Patient profile retrieved successfully.',
        ar: 'تم استرجاع ملف المريض بنجاح.',
        data: profile
      }).send(res);
    } catch (error) {
      logger.error('Error fetching patient profile:', error);
      next(error);
    }
  }

  async updatePatientMe(req, res, next) {
    try {
      const profile = await profilesService.updatePatientProfile(req.accountId, req.body);
      return new ServiceResponse({
        en: 'Patient profile updated successfully.',
        ar: 'تم تحديث ملف المريض بنجاح.',
        data: profile
      }).send(res);
    } catch (error) {
      logger.error('Error updating patient profile:', error);
      next(error);
    }
  }

  async getCaregiverMe(req, res, next) {
    try {
      const profile = await profilesService.getCaregiverProfile(req.accountId);
      return new ServiceResponse({
        en: 'Caregiver profile retrieved successfully.',
        ar: 'تم استرجاع ملف مقدم الرعاية بنجاح.',
        data: profile
      }).send(res);
    } catch (error) {
      logger.error('Error fetching caregiver profile:', error);
      next(error);
    }
  }

  async updateCaregiverMe(req, res, next) {
    try {
      const profile = await profilesService.updateCaregiverProfile(req.accountId, req.body);
      return new ServiceResponse({
        en: 'Caregiver profile updated successfully.',
        ar: 'تم تحديث ملف مقدم الرعاية بنجاح.',
        data: profile
      }).send(res);
    } catch (error) {
      logger.error('Error updating caregiver profile:', error);
      next(error);
    }
  }
}

module.exports = new ProfilesController();
