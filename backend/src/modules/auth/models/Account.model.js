const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const AccountSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    index: true,
    lowercase: true,
    trim: true
  },
  passwordHash: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['PATIENT', 'CAREGIVER', 'ADMIN'], 
    required: true 
  },
  pushSubscription: {
    endpoint: String,
    keys: { 
      p256dh: String, 
      auth: String 
    }
  },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

AccountSchema.pre('save', async function(next) {
  if (!this.isModified('passwordHash')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model('Account', AccountSchema);
