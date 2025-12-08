"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Quick test to verify email sending works with Brevo
const email_service_1 = require("./services/email.service");
const testEmail = async () => {
    console.log('🧪 Testing Brevo email service...\n');
    try {
        await (0, email_service_1.sendAppointmentConfirmation)('kaytechh@gmail.com', // Test recipient
        'Test Patient', new Date(), '2:30 PM', 'Dr. Test', 'General Consultation', 12345 // Test appointment ID
        );
        console.log('\n✅ Test email sent successfully!');
        console.log('📬 Check inbox: kaytechh@gmail.com');
        console.log('💡 Or check your Brevo dashboard for sent emails');
    }
    catch (error) {
        console.error('\n❌ Test failed:', error);
        console.log('\n💡 Troubleshooting:');
        console.log('  1. Check your .env file has BREVO_SMTP_* variables');
        console.log('  2. Verify Brevo credentials are correct');
        console.log('  3. Check if port 587 is blocked by firewall');
    }
};
testEmail();
