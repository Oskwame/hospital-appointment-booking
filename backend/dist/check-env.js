"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Diagnostic script to check environment variables
const dotenv_1 = __importDefault(require("dotenv"));
// Load .env file
dotenv_1.default.config();
console.log('🔍 Environment Variables Diagnostic\n');
console.log('='.repeat(50));
console.log('\n📋 Brevo Configuration:');
console.log('  BREVO_SMTP_HOST:', process.env.BREVO_SMTP_HOST || '❌ NOT SET');
console.log('  BREVO_SMTP_PORT:', process.env.BREVO_SMTP_PORT || '❌ NOT SET');
console.log('  BREVO_SMTP_USER:', process.env.BREVO_SMTP_USER || '❌ NOT SET');
console.log('  BREVO_SMTP_PASS:', process.env.BREVO_SMTP_PASS ? `✅ SET (${process.env.BREVO_SMTP_PASS.length} chars)` : '❌ NOT SET');
console.log('  BREVO_FROM_EMAIL:', process.env.BREVO_FROM_EMAIL || '❌ NOT SET');
console.log('\n📋 Database:');
console.log('  DATABASE_URL:', process.env.DATABASE_URL ? '✅ SET' : '❌ NOT SET');
console.log('\n📋 Other:');
console.log('  PORT:', process.env.PORT || '❌ NOT SET');
console.log('  JWT_SECRET:', process.env.JWT_SECRET ? '✅ SET' : '❌ NOT SET');
console.log('\n' + '='.repeat(50));
// Check if .env exists
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const envPath = path_1.default.join(__dirname, '.env');
if (fs_1.default.existsSync(envPath)) {
    console.log('\n✅ .env file exists at:', envPath);
    const stats = fs_1.default.statSync(envPath);
    console.log('   File size:', stats.size, 'bytes');
    console.log('   Last modified:', stats.mtime.toLocaleString());
}
else {
    console.log('\n❌ .env file NOT FOUND at:', envPath);
}
console.log('\n💡 If variables show as NOT SET:');
console.log('   1. Make sure .env file exists in backend folder');
console.log('   2. Check spelling of variable names');
console.log('   3. Make sure there are no spaces around the = sign');
console.log('   4. Make sure values have no quotes (except FROM_EMAIL)');
