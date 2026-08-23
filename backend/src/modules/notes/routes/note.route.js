const express = require('express');
const router = express.Router();
const noteController = require('../controllers/note.controller');
const { createNoteSchema } = require('../validators/note.validator');
const { authenticate, authorize } = require('../../../shared/middleware/auth.middleware');
const validate = require('../../../shared/middleware/validation.middleware');

// All clinical roles can create and view notes
const NOTE_ROLES = ['PATIENT', 'FAMILY_CAREGIVER', 'PROFESSIONAL_CAREGIVER', 'CAREGIVER', 'DOCTOR', 'PHARMACIST', 'ADMIN'];

router.post('/', authenticate, authorize(...NOTE_ROLES), validate(createNoteSchema), noteController.create);
router.get('/', authenticate, authorize(...NOTE_ROLES), noteController.list);
router.delete('/:id', authenticate, authorize(...NOTE_ROLES), noteController.delete);

module.exports = router;
