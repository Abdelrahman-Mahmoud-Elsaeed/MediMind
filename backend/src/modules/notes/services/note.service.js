const Note = require('../models/Note.model');
const Patient = require('../../auth/models/Patient.model');
const AppError = require('../../../shared/utils/AppError');

class NoteService {
  async createNote(creatorAccountId, payload) {
    const note = new Note({
      patientId: payload.patientId,
      creatorId: creatorAccountId,
      targetRole: payload.targetRole,
      sharedWithId: payload.sharedWithId || null,
      title: payload.title,
      content: payload.content
    });

    await note.save();
    return note;
  }

  async listNotes(userAccountId, userRole, patientId = null) {
    let patientProfileId = null;

    if (userRole === 'PATIENT') {
      const patient = await Patient.findOne({ accountId: userAccountId });
      if (!patient) {
        throw new AppError('Patient profile not found', 404, 'PATIENT_NOT_FOUND');
      }
      patientProfileId = patient._id;
    } else {
      if (!patientId) {
        throw new AppError('patientId is required for caregiver/provider roles', 400, 'VALIDATION_ERROR');
      }
      patientProfileId = patientId;
    }

    // Call Mongoose static findForRole access control
    return await Note.findForRole(userRole, userAccountId, patientProfileId)
      .populate('creatorId', 'email role')
      .sort({ createdAt: -1 });
  }

  async deleteNote(userAccountId, userRole, noteId) {
    const note = await Note.findById(noteId);
    if (!note) {
      throw new AppError('Note not found', 404, 'NOTE_NOT_FOUND');
    }

    // Access check: only creator or patient can delete the note
    if (note.creatorId.toString() !== userAccountId.toString()) {
      if (userRole === 'PATIENT') {
        const patient = await Patient.findOne({ accountId: userAccountId });
        if (!patient || note.patientId.toString() !== patient._id.toString()) {
          throw new AppError('Access denied', 403, 'FORBIDDEN');
        }
      } else {
        throw new AppError('Access denied', 403, 'FORBIDDEN');
      }
    }

    await Note.findByIdAndDelete(noteId);
    return { noteId, status: 'DELETED' };
  }
}

module.exports = new NoteService();
