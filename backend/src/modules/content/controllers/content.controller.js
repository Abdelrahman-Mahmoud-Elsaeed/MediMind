const contentService = require('../services/content.service');
const ServiceResponse = require('../../../shared/utils/ServiceResponse');
const { logger } = require('../../../shared/utils/logger');

class ContentController {
  async publishAdvice(req, res, next) {
    try {
      const advice = await contentService.publishAdvice(req.accountId, req.body);
      return new ServiceResponse({
        status: 'CREATED',
        en: 'Health advice published successfully.',
        ar: 'تم نشر النصيحة الطبية بنجاح.',
        data: advice
      }).send(res);
    } catch (error) {
      logger.error('Error publishing advice:', error);
      next(error);
    }
  }

  async publishBlog(req, res, next) {
    try {
      const blog = await contentService.publishBlog(req.accountId, req.body);
      return new ServiceResponse({
        status: 'CREATED',
        en: 'Health article published successfully.',
        ar: 'تم نشر المقال الطبي بنجاح.',
        data: blog
      }).send(res);
    } catch (error) {
      logger.error('Error publishing blog:', error);
      next(error);
    }
  }

  async getAdvice(req, res, next) {
    try {
      const targetDisease = req.query.targetDisease || null;
      const advice = await contentService.getAdviceByDisease(targetDisease);
      return new ServiceResponse({
        en: 'Health advice retrieved successfully.',
        ar: 'تم استرجاع النصائح الطبية بنجاح.',
        data: advice
      }).send(res);
    } catch (error) {
      logger.error('Error getting advice:', error);
      next(error);
    }
  }

  async getBlogs(req, res, next) {
    try {
      const targetDisease = req.query.targetDisease || null;
      const blogs = await contentService.getBlogsByDisease(targetDisease);
      return new ServiceResponse({
        en: 'Health articles retrieved successfully.',
        ar: 'تم استرجاع المقالات الطبية بنجاح.',
        data: blogs
      }).send(res);
    } catch (error) {
      logger.error('Error getting blogs:', error);
      next(error);
    }
  }
}

module.exports = new ContentController();
