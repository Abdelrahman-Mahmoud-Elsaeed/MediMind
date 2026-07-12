const profilesService = require('../services/profiles.service');
const { logger } = require('../../../shared/utils/logger');

class ProfilesController {
  async getPatientMe(req, res, next) {
    try {
      const profile = await profilesService.getPatientProfile(req.accountId);
      res.status(200).json({
        success: true,
        data: profile
      });
    } catch (error) {
      logger.error('Error fetching patient profile:', error);
      next(error);
    }
  }

  async updatePatientMe(req, res, next) {
    try {
      const profile = await profilesService.updatePatientProfile(req.accountId, req.body);
      res.status(200).json({
        success: true,
        data: profile
      });
    } catch (error) {
      logger.error('Error updating patient profile:', error);
      next(error);
    }
  }

  async getCaregiverMe(req, res, next) {
    try {
      const profile = await profilesService.getCaregiverProfile(req.accountId);
      res.status(200).json({
        success: true,
        data: profile
      });
    } catch (error) {
      logger.error('Error fetching caregiver profile:', error);
      next(error);
    }
  }

  async updateCaregiverMe(req, res, next) {
    try {
      const profile = await profilesService.updateCaregiverProfile(req.accountId, req.body);
      res.status(200).json({
        success: true,
        data: profile
      });
    } catch (error) {
      logger.error('Error updating caregiver profile:', error);
      next(error);
    }
  }
}

module.exports = new ProfilesController();
