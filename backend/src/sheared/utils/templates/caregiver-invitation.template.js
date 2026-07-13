const { CLIENT_URL } = require("../../../config/env");

function caregiverInvitationTemplate(patientName, token) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.6;">
      <h2 style="color: #4F46E5;">MediMind Caregiver Invitation</h2>
      <p>Hello there,</p>
      
      <p><strong>${patientName}</strong> has invited you to act as their designated caregiver on the MediMind Platform.</p>
      
      <p>Accepting this invitation allows you to monitor their medication adherence schedules, receive missed dose alerts, and help manage their treatment inventory parameters safely.</p>
      
      <div style="margin: 28px 0;">
        <a href="${CLIENT_URL}/caregiver/accept?token=${token}" style="
          background-color: #4F46E5;
          color: white;
          padding: 12px 24px;
          text-decoration: none;
          font-weight: bold;
          border-radius: 6px;
          display: inline-block;
        ">
          Accept Invitation & Link Account
        </a>
      </div>
      
      <p style="font-size: 13px; color: #666;">
        This secure clinical delegation connection link will automatically expire in 48 hours.
      </p>
      <hr style="border: none; border-top: 1px solid #E5E7EB; margin-top: 32px;" />
      <p style="font-size: 12px; color: #9CA3AF;">
        If you do not know this patient or were not expecting this notification request, you can safely ignore this email.
      </p>
    </div>
  `;
}

module.exports = { caregiverInvitationTemplate };