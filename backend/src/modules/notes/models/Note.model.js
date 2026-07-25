const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const NoteSchema = new Schema(
  {
    patientId: {
      type: Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
      index: true,
    },
    creatorId: {
      type: Schema.Types.ObjectId,
      ref: "Account",
      required: true,
      index: true,
    },

    targetRole: {
      type: String,
      enum: [
        "FAMILY_CAREGIVER",
        "PROFESSIONAL_CAREGIVER",
        "DOCTOR",
        "PHARMACIST",
        "PATIENT_PRIVATE",
      ],
      required: true,
      index: true,
    },

    // Explicit account identifier authorized to view this note alongside the patient
    sharedWithId: {
      type: Schema.Types.ObjectId,
      ref: "Account",
      default: null,
      index: true,
    },

    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
  },
  { timestamps: true },
);

NoteSchema.index({ patientId: 1, targetRole: 1, sharedWithId: 1 });

/**
 * Fix #9: Enforced access control via static method.
 * Controllers MUST use this method — never raw Note.find().
 *
 * @param {String} role - The caller's Account.role
 * @param {ObjectId} accountId - The caller's Account._id
 * @param {ObjectId} [patientProfileId] - Required for PATIENT role
 * @returns {Query} Mongoose query with correct access filter applied
 */
NoteSchema.statics.findForRole = function (role, accountId, patientProfileId) {
  switch (role) {
    case "PATIENT":
      return this.find({ patientId: patientProfileId });
    case "FAMILY_CAREGIVER":
      return this.find({
        targetRole: "FAMILY_CAREGIVER",
        sharedWithId: accountId,
      });
    case "PROFESSIONAL_CAREGIVER":
      return this.find({
        targetRole: "PROFESSIONAL_CAREGIVER",
        sharedWithId: accountId,
      });
    case "DOCTOR":
      return this.find({ targetRole: "DOCTOR", sharedWithId: accountId });
    case "PHARMACIST":
      return this.find({ targetRole: "PHARMACIST", sharedWithId: accountId });
    default:
      return this.find({ _id: null }); // Return empty result set for unknown roles
  }
};

module.exports = mongoose.model("Note", NoteSchema);
