const Caregiver = require('../../modules/auth/models/Caregiver.model');
const Patient = require('../../modules/auth/models/Patient.model');
const { logger } = require('../utils/logger');

/**
 * Access Control Middleware — وفاء (Wafa)
 *
 * Verifies that the authenticated user has access to a specific patient's data.
 * Used by medications, doses, and notifications modules.
 *
 * Usage:
 *   router.get('/medications', verifyPatientAccess, medicationController.getAll);
 *
 * The middleware checks:
 *  1. If user is PATIENT: must own the patientId (extracted from query, params, or body)
 *  2. If user is CAREGIVER: must be linked to the patientId
 *  3. If user is DOCTOR: must have patientId in their patientIds array
 *  4. If user is PHARMACY: must have patientId in their patientIds array
 *  5. If user is ADMIN: always allowed
 *
 * Attaches: req.patientId (the verified patient ID)
 */

/**
 * Extract patientId from various request locations
 */
function extractPatientId(req) {
  // 1. Explicit body field
  if (req.body?.patientId) return req.body.patientId;

  // 2. Query parameter
  if (req.query?.patientId) return req.query.patientId;

  // 3. URL parameter
  if (req.params?.patientId) return req.params.patientId;

  // 4. Dose event ID — need to lookup the patient (handled separately)
  // 5. Medication ID — need to lookup the patient (handled separately)
  return null;
}

/**
 * Main middleware: verify patient access
 */
const verifyPatientAccess = async (req, res, next) => {
  try {
    if (!req.accountId || !req.role) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
      });
    }

    // Admin has access to everything
    if (req.role === 'ADMIN') {
      req.patientId = extractPatientId(req);
      return next();
    }

    let patientId = extractPatientId(req);

    // If no patientId provided, try to determine from account
    if (!patientId) {
      if (req.role === 'PATIENT') {
        const patient = await Patient.findOne({ accountId: req.accountId });
        if (!patient) {
          return res.status(404).json({
            success: false,
            error: { code: 'NOT_FOUND', message: 'Patient profile not found' }
          });
        }
        patientId = patient._id;
      } else {
        // For caregivers/doctors/pharmacies, patientId is required
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'patientId is required' }
        });
      }
    }

    // Verify access based on role
    let hasAccess = false;

    if (req.role === 'PATIENT') {
      // Patient can only access their own data
      const patient = await Patient.findOne({ accountId: req.accountId, _id: patientId });
      hasAccess = !!patient;
    } else if (req.role === 'CAREGIVER') {
      // Caregiver must be linked to the patient
      const caregiver = await Caregiver.findOne({
        accountId: req.accountId,
        patientIds: patientId
      });
      hasAccess = !!caregiver;
    } else if (req.role === 'DOCTOR') {
      // Doctor must have patient in their patientIds
      const Doctor = require('../../modules/auth/models/Doctor.model');
      const doctor = await Doctor.findOne({
        accountId: req.accountId,
        patientIds: patientId
      });
      hasAccess = !!doctor;
    } else if (req.role === 'PHARMACY') {
      // Pharmacy must have patient linked
      const Pharmacy = require('../../modules/auth/models/Pharmacy.model');
      const pharmacy = await Pharmacy.findOne({
        accountId: req.accountId,
        patientIds: patientId
      });
      hasAccess = !!pharmacy;
    }

    if (!hasAccess) {
      logger.warn(`Access denied: account ${req.accountId} (${req.role}) tried to access patient ${patientId}`);
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have access to this patient\'s data'
        }
      });
    }

    // Attach the verified patientId for downstream use
    req.patientId = patientId;
    next();
  } catch (error) {
    logger.error('Access control error:', error);
    next(error);
  }
};

/**
 * Variant: verify access to a specific resource (medication, dose event) by ID
 * Looks up the patientId from the resource, then verifies access
 *
 * @param {String} modelName - 'Medication' | 'DoseEvent'
 * @param {String} paramKey - URL parameter key (default: 'id')
 */
const verifyResourceAccess = (modelName, paramKey = 'id') => {
  return async (req, res, next) => {
    try {
      if (!req.accountId || !req.role) {
        return res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
        });
      }

      const resourceId = req.params[paramKey];
      if (!resourceId) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: `Parameter ${paramKey} is required` }
        });
      }

      // Admin bypass
      if (req.role === 'ADMIN') {
        return next();
      }

      // Get the Mongoose model
      const mongoose = require('mongoose');
      const Model = mongoose.model(modelName);

      const resource = await Model.findById(resourceId);
      if (!resource) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: `${modelName} not found` }
        });
      }

      const patientId = resource.patientId;
      if (!patientId) {
        return res.status(500).json({
          success: false,
          error: { code: 'SERVER_ERROR', message: 'Resource has no patientId' }
        });
      }

      // Verify access using the patientId from the resource
      let hasAccess = false;

      if (req.role === 'PATIENT') {
        const patient = await Patient.findOne({ accountId: req.accountId, _id: patientId });
        hasAccess = !!patient;
      } else if (req.role === 'CAREGIVER') {
        const caregiver = await Caregiver.findOne({
          accountId: req.accountId,
          patientIds: patientId
        });
        hasAccess = !!caregiver;
      } else if (req.role === 'DOCTOR') {
        const Doctor = require('../../modules/auth/models/Doctor.model');
        const doctor = await Doctor.findOne({
          accountId: req.accountId,
          patientIds: patientId
        });
        hasAccess = !!doctor;
      } else if (req.role === 'PHARMACY') {
        const Pharmacy = require('../../modules/auth/models/Pharmacy.model');
        const pharmacy = await Pharmacy.findOne({
          accountId: req.accountId,
          patientIds: patientId
        });
        hasAccess = !!pharmacy;
      }

      if (!hasAccess) {
        logger.warn(`Access denied: account ${req.accountId} (${req.role}) tried to access ${modelName} ${resourceId}`);
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'You do not have access to this resource'
          }
        });
      }

      // Attach resource and patientId for downstream use
      req.resource = resource;
      req.patientId = patientId;
      next();
    } catch (error) {
      logger.error('Resource access control error:', error);
      next(error);
    }
  };
};

module.exports = {
  verifyPatientAccess,
  verifyResourceAccess
};
