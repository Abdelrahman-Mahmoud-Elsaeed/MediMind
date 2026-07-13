const { Resend } = require("resend");

const { RESEND_API_KEY } = require("./env");
const { otpTemplate } = require("./email/templates/otp.template");
const { resetPasswordTemplate } = require("./email/templates/reset-password.template");
const { invitationTemplate } = require("./email/templates/invitation.template");

const resend = new Resend(RESEND_API_KEY);

class EmailService {
  async sendOtp(email, name, otp) {
    return resend.emails.send({
      from: "NEXUS CRM <onboarding@resend.dev>",
      to: email,
      subject: "Verify your email",
      html: otpTemplate(name, otp),
    });
  }

  async sendResetPassword(email, name, token) {
    return resend.emails.send({
      from: "NEXUS CRM <onboarding@resend.dev>",
      to: email,
      subject: "Reset your password",
      html: resetPasswordTemplate(name, token),
    });
  }

  async sendWorkspaceInvitation(email, orgName, token) {
    return resend.emails.send({
      from: "NEXUS CRM <onboarding@resend.dev>",
      to: email,
      subject: `You've been invited to join ${orgName} on NEXUS CRM`,
      html: invitationTemplate(orgName, token),
    });
  }
}

module.exports = new EmailService();