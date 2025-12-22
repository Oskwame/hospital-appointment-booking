"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAuditLog = createAuditLog;
exports.logLoginAttempt = logLoginAttempt;
exports.logUserCreation = logUserCreation;
exports.logUserUpdate = logUserUpdate;
exports.logUserDeactivation = logUserDeactivation;
exports.logAppointmentCreation = logAppointmentCreation;
exports.logAppointmentUpdate = logAppointmentUpdate;
exports.logPasswordChange = logPasswordChange;
const prismaClient_1 = __importDefault(require("../prisma/prismaClient"));
/**
 * Creates an audit log entry
 * @param data - Audit log data
 * @returns Promise that resolves when log is created
 */
async function createAuditLog(data) {
    try {
        await prismaClient_1.default.auditLog.create({
            data: {
                userId: data.userId || null,
                userEmail: data.userEmail || null,
                action: data.action,
                entity: data.entity || null,
                entityId: data.entityId || null,
                details: data.details || null,
                ipAddress: data.ipAddress || null,
                userAgent: data.userAgent || null,
                status: data.status,
            },
        });
    }
    catch (error) {
        // Don't let audit logging failures break the application
        console.error('[AUDIT] Failed to create audit log:', error);
    }
}
/**
 * Logs a login attempt (success or failure)
 */
async function logLoginAttempt(email, success, ipAddress, userAgent, userId) {
    await createAuditLog({
        userId,
        userEmail: email,
        action: 'LOGIN',
        entity: 'User',
        status: success ? 'SUCCESS' : 'FAILURE',
        ipAddress,
        userAgent,
    });
}
/**
 * Logs user creation
 */
async function logUserCreation(createdUserId, createdUserEmail, creatorId, ipAddress) {
    await createAuditLog({
        userId: creatorId,
        action: 'CREATE_USER',
        entity: 'User',
        entityId: createdUserId,
        details: { email: createdUserEmail },
        status: 'SUCCESS',
        ipAddress,
    });
}
/**
 * Logs user update
 */
async function logUserUpdate(updatedUserId, updatorId, changes, ipAddress) {
    await createAuditLog({
        userId: updatorId,
        action: 'UPDATE_USER',
        entity: 'User',
        entityId: updatedUserId,
        details: changes,
        status: 'SUCCESS',
        ipAddress,
    });
}
/**
 * Logs user deactivation
 */
async function logUserDeactivation(deactivatedUserId, deactivatorId, ipAddress) {
    await createAuditLog({
        userId: deactivatorId,
        action: 'DEACTIVATE_USER',
        entity: 'User',
        entityId: deactivatedUserId,
        status: 'SUCCESS',
        ipAddress,
    });
}
/**
 * Logs appointment creation
 */
async function logAppointmentCreation(appointmentId, patientEmail, ipAddress) {
    await createAuditLog({
        userEmail: patientEmail,
        action: 'CREATE_APPOINTMENT',
        entity: 'Appointment',
        entityId: appointmentId,
        status: 'SUCCESS',
        ipAddress,
    });
}
/**
 * Logs appointment status update
 */
async function logAppointmentUpdate(appointmentId, userId, oldStatus, newStatus, ipAddress) {
    await createAuditLog({
        userId,
        action: 'UPDATE_APPOINTMENT_STATUS',
        entity: 'Appointment',
        entityId: appointmentId,
        details: { oldStatus, newStatus },
        status: 'SUCCESS',
        ipAddress,
    });
}
/**
 * Logs password change
 */
async function logPasswordChange(userId, ipAddress) {
    await createAuditLog({
        userId,
        action: 'CHANGE_PASSWORD',
        entity: 'User',
        entityId: userId,
        status: 'SUCCESS',
        ipAddress,
    });
}
