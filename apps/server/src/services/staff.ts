import { eq, and, inArray, isNull, sql, gt } from 'drizzle-orm'
import { db } from '@/config/db.js'
import { users, sessions, verifications } from '@/db/schemas/auth-schema.js'
import { kebeles } from '@/db/schemas/tenancy.js'
import { auditLogs } from '@/db/schemas/sync.js'
import { auth } from '@/config/auth.js'
import { sendSms } from '@/services/sms.js'
import type { CreateStaffInput, UpdateStaffInput, StaffRow } from '@repo/shared'

function rowToStaffRow(row: typeof users.$inferSelect): StaffRow {
  return {
    id:                  row.id,
    name:                row.name,
    email:               row.email,
    phoneNumber:         row.phone_number ?? null,
    phoneNumberVerified: row.phone_number_verified,
    role:                row.role as 'da' | 'officer',
    cityOfficeId:        row.city_office_id ?? '',
    preferredLanguage:   row.preferred_language,
    assignedKebeleIds:   (row.assigned_kebele_ids ?? []) as string[],
    banned:              row.banned,
    createdAt:           row.createdAt.toISOString(),
    updatedAt:           row.updatedAt.toISOString(),
  }
}

export async function listStaff(cityOfficeId: string): Promise<StaffRow[]> {
  const rows = await db
    .select()
    .from(users)
    .where(
      and(
        eq(users.city_office_id, cityOfficeId),
        inArray(users.role, ['da', 'officer']),
        isNull(users.deleted_at)
      )
    )
    .orderBy(users.name)

  return rows.map(rowToStaffRow)
}

async function validateKebeleOwnership(
  kebeleIds: string[],
  cityOfficeId: string
): Promise<string[]> {
  if (!kebeleIds.length) return []

  const found = await db
    .select({ id: kebeles.id })
    .from(kebeles)
    .where(
      and(
        inArray(kebeles.id, kebeleIds),
        eq(kebeles.cityOfficeId, cityOfficeId),
        isNull(kebeles.deletedAt)
      )
    )

  const foundIds = new Set(found.map((r) => r.id))
  return kebeleIds.filter((id) => !foundIds.has(id))
}

export async function createStaff(
  data: CreateStaffInput,
  cityOfficeId: string
): Promise<{ row: StaffRow; invalidKebeleIds?: string[]; error?: string; message?: string }> {
  // Validate kebele ownership if any assigned
  const assignedIds = data.assignedKebeleIds ?? []
  let invalidKebeleIds: string[] | undefined

  if (assignedIds.length > 0 && data.role === 'da') {
    const invalid = await validateKebeleOwnership(assignedIds, cityOfficeId)
    if (invalid.length > 0) {
      invalidKebeleIds = invalid
      return { row: undefined as unknown as StaffRow, invalidKebeleIds }
    }
  }

  // Check live if phone is already registered
  const [existingPhone] = await db
    .select({ id: users.id })
    .from(users)
    .where(and(eq(users.phone_number, data.phoneNumber), isNull(users.deleted_at)))
    .limit(1)

  if (existingPhone) {
    return {
      row: undefined as unknown as StaffRow,
      error: 'phone_taken',
      message: 'This phone number is already registered in the system.',
    }
  }

  // Check live if username is already taken
  if (data.username) {
    const [existingUsername] = await db
      .select({ id: users.id })
      .from(users)
      .where(and(eq(users.username, data.username.toLowerCase()), isNull(users.deleted_at)))
      .limit(1)

    if (existingUsername) {
      return {
        row: undefined as unknown as StaffRow,
        error: 'username_taken',
        message: 'This username is already taken. Please choose another username.',
      }
    }
  }

  // If OTP code provided, verify against verifications table
  if (data.otpCode) {
    const [verif] = await db
      .select()
      .from(verifications)
      .where(
        and(
          eq(verifications.identifier, data.phoneNumber),
          gt(verifications.expiresAt, new Date())
        )
      )
      .limit(1)

    if (!verif) {
      return {
        row: undefined as unknown as StaffRow,
        error: 'invalid_otp',
        message: 'Verification code expired or not found. Please request a new SMS OTP.',
      }
    }

    const [storedCode] = verif.value.split(':')
    if (storedCode !== data.otpCode) {
      return {
        row: undefined as unknown as StaffRow,
        error: 'invalid_otp',
        message: 'Incorrect verification code. Please check the SMS and try again.',
      }
    }

    // Delete verified OTP record
    await db.delete(verifications).where(eq(verifications.id, verif.id))
  }

  // Generate placeholder email
  const placeholderEmail = `staff-${crypto.randomUUID()}@internal.agri.invalid`

  // Use Better Auth to create user + credential account with hashed password
  const signUpResult = await auth.api.signUpEmail({
    body: {
      name:        data.name,
      email:       placeholderEmail,
      password:    data.password,
      phoneNumber: data.phoneNumber,
    },
  })

  if (!signUpResult?.user) {
    throw new Error('Failed to create staff user via Better Auth.')
  }

  const newUserId = signUpResult.user.id

  // Update the user record with role, cityOfficeId, username, and verified status
  await db
    .update(users)
    .set({
      role:                  data.role as typeof users.$inferSelect['role'],
      city_office_id:        cityOfficeId,
      phone_number:          data.phoneNumber,
      phone_number_verified: !!data.otpCode,
      username:              data.username ? data.username.toLowerCase() : null,
      assigned_kebele_ids:   data.role === 'da' ? (assignedIds as string[]) : [],
      preferred_language:    (data.preferredLanguage ?? 'am') as typeof users.$inferSelect['preferred_language'],
    })
    .where(eq(users.id, newUserId))

  // Send SMS invitation
  try {
    await sendSms(
      data.phoneNumber,
      `Welcome to AgriIntelligence. Your temporary password is: ${data.password}. Please change it on first login.`
    )
  } catch {
    // Non-fatal — continue even if SMS fails
  }

  // Write audit log
  await db.insert(auditLogs).values({
    cityOfficeId,
    actorUserId: newUserId,
    action:      'staff.created',
    entityType:  'user',
    entityId:    newUserId,
    changesJson: { role: data.role, phoneNumber: data.phoneNumber, username: data.username },
  })

  const [updated] = await db.select().from(users).where(eq(users.id, newUserId)).limit(1)
  return { row: rowToStaffRow(updated!) }
}


export async function updateStaff(
  id: string,
  cityOfficeId: string,
  data: UpdateStaffInput
): Promise<StaffRow | { error: 'not_found' } | { error: 'invalid_kebeles'; ids: string[] }> {
  // Fetch current user
  const [current] = await db
    .select()
    .from(users)
    .where(and(eq(users.id, id), eq(users.city_office_id, cityOfficeId), isNull(users.deleted_at)))
    .limit(1)

  if (!current) return { error: 'not_found' }

  const newRole = data.role ?? current.role

  // Validate kebele ownership if provided and role is da
  const assignedIds = data.assignedKebeleIds
  if (assignedIds && newRole === 'da' && assignedIds.length > 0) {
    const invalid = await validateKebeleOwnership(assignedIds, cityOfficeId)
    if (invalid.length > 0) return { error: 'invalid_kebeles', ids: invalid }
  }

  await db
    .update(users)
    .set({
      ...(data.name !== undefined              ? { name: data.name } : {}),
      ...(data.phoneNumber !== undefined       ? { phone_number: data.phoneNumber } : {}),
      ...(data.role !== undefined              ? { role: data.role as typeof users.$inferSelect['role'] } : {}),
      ...(data.preferredLanguage !== undefined ? { preferred_language: data.preferredLanguage as typeof users.$inferSelect['preferred_language'] } : {}),
      ...(data.role === 'officer'              ? { assigned_kebele_ids: [] } :
          data.assignedKebeleIds !== undefined ? { assigned_kebele_ids: data.assignedKebeleIds as string[] } : {}),
      updatedAt: new Date(),
    })
    .where(eq(users.id, id))

  // Write audit log
  await db.insert(auditLogs).values({
    cityOfficeId,
    actorUserId: id,
    action:      'staff.updated',
    entityType:  'user',
    entityId:    id,
    changesJson: data,
  })

  const [updated] = await db.select().from(users).where(eq(users.id, id)).limit(1)
  return rowToStaffRow(updated!)
}

export async function deactivateStaff(
  id: string,
  cityOfficeId: string
): Promise<{ success: true } | { error: 'not_found' }> {
  const [current] = await db
    .select({ id: users.id })
    .from(users)
    .where(and(eq(users.id, id), eq(users.city_office_id, cityOfficeId), isNull(users.deleted_at)))
    .limit(1)

  if (!current) return { error: 'not_found' }

  await db
    .update(users)
    .set({ banned: true, ban_reason: 'Deactivated by officer' })
    .where(eq(users.id, id))

  // Revoke all sessions
  await db.delete(sessions).where(eq(sessions.userId, id))

  // Write audit log
  await db.insert(auditLogs).values({
    cityOfficeId,
    actorUserId: id,
    action:      'staff.deactivated',
    entityType:  'user',
    entityId:    id,
    changesJson: { banned: true },
  })

  return { success: true }
}

export async function reactivateStaff(
  id: string,
  cityOfficeId: string,
): Promise<{ success: true } | { error: 'not_found' }> {
  const [current] = await db
    .select({ id: users.id })
    .from(users)
    .where(and(eq(users.id, id), eq(users.city_office_id, cityOfficeId), isNull(users.deleted_at)))
    .limit(1)

  if (!current) return { error: 'not_found' }

  await db
    .update(users)
    .set({ banned: false, ban_reason: null, ban_expires_at: null })
    .where(eq(users.id, id))

  await db.insert(auditLogs).values({
    cityOfficeId,
    actorUserId: id,
    action:      'staff.reactivated',
    entityType:  'user',
    entityId:    id,
    changesJson: { banned: false },
  })

  return { success: true }
}
