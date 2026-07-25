const noteService = require('../services/note.service');
const { logger } = require('../../../shared/utils/logger');

class NoteController {
  async create(req, res, next) {
    try {
      const note = await noteService.createNote(req.accountId, req.body);
      res.status(201).json({
        success: true,
        data: note
      });
    } catch (error) {
      logger.error('Error creating note:', error);
      next(error);
    }
  }

  async list(req, res, next) {
    try {
      const patientId = req.query.patientId || null;
      const list = await noteService.listNotes(req.accountId, req.role, patientId);
      res.status(200).json({
        success: true,
        data: list
      });
    } catch (error) {
      logger.error('Error listing notes:', error);
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const result = await noteService.deleteNote(req.accountId, req.role, req.params.id);
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Error deleting note:', error);
      next(error);
    }
  }
}

module.exports = new NoteController();
