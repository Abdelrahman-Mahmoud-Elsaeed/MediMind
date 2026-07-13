// src/sheared/utils/templates/otp.template.js

function otpTemplate(firstName, otp) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; color: #333; line-height: 1.5;">
      <h2 style="color: #0EA5E9;">Verify Your Account</h2>
      <p>Hello ${firstName || "there"},</p>

      <p>Thank you for protecting your medical profile metrics. Use the following One-Time Password (OTP) code to complete your verification gateway request:</p>

      <div style="
        font-size: 32px;
        font-weight: bold;
        letter-spacing: 6px;
        background: #F3F4F6;
        padding: 14px;
        display: inline-block;
        border-radius: 8px;
        color: #1F2937;
        margin: 16px 0;
        font-family: monospace;
      ">
        ${otp}
      </div>

      <p style="color: #EF4444; font-weight: 500;">This verification code will expire automatically in 5 minutes.</p>
      <p style="font-size: 12px; color: #9CA3AF; margin-top: 24px;">
        For security reasons, never share this authentication string with anyone, including MediMind clinical support staff.
      </p>
    </div>
  `;
}

module.exports = { otpTemplate };