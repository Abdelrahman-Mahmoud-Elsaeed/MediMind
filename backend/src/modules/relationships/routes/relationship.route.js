const express = require('express');
const router = express.Router();
const relationshipController = require('../controllers/relationship.controller');
const { authenticate, authorize } = require('../../../sheared/middleware/auth.middleware');

// ===== Public route (no auth) — for viewing invitation details =====
/**
 * @route   GET /api/v1/relationships/invitation/:token
 * @desc    Get invitation details by token
 * @access  Public
 */
router.get('/invitation/:token', relationshipController.getInvitation);

// ===== Authenticated routes =====
router.use(authenticate);

/**
 * @route   POST /api/v1/relationships/invite
 * @desc    Create a caregiver invitation (returns QR code)
 * @access  PATIENT
 * @body    { invitedPhone?, relationType?, permissions? }
 */
router.post(
  '/invite',
  authorize('PATIENT'),
  relationshipController.createInvitation
);

/**
 * @route   POST /api/v1/relationships/accept/:token
 * @desc    Accept an invitation
 * @access  CAREGIVER
 */
router.post(
  '/accept/:token',
  authorize('CAREGIVER'),
  relationshipController.acceptInvitation
);

/**
 * @route   GET /api/v1/relationships
 * @desc    Get current user's relationships
 * @access  PATIENT, CAREGIVER
 */
router.get(
  '/',
  authorize('PATIENT', 'CAREGIVER'),
  relationshipController.getMyRelationships
);

/**
 * @route   DELETE /api/v1/relationships/:id
 * @desc    Revoke a relationship
 * @access  PATIENT, CAREGIVER
 */
router.delete(
  '/:id',
  authorize('PATIENT', 'CAREGIVER'),
  relationshipController.revoke
);

module.exports = router;
