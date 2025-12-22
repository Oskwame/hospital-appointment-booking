import prisma from '../prisma/prismaClient'

export interface AuditLogData {
    userId?: number
    userEmail?: string
    action: string
    entity?: string
    entityId?: number
    details?: any
    ipAddress?: string
    userAgent?: string
    status: 'SUCCESS' | 'FAILURE' | 'ERROR'
}

/**
 * Creates an audit log entry
 * @param data - Audit log data
 * @returns Promise that resolves when log is created
 */
export async function createAuditLog(data: AuditLogData): Promise<void> {
    try {
        await prisma.auditLog.create({
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
        })
    } catch (error) {
        // Don't let audit logging failures break the application
        console.error('[AUDIT] Failed to create audit log:', error)
    }
}

/**
 * Logs a login attempt (success or failure)
 */
export async function logLoginAttempt(
    email: string,
    success: boolean,
    ipAddress?: string,
    userAgent?: string,
    userId?: number
): Promise<void> {
    await createAuditLog({
        userId,
        userEmail: email,
        action: 'LOGIN',
        entity: 'User',
        status: success ? 'SUCCESS' : 'FAILURE',
        ipAddress,
        userAgent,
    })
}

/**
 * Logs user creation
 */
export async function logUserCreation(
    createdUserId: number,
    createdUserEmail: string,
    creatorId: number,
    ipAddress?: string
): Promise<void> {
    await createAuditLog({
        userId: creatorId,
        action: 'CREATE_USER',
        entity: 'User',
        entityId: createdUserId,
        details: { email: createdUserEmail },
        status: 'SUCCESS',
        ipAddress,
    })
}

/**
 * Logs user update
 */
export async function logUserUpdate(
    updatedUserId: number,
    updatorId: number,
    changes: any,
    ipAddress?: string
): Promise<void> {
    await createAuditLog({
        userId: updatorId,
        action: 'UPDATE_USER',
        entity: 'User',
        entityId: updatedUserId,
        details: changes,
        status: 'SUCCESS',
        ipAddress,
    })
}

/**
 * Logs user deactivation
 */
export async function logUserDeactivation(
    deactivatedUserId: number,
    deactivatorId: number,
    ipAddress?: string
): Promise<void> {
    await createAuditLog({
        userId: deactivatorId,
        action: 'DEACTIVATE_USER',
        entity: 'User',
        entityId: deactivatedUserId,
        status: 'SUCCESS',
        ipAddress,
    })
}

/**
 * Logs appointment creation
 */
export async function logAppointmentCreation(
    appointmentId: number,
    patientEmail: string,
    ipAddress?: string
): Promise<void> {
    await createAuditLog({
        userEmail: patientEmail,
        action: 'CREATE_APPOINTMENT',
        entity: 'Appointment',
        entityId: appointmentId,
        status: 'SUCCESS',
        ipAddress,
    })
}

/**
 * Logs appointment status update
 */
export async function logAppointmentUpdate(
    appointmentId: number,
    userId: number,
    oldStatus: string,
    newStatus: string,
    ipAddress?: string
): Promise<void> {
    await createAuditLog({
        userId,
        action: 'UPDATE_APPOINTMENT_STATUS',
        entity: 'Appointment',
        entityId: appointmentId,
        details: { oldStatus, newStatus },
        status: 'SUCCESS',
        ipAddress,
    })
}

/**
 * Logs password change
 */
export async function logPasswordChange(
    userId: number,
    ipAddress?: string
): Promise<void> {
    await createAuditLog({
        userId,
        action: 'CHANGE_PASSWORD',
        entity: 'User',
        entityId: userId,
        status: 'SUCCESS',
        ipAddress,
    })
}
