const express = require('express');
const router = express.Router();
const contentController = require('../controllers/content.controller');
const { createAdviceSchema, createBlogSchema } = require('../validators/content.validator');
const { authenticate } = require('../../../shared/middleware/auth.middleware');
const validate = require('../../../shared/middleware/validation.middleware');

router.get('/blogs', authenticate, contentController.getBlogs);
router.get('/advice', authenticate, contentController.getAdvice);
router.post('/blogs', authenticate, validate(createBlogSchema), contentController.publishBlog);
router.post('/advice', authenticate, validate(createAdviceSchema), contentController.publishAdvice);

module.exports = router;
