const mongoose = require('mongoose');

const PatientSchema = new mongoose.Schema({
  accountId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Account', 
    required: true, 
    unique: true
  },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  phone: { type: String, required: true },
  dateOfBirth: { type: Date },
  bloodType: { 
    type: String, 
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] 
  },
  emergencyContact: {
    name: String,
    phone: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Patient', PatientSchema);
