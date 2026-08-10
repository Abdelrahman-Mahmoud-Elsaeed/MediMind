const express = require('express');
const router = express.Router();
const contentController = require('../controllers/content.controller');
const { createAdviceSchema, createBlogSchema } = require('../validators/content.validator');
const { authenticate, authorize } = require('../../../shared/middleware/auth.middleware');
const validate = require('../../../shared/middleware/validation.middleware');

// All authenticated users can read educational content
const CONTENT_READERS = ['PATIENT', 'FAMILY_CAREGIVER', 'PROFESSIONAL_CAREGIVER', 'DOCTOR', 'PHARMACIST', 'ADMIN'];
// Only verified Doctors can publish content (service layer also verifies Doctor profile)
const CONTENT_PUBLISHERS = ['DOCTOR'];

router.get('/blogs', authenticate, authorize(...CONTENT_READERS), contentController.getBlogs);
router.get('/advice', authenticate, authorize(...CONTENT_READERS), contentController.getAdvice);
router.post('/blogs', authenticate, authorize(...CONTENT_PUBLISHERS), validate(createBlogSchema), contentController.publishBlog);
router.post('/advice', authenticate, authorize(...CONTENT_PUBLISHERS), validate(createAdviceSchema), contentController.publishAdvice);

module.exports = router;
