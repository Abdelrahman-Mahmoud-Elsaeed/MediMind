const contentService = require('../services/content.service');
const { logger } = require('../../../shared/utils/logger');

class ContentController {
  async publishAdvice(req, res, next) {
    try {
      const advice = await contentService.publishAdvice(req.accountId, req.body);
      res.status(201).json({
        success: true,
        data: advice
      });
    } catch (error) {
      logger.error('Error publishing advice:', error);
      next(error);
    }
  }

  async publishBlog(req, res, next) {
    try {
      const blog = await contentService.publishBlog(req.accountId, req.body);
      res.status(201).json({
        success: true,
        data: blog
      });
    } catch (error) {
      logger.error('Error publishing blog:', error);
      next(error);
    }
  }

  async getAdvice(req, res, next) {
    try {
      const targetDisease = req.query.targetDisease || null;
      const advice = await contentService.getAdviceByDisease(targetDisease);
      res.status(200).json({
        success: true,
        data: advice
      });
    } catch (error) {
      logger.error('Error getting advice:', error);
      next(error);
    }
  }

  async getBlogs(req, res, next) {
    try {
      const targetDisease = req.query.targetDisease || null;
      const blogs = await contentService.getBlogsByDisease(targetDisease);
      res.status(200).json({
        success: true,
        data: blogs
      });
    } catch (error) {
      logger.error('Error getting blogs:', error);
      next(error);
    }
  }
}

module.exports = new ContentController();
