const express = require('express');
const router = express.Router();
const noteController = require('../controllers/note.controller');
const { createNoteSchema } = require('../validators/note.validator');
const { authenticate } = require('../../../shared/middleware/auth.middleware');
const validate = require('../../../shared/middleware/validation.middleware');

router.post('/', authenticate, validate(createNoteSchema), noteController.create);
router.get('/', authenticate, noteController.list);
router.delete('/:id', authenticate, noteController.delete);

module.exports = router;
