const { Resend } = require("resend");

const { RESEND_API_KEY, EMAIL_FROM_ADDRESS } = require("./env");
const { otpTemplate } = require("../shared/utils/templates/otp.template");
const {
  resetPasswordTemplate,
} = require("../shared/utils/templates/reset-password.template");
const {
  caregiverInvitationTemplate,
} = require("../shared/utils/templates/caregiver-invitation.template");

const resend = new Resend(RESEND_API_KEY || "re_test_placeholder");

class EmailService {
  /**
   * Sends a 6-digit OTP verification code email.
   * @param {string} email - Recipient address.
   * @param {string} name - Recipient's first name (used in greeting).
   * @param {string} otp - The 6-digit verification code.
   */
  async sendOtp(email, name, otp) {
    return resend.emails.send({
      from: EMAIL_FROM_ADDRESS,
      to: email,
      subject: "Verify your email — MediMind",
      html: otpTemplate(name, otp),
    });
  }

  /**
   * Sends a single-use password-reset link email.
   * @param {string} email - Recipient address.
   * @param {string} name - Recipient's first name (used in greeting).
   * @param {string} token - Plain-text reset token (embedded into the link).
   */
  async sendResetPassword(email, name, token) {
    return resend.emails.send({
      from: EMAIL_FROM_ADDRESS,
      to: email,
      subject: "Reset your password — MediMind",
      html: resetPasswordTemplate(name, token),
    });
  }

  /**
   * Sends a caregiver invitation email.
   *
   * The email is triggered when a PATIENT invites a caregiver through the
   * Relationships module. The named person in the body is the patient who
   * initiated the request — not an organization.
   *
   * @param {string} email - Invited caregiver's email address.
   * @param {string} patientName - Full name of the patient issuing the invite.
   * @param {string} token - Invitation acceptance token (48-hour expiry).
   */
  async sendCaregiverInvitation(email, patientName, token) {
    return resend.emails.send({
      from: EMAIL_FROM_ADDRESS,
      to: email,
      subject: `${patientName} invited you to be their caregiver on MediMind`,
      html: caregiverInvitationTemplate(patientName, token),
    });
  }
}

module.exports = new EmailService();