import { eq, and, isNull, sql, inArray } from 'drizzle-orm'
import { db } from '@/config/db.js'
import { farmers, plots } from '@/db/schemas/farmers.js'
import { users } from '@/db/schemas/auth-schema.js'
import { kebeles, cityOffices } from '@/db/schemas/tenancy.js'
import { auditLogs } from '@/db/schemas/sync.js'
import type {
  FarmerOnboardingInput,
  ProxyFarmerOnboardingInput,
  UpdateFarmerProfileInput,
  ClaimFarmerProfileInput,
  FarmerProfileRow,
  FarmerWithPlotsSummary,
  PaginatedResponse,
} from '@repo/shared'

export function rowToFarmerProfile(
  row: typeof farmers.$inferSelect,
  kebeleName?: string | null,
  assignedDaName?: string | null
): FarmerProfileRow {
  return {
    id: row.id,
    cityOfficeId: row.cityOfficeId,
    userId: row.userId ?? null,
    fullName: row.fullName,
    phoneNumber: row.phoneNumber ?? null,
    hasNoPhone: row.hasNoPhone,
    localIdNumber: row.localIdNumber,
    kebeleId: row.kebeleId,
    kebeleName: kebeleName ?? undefined,
    assignedDaUserId: row.assignedDaUserId ?? null,
    assignedDaName: assignedDaName ?? undefined,
    registeredByUserId: row.registeredByUserId ?? null,
    preferredLanguage: row.preferredLanguage,
    isVerified: row.isVerified,
    consentAgreed: row.consentAgreed,
    consentAgreedAt: row.consentAgreedAt ? row.consentAgreedAt.toISOString() : null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }
}

export async function getFarmerProfileByUserId(userId: string): Promise<FarmerProfileRow | null> {
  const rows = await db
    .select({
      farmer: farmers,
      kebeleName: kebeles.name,
      daName: users.name,
    })
    .from(farmers)
    .leftJoin(kebeles, eq(farmers.kebeleId, kebeles.id))
    .leftJoin(users, eq(farmers.assignedDaUserId, users.id))
    .where(and(eq(farmers.userId, userId), isNull(farmers.deletedAt)))
    .limit(1)

  if (!rows.length || !rows[0]) return null
  const { farmer, kebeleName, daName } = rows[0]
  return rowToFarmerProfile(farmer, kebeleName, daName)
}

export async function getFarmerById(
  farmerId: string,
  cityOfficeId?: string
): Promise<FarmerProfileRow | null> {
  const conditions = [eq(farmers.id, farmerId), isNull(farmers.deletedAt)]
  if (cityOfficeId) {
    conditions.push(eq(farmers.cityOfficeId, cityOfficeId))
  }

  const rows = await db
    .select({
      farmer: farmers,
      kebeleName: kebeles.name,
      daName: users.name,
    })
    .from(farmers)
    .leftJoin(kebeles, eq(farmers.kebeleId, kebeles.id))
    .leftJoin(users, eq(farmers.assignedDaUserId, users.id))
    .where(and(...conditions))
    .limit(1)

  if (!rows.length || !rows[0]) return null
  const { farmer, kebeleName, daName } = rows[0]
  return rowToFarmerProfile(farmer, kebeleName, daName)
}

export async function createSelfFarmerProfile(
  userId: string,
  data: FarmerOnboardingInput
): Promise<{ row?: FarmerProfileRow; error?: string; message?: string }> {
  // Check if user exists
  const [user] = await db
    .select()
    .from(users)
    .where(and(eq(users.id, userId), isNull(users.deleted_at)))
    .limit(1)

  if (!user) {
    return { error: 'user_not_found', message: 'User account not found.' }
  }

  // Check if user already has a farmer profile
  const [existingFarmer] = await db
    .select({ id: farmers.id })
    .from(farmers)
    .where(and(eq(farmers.userId, userId), isNull(farmers.deletedAt)))
    .limit(1)

  if (existingFarmer) {
    return { error: 'profile_exists', message: 'Farmer profile is already registered.' }
  }

  // Verify kebele exists
  const [kebele] = await db
    .select({ id: kebeles.id, cityOfficeId: kebeles.cityOfficeId, name: kebeles.name })
    .from(kebeles)
    .where(and(eq(kebeles.id, data.kebeleId), isNull(kebeles.deletedAt)))
    .limit(1)

  if (!kebele) {
    return { error: 'kebele_not_found', message: 'Specified kebele does not exist.' }
  }

  const cityOfficeId = kebele.cityOfficeId

  // Verify local ID uniqueness within city office
  const [duplicateLocalId] = await db
    .select({ id: farmers.id })
    .from(farmers)
    .where(
      and(
        eq(farmers.cityOfficeId, cityOfficeId),
        eq(farmers.localIdNumber, data.localIdNumber.trim()),
        isNull(farmers.deletedAt)
      )
    )
    .limit(1)

  if (duplicateLocalId) {
    return {
      error: 'duplicate_local_id',
      message: 'Local ID number is already registered in this city jurisdiction.',
    }
  }

  // Update user's office, name, preferred language
  await db
    .update(users)
    .set({
      city_office_id: cityOfficeId,
      name: data.fullName.trim(),
      preferred_language: data.preferredLanguage,
    })
    .where(eq(users.id, userId))

  // Insert farmer record (self-registered -> isVerified is false by default)
  const [newFarmer] = await db
    .insert(farmers)
    .values({
      cityOfficeId,
      userId,
      fullName: data.fullName.trim(),
      phoneNumber: user.phone_number ?? null,
      hasNoPhone: !user.phone_number,
      localIdNumber: data.localIdNumber.trim(),
      kebeleId: data.kebeleId,
      registeredByUserId: userId,
      preferredLanguage: data.preferredLanguage,
      isVerified: false,
      consentAgreed: true,
      consentAgreedAt: new Date(),
    })
    .returning()

  if (!newFarmer) {
    return { error: 'insert_failed', message: 'Failed to create farmer record.' }
  }

  // Audit log
  await db.insert(auditLogs).values({
    cityOfficeId,
    actorUserId: userId,
    action: 'farmer.onboard_self',
    entityType: 'farmer',
    entityId: newFarmer.id,
    changesJson: {
      fullName: newFarmer.fullName,
      localIdNumber: newFarmer.localIdNumber,
      kebeleId: newFarmer.kebeleId,
      isVerified: false,
    },
  })

  return { row: rowToFarmerProfile(newFarmer, kebele.name) }
}

export async function createProxyFarmerProfile(
  actorUserId: string,
  cityOfficeId: string,
  data: ProxyFarmerOnboardingInput
): Promise<{ row?: FarmerProfileRow; error?: string; message?: string }> {
  // Verify actor role
  const [actor] = await db
    .select()
    .from(users)
    .where(and(eq(users.id, actorUserId), isNull(users.deleted_at)))
    .limit(1)

  if (!actor || (actor.role !== 'da' && actor.role !== 'officer')) {
    return { error: 'forbidden', message: 'Only DAs or Officers can register proxy farmer profiles.' }
  }

  // Verify kebele belongs to office
  const [kebele] = await db
    .select({ id: kebeles.id, name: kebeles.name })
    .from(kebeles)
    .where(
      and(
        eq(kebeles.id, data.kebeleId),
        eq(kebeles.cityOfficeId, cityOfficeId),
        isNull(kebeles.deletedAt)
      )
    )
    .limit(1)

  if (!kebele) {
    return { error: 'kebele_not_found', message: 'Kebele not found in this city jurisdiction.' }
  }

  // Verify local ID uniqueness in office
  const [duplicateLocalId] = await db
    .select({ id: farmers.id })
    .from(farmers)
    .where(
      and(
        eq(farmers.cityOfficeId, cityOfficeId),
        eq(farmers.localIdNumber, data.localIdNumber.trim()),
        isNull(farmers.deletedAt)
      )
    )
    .limit(1)

  if (duplicateLocalId) {
    return {
      error: 'duplicate_local_id',
      message: 'Local ID number is already registered in this city jurisdiction.',
    }
  }

  const assignedDa =
    data.assignedDaUserId ?? (actor.role === 'da' ? actor.id : null)

  const hasNoPhone = !data.phoneNumber

  // Proxy registered by DA / Officer -> isVerified = true automatically
  const [newFarmer] = await db
    .insert(farmers)
    .values({
      cityOfficeId,
      userId: null,
      fullName: data.fullName.trim(),
      phoneNumber: data.phoneNumber ?? null,
      hasNoPhone,
      localIdNumber: data.localIdNumber.trim(),
      kebeleId: data.kebeleId,
      assignedDaUserId: assignedDa,
      registeredByUserId: actorUserId,
      preferredLanguage: data.preferredLanguage ?? 'am',
      isVerified: true,
      consentAgreed: data.consentAgreed ?? true,
      consentAgreedAt: new Date(),
    })
    .returning()

  if (!newFarmer) {
    return { error: 'insert_failed', message: 'Failed to create proxy farmer.' }
  }

  // Audit log
  await db.insert(auditLogs).values({
    cityOfficeId,
    actorUserId,
    action: 'farmer.create_proxy',
    entityType: 'farmer',
    entityId: newFarmer.id,
    changesJson: {
      fullName: newFarmer.fullName,
      localIdNumber: newFarmer.localIdNumber,
      hasNoPhone,
      isVerified: true,
      assignedDaUserId: assignedDa,
    },
  })

  return { row: rowToFarmerProfile(newFarmer, kebele.name) }
}

export async function claimFarmerProfile(
  userId: string,
  data: ClaimFarmerProfileInput
): Promise<{ row?: FarmerProfileRow; error?: string; message?: string }> {
  const [user] = await db
    .select()
    .from(users)
    .where(and(eq(users.id, userId), isNull(users.deleted_at)))
    .limit(1)

  if (!user) {
    return { error: 'user_not_found', message: 'User account not found.' }
  }

  // Check if this user already owns a farmer profile
  const [alreadyFarmer] = await db
    .select({ id: farmers.id })
    .from(farmers)
    .where(and(eq(farmers.userId, userId), isNull(farmers.deletedAt)))
    .limit(1)

  if (alreadyFarmer) {
    return { error: 'already_claimed', message: 'You already have an active farmer profile.' }
  }

  // Find proxy profile by local ID number with null userId
  const candidates = await db
    .select({
      farmer: farmers,
      kebeleName: kebeles.name,
    })
    .from(farmers)
    .leftJoin(kebeles, eq(farmers.kebeleId, kebeles.id))
    .where(
      and(
        eq(farmers.localIdNumber, data.localIdNumber.trim()),
        isNull(farmers.userId),
        isNull(farmers.deletedAt)
      )
    )

  if (!candidates.length || !candidates[0]) {
    return {
      error: 'profile_not_found',
      message: 'No unclaimed proxy profile found with this local ID number.',
    }
  }

  const { farmer: targetFarmer, kebeleName } = candidates[0]

  // Link farmer profile to user
  const [updatedFarmer] = await db
    .update(farmers)
    .set({
      userId,
      phoneNumber: user.phone_number ?? targetFarmer.phoneNumber,
      hasNoPhone: !user.phone_number,
      updatedAt: new Date(),
    })
    .where(eq(farmers.id, targetFarmer.id))
    .returning()

  // Update user's office & name
  await db
    .update(users)
    .set({
      city_office_id: targetFarmer.cityOfficeId,
      name: targetFarmer.fullName,
    })
    .where(eq(users.id, userId))

  // Audit log
  await db.insert(auditLogs).values({
    cityOfficeId: targetFarmer.cityOfficeId,
    actorUserId: userId,
    action: 'farmer.claim',
    entityType: 'farmer',
    entityId: targetFarmer.id,
    changesJson: {
      userId,
      phoneNumber: user.phone_number,
      localIdNumber: data.localIdNumber.trim(),
    },
  })

  return { row: rowToFarmerProfile(updatedFarmer!, kebeleName) }
}

export async function updateFarmerProfile(
  farmerId: string,
  data: UpdateFarmerProfileInput,
  actorUserId?: string
): Promise<{ row?: FarmerProfileRow; error?: string; message?: string }> {
  const [existing] = await db
    .select()
    .from(farmers)
    .where(and(eq(farmers.id, farmerId), isNull(farmers.deletedAt)))
    .limit(1)

  if (!existing) {
    return { error: 'not_found', message: 'Farmer not found.' }
  }

  const updateSet: Partial<typeof farmers.$inferInsert> = {
    updatedAt: new Date(),
  }

  if (data.fullName !== undefined) updateSet.fullName = data.fullName.trim()
  if (data.preferredLanguage !== undefined) updateSet.preferredLanguage = data.preferredLanguage
  if (data.consentAgreed !== undefined) {
    updateSet.consentAgreed = data.consentAgreed
    if (data.consentAgreed) updateSet.consentAgreedAt = new Date()
  }
  if (data.kebeleId !== undefined) {
    // verify kebele belongs to office
    const [kb] = await db
      .select({ id: kebeles.id })
      .from(kebeles)
      .where(
        and(
          eq(kebeles.id, data.kebeleId),
          eq(kebeles.cityOfficeId, existing.cityOfficeId),
          isNull(kebeles.deletedAt)
        )
      )
      .limit(1)
    if (!kb) return { error: 'invalid_kebele', message: 'Kebele not found in city office.' }
    updateSet.kebeleId = data.kebeleId
  }

  const [updated] = await db
    .update(farmers)
    .set(updateSet)
    .where(eq(farmers.id, farmerId))
    .returning()

  if (actorUserId) {
    await db.insert(auditLogs).values({
      cityOfficeId: existing.cityOfficeId,
      actorUserId,
      action: 'farmer.update',
      entityType: 'farmer',
      entityId: farmerId,
      changesJson: data as Record<string, unknown>,
    })
  }

  return { row: rowToFarmerProfile(updated!) }
}

export async function verifyFarmer(
  farmerId: string,
  cityOfficeId: string,
  actorUserId: string
): Promise<{ row?: FarmerProfileRow; error?: string; message?: string }> {
  const [farmer] = await db
    .select()
    .from(farmers)
    .where(
      and(
        eq(farmers.id, farmerId),
        eq(farmers.cityOfficeId, cityOfficeId),
        isNull(farmers.deletedAt)
      )
    )
    .limit(1)

  if (!farmer) {
    return { error: 'not_found', message: 'Farmer not found.' }
  }

  const [updated] = await db
    .update(farmers)
    .set({
      isVerified: true,
      updatedAt: new Date(),
    })
    .where(eq(farmers.id, farmerId))
    .returning()

  // Audit log
  await db.insert(auditLogs).values({
    cityOfficeId,
    actorUserId,
    action: 'farmer.verify',
    entityType: 'farmer',
    entityId: farmerId,
    changesJson: { isVerified: true, previous: farmer.isVerified },
  })

  return { row: rowToFarmerProfile(updated!) }
}

export async function assignFarmerToDa(
  farmerId: string,
  cityOfficeId: string,
  daUserId: string,
  actorUserId: string
): Promise<{ row?: FarmerProfileRow; error?: string; message?: string }> {
  // Verify DA belongs to office
  const [daUser] = await db
    .select({ id: users.id, name: users.name })
    .from(users)
    .where(
      and(
        eq(users.id, daUserId),
        eq(users.city_office_id, cityOfficeId),
        eq(users.role, 'da'),
        isNull(users.deleted_at)
      )
    )
    .limit(1)

  if (!daUser) {
    return { error: 'invalid_da', message: 'Development agent not found in this city office.' }
  }

  const [updated] = await db
    .update(farmers)
    .set({
      assignedDaUserId: daUserId,
      updatedAt: new Date(),
    })
    .where(and(eq(farmers.id, farmerId), eq(farmers.cityOfficeId, cityOfficeId)))
    .returning()

  if (!updated) {
    return { error: 'not_found', message: 'Farmer not found.' }
  }

  await db.insert(auditLogs).values({
    cityOfficeId,
    actorUserId,
    action: 'farmer.assign_da',
    entityType: 'farmer',
    entityId: farmerId,
    changesJson: { assignedDaUserId: daUserId, assignedDaName: daUser.name },
  })

  return { row: rowToFarmerProfile(updated, undefined, daUser.name) }
}

export async function bulkAssignFarmersToDa(
  farmerIds: string[],
  cityOfficeId: string,
  daUserId: string,
  actorUserId: string
): Promise<{ updatedCount: number; error?: string; message?: string }> {
  const [daUser] = await db
    .select({ id: users.id, name: users.name })
    .from(users)
    .where(
      and(
        eq(users.id, daUserId),
        eq(users.city_office_id, cityOfficeId),
        eq(users.role, 'da'),
        isNull(users.deleted_at)
      )
    )
    .limit(1)

  if (!daUser) {
    return { updatedCount: 0, error: 'invalid_da', message: 'DA user not found in this office.' }
  }

  const updatedRows = await db
    .update(farmers)
    .set({
      assignedDaUserId: daUserId,
      updatedAt: new Date(),
    })
    .where(
      and(
        inArray(farmers.id, farmerIds),
        eq(farmers.cityOfficeId, cityOfficeId),
        isNull(farmers.deletedAt)
      )
    )
    .returning({ id: farmers.id })

  await db.insert(auditLogs).values({
    cityOfficeId,
    actorUserId,
    action: 'farmer.bulk_assign_da',
    entityType: 'farmer',
    changesJson: { count: updatedRows.length, farmerIds, assignedDaUserId: daUserId },
  })

  return { updatedCount: updatedRows.length }
}

export async function listFarmers(
  cityOfficeId: string,
  options: {
    q?: string
    kebeleId?: string
    assignedDaUserId?: string
    isVerified?: 'all' | 'true' | 'false'
    page?: number
    limit?: number
  }
): Promise<PaginatedResponse<FarmerProfileRow>> {
  const page = options.page && options.page > 0 ? options.page : 1
  const limit = options.limit && options.limit > 0 ? options.limit : 50
  const offset = (page - 1) * limit

  const conditions = [eq(farmers.cityOfficeId, cityOfficeId), isNull(farmers.deletedAt)]

  if (options.kebeleId) {
    conditions.push(eq(farmers.kebeleId, options.kebeleId))
  }
  if (options.assignedDaUserId) {
    conditions.push(eq(farmers.assignedDaUserId, options.assignedDaUserId))
  }
  if (options.isVerified === 'true') {
    conditions.push(eq(farmers.isVerified, true))
  } else if (options.isVerified === 'false') {
    conditions.push(eq(farmers.isVerified, false))
  }
  if (options.q) {
    const term = `%${options.q.trim()}%`
    conditions.push(
      sql`(${farmers.fullName} ILIKE ${term} OR ${farmers.localIdNumber} ILIKE ${term} OR ${farmers.phoneNumber} ILIKE ${term})`
    )
  }

  const [totalRes] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(farmers)
    .where(and(...conditions))

  const total = totalRes?.count ?? 0

  const rows = await db
    .select({
      farmer: farmers,
      kebeleName: kebeles.name,
      daName: users.name,
    })
    .from(farmers)
    .leftJoin(kebeles, eq(farmers.kebeleId, kebeles.id))
    .leftJoin(users, eq(farmers.assignedDaUserId, users.id))
    .where(and(...conditions))
    .orderBy(farmers.fullName)
    .limit(limit)
    .offset(offset)

  return {
    data: rows.map((r) => rowToFarmerProfile(r.farmer, r.kebeleName, r.daName)),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit) || 1,
  }
}
