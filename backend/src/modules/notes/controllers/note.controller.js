const noteService = require('../services/note.service');
const ServiceResponse = require('../../../shared/utils/ServiceResponse');
const { logger } = require('../../../shared/utils/logger');

class NoteController {
  async create(req, res, next) {
    try {
      const note = await noteService.createNote(req.accountId, req.body);
      return new ServiceResponse({
        status: 'CREATED',
        en: 'Clinical note added successfully.',
        ar: 'تمت إضافة الملاحظة الطبية بنجاح.',
        data: note
      }).send(res);
    } catch (error) {
      logger.error('Error creating note:', error);
      next(error);
    }
  }

  async list(req, res, next) {
    try {
      const patientId = req.query.patientId || null;
      const list = await noteService.listNotes(req.accountId, req.role, patientId);
      return new ServiceResponse({
        en: 'Clinical notes retrieved successfully.',
        ar: 'تم استرجاع الملاحظات الطبية بنجاح.',
        data: list
      }).send(res);
    } catch (error) {
      logger.error('Error listing notes:', error);
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const result = await noteService.deleteNote(req.accountId, req.role, req.params.id);
      return new ServiceResponse({
        en: 'Clinical note deleted successfully.',
        ar: 'تم حذف الملاحظة الطبية بنجاح.',
        data: result
      }).send(res);
    } catch (error) {
      logger.error('Error deleting note:', error);
      next(error);
    }
  }
}

module.exports = new NoteController();
