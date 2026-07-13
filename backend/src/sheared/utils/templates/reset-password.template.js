// src/sheared/utils/templates/reset-password.template.js
const { CLIENT_URL } = require("../../../config/env");

function resetPasswordTemplate(firstName, token) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.6;">
      <h2 style="color: #111827;">Reset Your Account Password</h2>

      <p>Hello ${firstName || "there"},</p>

      <p>We received a request to change the security credentials assigned to your MediMind account profile.</p>

      <div style="margin: 24px 0;">
        <a href="${CLIENT_URL}/reset-password/${token}" style="
          display: inline-block;
          padding: 12px 20px;
          background: #111827;
          color: #fff;
          text-decoration: none;
          font-weight: bold;
          border-radius: 6px;
        ">
          Reset Secure Password
        </a>
      </div>

      <p>This password restoration link remains valid for only 15 minutes before expiring automatically.</p>

      <hr style="border: none; border-top: 1px solid #E5E7EB; margin-top: 32px;" />
      <p style="font-size: 12px; color: #9CA3AF;">
        If you did not request this credentials alteration sequence, please disregard this transmission immediately. Your profile remains fully secure.
      </p>
    </div>
  `;
}

module.exports = { resetPasswordTemplate };