import { eq, and, isNull, sql, count } from 'drizzle-orm'
import { db } from '@/config/db.js'
import { kebeles } from '@/db/schemas/tenancy.js'
import { farmers } from '@/db/schemas/farmers.js'
import type { CreateKebeleInput, UpdateKebeleInput, KebeleRow } from '@repo/shared'

function rowToKebeleRow(row: typeof kebeles.$inferSelect): KebeleRow {
  return {
    id:                row.id,
    cityOfficeId:      row.cityOfficeId,
    name:              row.name,
    boundary:          row.boundary ?? null,
    centroidLatitude:  row.centroidLatitude ?? null,
    centroidLongitude: row.centroidLongitude ?? null,
    radiusMeters:      row.radiusMeters ?? null,
    createdAt:         row.createdAt.toISOString(),
    updatedAt:         row.updatedAt.toISOString(),
    deletedAt:         row.deletedAt?.toISOString() ?? null,
  }
}

export async function listKebeles(cityOfficeId: string): Promise<KebeleRow[]> {
  const rows = await db
    .select()
    .from(kebeles)
    .where(and(eq(kebeles.cityOfficeId, cityOfficeId), isNull(kebeles.deletedAt)))
    .orderBy(kebeles.name)

  return rows.map(rowToKebeleRow)
}

export async function createKebele(
  data: CreateKebeleInput,
  cityOfficeId: string
): Promise<KebeleRow> {
  const [row] = await db
    .insert(kebeles)
    .values({
      cityOfficeId,
      name:              data.name,
      boundary:          data.boundary
        ? sql`ST_GeomFromGeoJSON(${JSON.stringify(data.boundary)})::geography`
        : null,
      centroidLatitude:  data.centroidLatitude !== undefined ? data.centroidLatitude.toString() : null,
      centroidLongitude: data.centroidLongitude !== undefined ? data.centroidLongitude.toString() : null,
      radiusMeters:      data.radiusMeters ?? null,
    })
    .returning()

  return rowToKebeleRow(row!)
}

export async function updateKebele(
  id: string,
  cityOfficeId: string,
  data: UpdateKebeleInput
): Promise<KebeleRow | null> {
  // Build typed update — can't use a generic Record cast with this version of Drizzle
  // so we use explicit conditional updates
  const hasName       = data.name !== undefined
  const hasBoundary   = data.boundary !== undefined
  const hasLat        = data.centroidLatitude !== undefined
  const hasLng        = data.centroidLongitude !== undefined
  const hasRadius     = data.radiusMeters !== undefined

  let qb = db
    .update(kebeles)
    .set({
      ...(hasName       ? { name: data.name! } : {}),
      ...(hasRadius     ? { radiusMeters: data.radiusMeters! } : {}),
      ...(hasLat        ? { centroidLatitude: data.centroidLatitude!.toString() } : {}),
      ...(hasLng        ? { centroidLongitude: data.centroidLongitude!.toString() } : {}),
      ...(hasBoundary   ? { boundary: data.boundary ? sql`ST_GeomFromGeoJSON(${JSON.stringify(data.boundary)})::geography` : null } : {}),
      updatedAt: new Date(),
    })

  const [row] = await qb
    .where(and(eq(kebeles.id, id), eq(kebeles.cityOfficeId, cityOfficeId), isNull(kebeles.deletedAt)))
    .returning()

  if (!row) return null
  return rowToKebeleRow(row)
}

export async function deleteKebele(
  id: string,
  cityOfficeId: string
): Promise<{ success: true } | { error: 'has_farmers' }> {
  // Check if any active farmers are assigned to this kebele
  const [farmersCount] = await db
    .select({ n: count() })
    .from(farmers)
    .where(and(eq(farmers.kebeleId, id), isNull(farmers.deletedAt)))

  if ((farmersCount?.n ?? 0) > 0) {
    return { error: 'has_farmers' }
  }

  await db.transaction(async (tx) => {
    // Soft-delete the kebele
    await tx
      .update(kebeles)
      .set({ deletedAt: new Date() })
      .where(and(eq(kebeles.id, id), eq(kebeles.cityOfficeId, cityOfficeId)))

    // Remove kebele ID from all DAs assigned_kebele_ids in this office
    await tx.execute(
      sql`UPDATE users
          SET assigned_kebele_ids = array_remove(assigned_kebele_ids, ${id}::uuid)
          WHERE city_office_id = ${cityOfficeId}`
    )
  })

  return { success: true }
}

export async function restoreKebele(
  id: string,
  cityOfficeId: string
): Promise<KebeleRow | null> {
  const [row] = await db
    .update(kebeles)
    .set({ deletedAt: null, updatedAt: new Date() })
    .where(and(eq(kebeles.id, id), eq(kebeles.cityOfficeId, cityOfficeId)))
    .returning()

  if (!row) return null
  return rowToKebeleRow(row)
}
