const DiseaseAdvice = require('../models/DiseaseAdvice.model');
const DiseaseBlog = require('../models/DiseaseBlog.model');
const Doctor = require('../../auth/models/Doctor.model');
const AppError = require('../../../shared/utils/AppError');

class ContentService {
  async publishAdvice(doctorAccountId, payload) {
    const doctor = await Doctor.findOne({ accountId: doctorAccountId });
    if (!doctor) {
      throw new AppError('Only verified Doctors can publish clinical advice', 403, 'FORBIDDEN');
    }

    const advice = new DiseaseAdvice({
      targetDisease: payload.targetDisease,
      dos: payload.dos,
      donts: payload.donts,
      publishedBy: doctor._id,
      isActive: true
    });

    await advice.save();
    return advice;
  }

  async publishBlog(doctorAccountId, payload) {
    const doctor = await Doctor.findOne({ accountId: doctorAccountId });
    if (!doctor) {
      throw new AppError('Only verified Doctors can publish educational blogs', 403, 'FORBIDDEN');
    }

    const blog = new DiseaseBlog({
      targetDisease: payload.targetDisease,
      title: payload.title,
      coverImageURL: payload.coverImageURL || null,
      content: payload.content,
      publishedBy: doctor._id,
      isActive: true
    });

    await blog.save();
    return blog;
  }

  async getAdviceByDisease(targetDisease) {
    const filter = { isActive: true };
    if (targetDisease) {
      filter.targetDisease = targetDisease;
    }
    return await DiseaseAdvice.find(filter)
      .populate('publishedBy', 'firstName lastName specialty')
      .sort({ createdAt: -1 });
  }

  async getBlogsByDisease(targetDisease) {
    const filter = { isActive: true };
    if (targetDisease) {
      filter.targetDisease = targetDisease;
    }
    return await DiseaseBlog.find(filter)
      .populate('publishedBy', 'firstName lastName specialty')
      .sort({ createdAt: -1 });
  }
}

module.exports = new ContentService();
