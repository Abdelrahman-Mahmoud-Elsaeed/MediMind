const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AdminSchema = new Schema(
  {
    accountId: {
      type: Schema.Types.ObjectId,
      ref: "Account",
      required: true,
      unique: true,
    },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    department: { type: String, default: "Operations", trim: true },

    adminType: {
      type: String,
      enum: ["super_admin", "ops_admin", "finance_admin", "support_admin"],
      required: true,
    },

    permissions: [{ type: String, trim: true }],

    title: { type: String, trim: true },
    employeeId: { type: String, trim: true, sparse: true },
    corporatePhone: { type: String, trim: true },

    securityProfile: {
      isMfaEnforced: { type: Boolean, default: false },
      lastPasswordReset: { type: Date },
      allowedIpAddresses: [{ type: String, trim: true }],
    },

    auditSummary: {
      lastActiveAt: { type: Date },
      totalActionsLogged: { type: Number, default: 0 },
    },

    profilePictureUrl: { type: String, trim: true },

    whatsappOptIn: { type: Boolean, default: false },
    whatsappOptInDate: { type: Date, default: null },
    preferredLanguage: {
      type: String,
      enum: ["en", "ar"],
      default: "en",
    },
  },
  { timestamps: true },
);

AdminSchema.pre("save", function () {
  if (this.isModified("whatsappOptIn"))
    this.whatsappOptInDate = this.whatsappOptIn ? new Date() : null;
});

module.exports = mongoose.model("Admin", AdminSchema);
