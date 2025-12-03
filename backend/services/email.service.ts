import nodemailer from 'nodemailer';

// Create transporter (configure with env vars)
// Defaults to Ethereal for development if no env vars provided
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: parseInt(process.env.SMTP_PORT || '587'),
    auth: {
        user: process.env.SMTP_USER || 'ethereal_user',
        pass: process.env.SMTP_PASS || 'ethereal_pass'
    }
});

export const sendAppointmentConfirmation = async (email: string, name: string, date: Date, time: string, doctorName: string) => {
    try {
        const info = await transporter.sendMail({
            from: process.env.SMTP_FROM || '"Hospital System" <noreply@hospital.com>',
            to: email,
            subject: 'Appointment Confirmed',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb;">Appointment Confirmed</h1>
          <p>Dear <strong>${name}</strong>,</p>
          <p>We are pleased to confirm your appointment with <strong>${doctorName}</strong>.</p>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>📅 Date:</strong> ${date.toLocaleDateString()}</p>
            <p style="margin: 5px 0;"><strong>⏰ Time:</strong> ${time}</p>
            <p style="margin: 5px 0;"><strong>👨‍⚕️ Doctor:</strong> ${doctorName}</p>
          </div>
          
          <p>Please arrive 10 minutes early to complete any necessary paperwork.</p>
          <p>If you need to reschedule or cancel, please contact us at least 24 hours in advance.</p>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
          <p style="color: #6b7280; font-size: 12px;">This is an automated message, please do not reply directly to this email.</p>
        </div>
      `
        });
        console.log("Message sent: %s", info.messageId);
        // Preview only available when sending through an Ethereal account
        if (!process.env.SMTP_HOST) {
            console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
        }
        return info;
    } catch (error) {
        console.error("Error sending email:", error);
        return null;
    }
};
