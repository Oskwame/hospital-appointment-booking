import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// ========================================
// EMAIL SERVICE CONFIGURATION
// ========================================
// Using Brevo  for ALL emails

// BREVO TRANSPORTER - Handles all email types
const brevoTransporter = nodemailer.createTransport({
  host: process.env.BREVO_SMTP_HOST || 'smtp-relay.brevo.com',
  port: parseInt(process.env.BREVO_SMTP_PORT || '587'),
  auth: {
    user: process.env.BREVO_SMTP_USER || '',
    pass: process.env.BREVO_SMTP_PASS || ''
  }
});

// ========================================
// OTP EMAILS (via Brevo)
// ========================================
export const sendOTP = async (email: string, code: string, expiryMinutes: number = 5) => {
  try {
    const from = process.env.BREVO_FROM_EMAIL || '"Kasa Family Hospital" <noreply@kasahospital.com>';

    const info = await brevoTransporter.sendMail({
      from,
      to: email,
      subject: 'Your Verification Code - Kasa Family Hospital',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
          <div style="text-align: center; margin-bottom: 25px;">
            <h1 style="color: #2563eb; margin: 0; font-size: 24px;">Kasa Family Hospital</h1>
            <p style="color: #6b7280; margin: 5px 0; font-size: 13px;">Secure Verification</p>
          </div>
          
          <p style="font-size: 15px; color: #1f2937;">Hello,</p>
          
          <p style="font-size: 14px; color: #374151; line-height: 1.6;">
            You requested a verification code for your Kasa Family Hospital account.
          </p>
          
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 25px; border-radius: 12px; margin: 25px 0; text-align: center;">
            <p style="margin: 0 0 10px 0; color: #ffffff; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Your Verification Code</p>
            <p style="margin: 0; color: #ffffff; font-size: 36px; font-weight: bold; letter-spacing: 8px; font-family: 'Courier New', monospace;">${code}</p>
          </div>
          
          <div style="background-color: #fef3c7; padding: 12px 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
            <p style="margin: 0; color: #92400e; font-size: 13px;">
              <strong>⏰ Expires in ${expiryMinutes} minutes</strong>
            </p>
          </div>
          
          <p style="font-size: 13px; color: #6b7280; line-height: 1.6;">
            If you didn't request this code, please ignore this email or contact our support team immediately.
          </p>
          
          <div style="margin-top: 30px; padding-top: 15px; border-top: 1px solid #e5e7eb;">
            <p style="margin: 0; color: #6b7280; font-size: 12px; text-align: center;">
              This is an automated security message from Kasa Family Hospital
            </p>
          </div>
        </div>
      `
    });

    console.log("📧 OTP sent via Brevo - Message ID:", info.messageId);
    return info;
  } catch (error) {
    console.error("❌ Error sending OTP email:", error);
    throw error;
  }
};

// ========================================
// APPOINTMENT CONFIRMATION (via Brevo)
// ========================================
export const sendAppointmentConfirmation = async (
  email: string,
  name: string,
  date: Date,
  time: string,
  doctorName: string,
  serviceName: string,
  appointmentId: number
) => {
  try {
    const from = process.env.BREVO_FROM_EMAIL || '"Kasa Family Hospital" <noreply@kasahospital.com>';

    const info = await brevoTransporter.sendMail({
      from,
      to: email,
      subject: 'Appointment Approved - Kasa Family Hospital',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb; margin: 0;">Kasa Family Hospital</h1>
            <p style="color: #6b7280; margin: 5px 0;">Your Health, Our Priority</p>
          </div>
          
          <p style="font-size: 16px; color: #1f2937;">Dear <strong>${name}</strong>,</p>
          
          <p style="font-size: 15px; color: #374151; line-height: 1.6;">
            Your appointment request with <strong>Kasa Family Hospital</strong> has been <span style="color: #059669; font-weight: 600;">approved</span>.
          </p>
          
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 10px; margin: 25px 0; text-align: center;">
            <p style="margin: 0 0 8px 0; color: #ffffff; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Your Appointment ID</p>
            <p style="margin: 0; color: #ffffff; font-size: 32px; font-weight: bold; letter-spacing: 4px; font-family: 'Courier New', monospace;">#${appointmentId.toString().padStart(6, '0')}</p>
            <p style="margin: 8px 0 0 0; color: #e0e7ff; font-size: 11px;">Please keep this ID for your records</p>
          </div>
          
          <div style="background-color: #f3f4f6; padding: 25px; border-radius: 10px; margin: 25px 0; border-left: 4px solid #2563eb;">
            <h2 style="margin: 0 0 15px 0; color: #1f2937; font-size: 18px;">📋 Appointment Details</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Service/Department:</td>
                <td style="padding: 8px 0; color: #1f2937;">${serviceName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Doctor:</td>
                <td style="padding: 8px 0; color: #1f2937;">Dr. ${doctorName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Date:</td>
                <td style="padding: 8px 0; color: #1f2937;">${date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Time:</td>
                <td style="padding: 8px 0; color: #1f2937;">${time}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Location:</td>
                <td style="padding: 8px 0; color: #1f2937;">Kasa Family Hospital, Main Building</td>
              </tr>
            </table>
          </div>
          
          <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
            <p style="margin: 0; color: #92400e; font-size: 14px;">
              <strong>⏰ Important:</strong> Please arrive at least 10 minutes early for check-in and any required pre-appointment procedures. Bring your appointment ID <strong>#${appointmentId.toString().padStart(6, '0')}</strong>.
            </p>
          </div>
          
          <p style="font-size: 14px; color: #374151; line-height: 1.6;">
            If you need to reschedule or cancel, please contact us at <strong>+233 XXX XXX XXX</strong> and provide your appointment ID.
          </p>
          
          <p style="font-size: 14px; color: #374151; margin-top: 25px;">
            Thank you for choosing <strong>Kasa Family Hospital</strong>.
          </p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #e5e7eb;">
            <p style="margin: 0; color: #1f2937; font-weight: 600;">Best regards,</p>
            <p style="margin: 5px 0; color: #374151;">Patient Care Team</p>
            <p style="margin: 5px 0; color: #374151;"><strong>Kasa Family Hospital</strong></p>
            <p style="margin: 5px 0; color: #6b7280; font-size: 13px;">📞 +233 XXX XXX XXX | 📧 info@kasahospital.com</p>
            <p style="margin: 5px 0; color: #6b7280; font-size: 13px;">📍 Accra, Ghana</p>
          </div>
          
          <div style="margin-top: 25px; padding: 15px; background-color: #f9fafb; border-radius: 8px;">
            <p style="margin: 0; color: #6b7280; font-size: 12px; text-align: center;">
              This is an automated message. Please do not reply directly to this email for appointment changes.
            </p>
          </div>
        </div>
      `
    });

    console.log("📧 Appointment confirmation sent via Brevo - Message ID:", info.messageId);
    return info;
  } catch (error) {
    console.error("❌ Error sending appointment confirmation:", error);
    return null;
  }
};

// Export the transporter for backward compatibility with auth routes
export const transporter = brevoTransporter;
