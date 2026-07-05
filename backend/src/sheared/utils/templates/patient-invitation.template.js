// src/sheared/utils/templates/patient-invitation.template.js
const { CLIENT_URL } = require("../../../config/env");

function patientInvitationTemplate(caregiverName, token) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.6;">
      <h2 style="color: #059669;">MediMind Care Monitoring Request</h2>
      <p>Hello there,</p>
      
      <p><strong>${caregiverName}</strong> has requested to link with your account as your health caregiver on MediMind.</p>
      
      <p>By accepting this care connection, they will be able to view your scheduled dose events, help track your treatment compliance, and assist you with medication inventory refill reminders.</p>
      
      <div style="margin: 28px 0;">
        <a href="${CLIENT_URL}/patient/accept-caregiver?token=${token}" style="
          background-color: #059669;
          color: white;
          padding: 12px 24px;
          text-decoration: none;
          font-weight: bold;
          border-radius: 6px;
          display: inline-block;
        ">
          Review & Approve Caregiver Request
        </a>
      </div>
      
      <p style="font-size: 13px; color: #666;">
        For your medical privacy, this connection authorization request link will automatically expire in 48 hours.
      </p>
      <hr style="border: none; border-top: 1px solid #E5E7EB; margin-top: 32px;" />
      <p style="font-size: 12px; color: #9CA3AF;">
        If you did not authorize or expect this person to request access to your medication tracking records, you can safely ignore or deny this request. Your data remains completely private.
      </p>
    </div>
  `;
}

module.exports = { patientInvitationTemplate };