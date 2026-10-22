import { eq, and, isNull, max } from 'drizzle-orm'
import { db } from '@/config/db.js'
import { crops, cropVarieties, fertilizerRates, pestCatalog, registeredChemicals } from '@/db/schemas/catalog.js'
import { auditLogs } from '@/db/schemas/sync.js'
import type {
  CreateCropInput,
  UpdateCropInput,
  CropRow,
  CreateVarietyInput,
  UpdateVarietyInput,
  VarietyRow,
  UpsertFertilizerRateInput,
  FertilizerRateRow,
  CreatePestInput,
  UpdatePestInput,
  PestRow,
  CreateChemicalInput,
  UpdateChemicalInput,
  ChemicalRow,
} from '@repo/shared'

// ---- Crop helpers ----

function rowToCropRow(row: typeof crops.$inferSelect): CropRow {
  return {
    id:                       row.id,
    cityOfficeId:             row.cityOfficeId,
    code:                     row.code,
    nameEn:                   row.nameEn,
    nameAm:                   row.nameAm ?? null,
    nameOm:                   row.nameOm ?? null,
    nameTi:                   row.nameTi ?? null,
    maxPlausibleYieldQtPerHa: row.maxPlausibleYieldQtPerHa,
    weedingWindows:           (row.weedingWindows ?? []) as unknown[],
    recommendedSuccessors:    (row.recommendedSuccessors ?? []) as string[],
    status:                   row.status as 'active' | 'retired',
    effectiveFrom:            row.effectiveFrom,
    effectiveTo:              row.effectiveTo ?? null,
    createdAt:                row.createdAt.toISOString(),
    updatedAt:                row.updatedAt.toISOString(),
  }
}

export async function listCrops(cityOfficeId: string): Promise<CropRow[]> {
  const rows = await db
    .select()
    .from(crops)
    .where(eq(crops.cityOfficeId, cityOfficeId))
    .orderBy(crops.nameEn)

  return rows.map(rowToCropRow)
}

export async function createCrop(
  data: CreateCropInput,
  cityOfficeId: string,
  actorUserId: string
): Promise<CropRow> {
  const [row] = await db
    .insert(crops)
    .values({
      cityOfficeId,
      code:                     data.code,
      nameEn:                   data.nameEn,
      nameAm:                   data.nameAm ?? null,
      nameOm:                   data.nameOm ?? null,
      nameTi:                   data.nameTi ?? null,
      maxPlausibleYieldQtPerHa: data.maxPlausibleYieldQtPerHa?.toString() ?? '80',
      weedingWindows:           data.weedingWindows ?? [],
      recommendedSuccessors:    (data.recommendedSuccessors ?? []) as string[],
      effectiveFrom:            data.effectiveFrom ?? new Date().toISOString().split('T')[0]!,
      effectiveTo:              data.effectiveTo ?? null,
    })
    .returning()

  await db.insert(auditLogs).values({
    cityOfficeId,
    actorUserId,
    action:     'catalog.crop_created',
    entityType: 'crop',
    entityId:   row!.id,
    changesJson: { code: data.code, nameEn: data.nameEn },
  })

  return rowToCropRow(row!)
}

export async function updateCrop(
  id: string,
  cityOfficeId: string,
  data: UpdateCropInput,
  actorUserId: string
): Promise<CropRow | null> {
  // Self-successor check
  if (data.recommendedSuccessors?.includes(id)) {
    throw new Error('SELF_SUCCESSOR: A crop cannot be its own recommended successor.')
  }

  const [row] = await db
    .update(crops)
    .set({
      ...(data.nameEn !== undefined                 ? { nameEn: data.nameEn } : {}),
      ...(data.nameAm !== undefined                 ? { nameAm: data.nameAm } : {}),
      ...(data.nameOm !== undefined                 ? { nameOm: data.nameOm } : {}),
      ...(data.nameTi !== undefined                 ? { nameTi: data.nameTi } : {}),
      ...(data.maxPlausibleYieldQtPerHa !== undefined
        ? { maxPlausibleYieldQtPerHa: data.maxPlausibleYieldQtPerHa.toString() } : {}),
      ...(data.weedingWindows !== undefined          ? { weedingWindows: data.weedingWindows } : {}),
      ...(data.recommendedSuccessors !== undefined   ? { recommendedSuccessors: data.recommendedSuccessors as string[] } : {}),
      ...(data.status !== undefined                  ? { status: data.status } : {}),
      ...(data.effectiveTo !== undefined             ? { effectiveTo: data.effectiveTo } : {}),
      updatedAt: new Date(),
    })
    .where(and(eq(crops.id, id), eq(crops.cityOfficeId, cityOfficeId)))
    .returning()

  if (!row) return null

  await db.insert(auditLogs).values({
    cityOfficeId,
    actorUserId,
    action:      'catalog.crop_updated',
    entityType:  'crop',
    entityId:    id,
    changesJson: data,
  })

  return rowToCropRow(row)
}

// ---- Variety helpers ----

function rowToVarietyRow(row: typeof cropVarieties.$inferSelect): VarietyRow {
  return {
    id:            row.id,
    cityOfficeId:  row.cityOfficeId,
    cropId:        row.cropId,
    name:          row.name,
    isCertified:   row.isCertified,
    permittedZones: row.permittedZones as ('dega' | 'weyna_dega' | 'kolla')[],
    status:        row.status as 'active' | 'retired',
    effectiveFrom: row.effectiveFrom,
    effectiveTo:   row.effectiveTo ?? null,
    createdAt:     row.createdAt.toISOString(),
    updatedAt:     row.updatedAt.toISOString(),
  }
}

export async function listVarieties(cityOfficeId: string, cropId?: string): Promise<VarietyRow[]> {
  const conditions = cropId
    ? and(eq(cropVarieties.cityOfficeId, cityOfficeId), eq(cropVarieties.cropId, cropId))
    : eq(cropVarieties.cityOfficeId, cityOfficeId)

  const rows = await db
    .select()
    .from(cropVarieties)
    .where(conditions)
    .orderBy(cropVarieties.name)

  return rows.map(rowToVarietyRow)
}

export async function createVariety(
  data: CreateVarietyInput,
  cityOfficeId: string,
  actorUserId: string
): Promise<VarietyRow> {
  const [row] = await db
    .insert(cropVarieties)
    .values({
      cityOfficeId,
      cropId:        data.cropId,
      name:          data.name,
      isCertified:   data.isCertified ?? true,
      permittedZones: data.permittedZones as ('dega' | 'weyna_dega' | 'kolla')[],
      effectiveFrom: data.effectiveFrom ?? new Date().toISOString().split('T')[0]!,
      effectiveTo:   data.effectiveTo ?? null,
    })
    .returning()

  await db.insert(auditLogs).values({
    cityOfficeId,
    actorUserId,
    action:      'catalog.variety_created',
    entityType:  'crop_variety',
    entityId:    row!.id,
    changesJson: { cropId: data.cropId, name: data.name },
  })

  return rowToVarietyRow(row!)
}

export async function updateVariety(
  id: string,
  cityOfficeId: string,
  data: UpdateVarietyInput,
  actorUserId: string
): Promise<VarietyRow | null> {
  const [row] = await db
    .update(cropVarieties)
    .set({
      ...(data.name !== undefined           ? { name: data.name } : {}),
      ...(data.isCertified !== undefined    ? { isCertified: data.isCertified } : {}),
      ...(data.permittedZones !== undefined ? { permittedZones: data.permittedZones as ('dega' | 'weyna_dega' | 'kolla')[] } : {}),
      ...(data.status !== undefined         ? { status: data.status } : {}),
      ...(data.effectiveTo !== undefined    ? { effectiveTo: data.effectiveTo } : {}),
      updatedAt: new Date(),
    })
    .where(and(eq(cropVarieties.id, id), eq(cropVarieties.cityOfficeId, cityOfficeId)))
    .returning()

  if (!row) return null

  await db.insert(auditLogs).values({
    cityOfficeId,
    actorUserId,
    action:      'catalog.variety_updated',
    entityType:  'crop_variety',
    entityId:    id,
    changesJson: data,
  })

  return rowToVarietyRow(row)
}

// ---- Fertilizer rate helpers ----

function rowToFertilizerRateRow(row: typeof fertilizerRates.$inferSelect): FertilizerRateRow {
  return {
    id:           row.id,
    cityOfficeId: row.cityOfficeId,
    cropId:       row.cropId,
    agroZone:     row.agroZone as 'dega' | 'weyna_dega' | 'kolla',
    ureaKgPerHa:  row.ureaKgPerHa,
    npsKgPerHa:   row.npsKgPerHa,
    seedKgPerHa:  row.seedKgPerHa,
    ratesVersion: row.ratesVersion,
    effectiveFrom: row.effectiveFrom,
    createdAt:    row.createdAt.toISOString(),
  }
}

export async function listFertilizerRates(cityOfficeId: string): Promise<FertilizerRateRow[]> {
  const rows = await db
    .select()
    .from(fertilizerRates)
    .where(eq(fertilizerRates.cityOfficeId, cityOfficeId))
    .orderBy(fertilizerRates.effectiveFrom)

  return rows.map(rowToFertilizerRateRow)
}

export async function upsertFertilizerRate(
  data: UpsertFertilizerRateInput,
  cityOfficeId: string,
  actorUserId: string
): Promise<FertilizerRateRow> {
  // Get max version for this crop+zone+office
  const [maxResult] = await db
    .select({ maxV: max(fertilizerRates.ratesVersion) })
    .from(fertilizerRates)
    .where(
      and(
        eq(fertilizerRates.cityOfficeId, cityOfficeId),
        eq(fertilizerRates.cropId, data.cropId),
        eq(fertilizerRates.agroZone, data.agroZone as 'dega' | 'weyna_dega' | 'kolla')
      )
    )

  const nextVersion = (maxResult?.maxV ?? 0) + 1

  const [row] = await db
    .insert(fertilizerRates)
    .values({
      cityOfficeId,
      cropId:       data.cropId,
      agroZone:     data.agroZone as 'dega' | 'weyna_dega' | 'kolla',
      ureaKgPerHa:  data.ureaKgPerHa.toString(),
      npsKgPerHa:   data.npsKgPerHa.toString(),
      seedKgPerHa:  data.seedKgPerHa.toString(),
      ratesVersion: nextVersion,
      effectiveFrom: data.effectiveFrom,
      createdByUserId: actorUserId,
    })
    .returning()

  await db.insert(auditLogs).values({
    cityOfficeId,
    actorUserId,
    action:      'catalog.fertilizer_rate_upserted',
    entityType:  'fertilizer_rate',
    entityId:    row!.id,
    changesJson: { ...data, ratesVersion: nextVersion },
  })

  return rowToFertilizerRateRow(row!)
}

// ---- Pest helpers ----

function rowToPestRow(row: typeof pestCatalog.$inferSelect): PestRow {
  return {
    id:               row.id,
    cityOfficeId:     row.cityOfficeId,
    code:             row.code,
    kind:             row.kind as 'pest' | 'disease',
    name:             row.name as Record<string, string>,
    preventionAdvice: row.preventionAdvice as Record<string, string> | null,
    isQuarantinePest: row.isQuarantinePest,
    status:           row.status as 'active' | 'retired',
    createdAt:        row.createdAt.toISOString(),
    updatedAt:        row.updatedAt.toISOString(),
  }
}

export async function listPests(cityOfficeId: string): Promise<PestRow[]> {
  const rows = await db
    .select()
    .from(pestCatalog)
    .where(eq(pestCatalog.cityOfficeId, cityOfficeId))
    .orderBy(pestCatalog.code)

  return rows.map(rowToPestRow)
}

export async function createPest(
  data: CreatePestInput,
  cityOfficeId: string,
  actorUserId: string
): Promise<PestRow> {
  const [row] = await db
    .insert(pestCatalog)
    .values({
      cityOfficeId,
      code:             data.code,
      kind:             data.kind,
      name:             data.name,
      preventionAdvice: data.preventionAdvice ?? null,
      isQuarantinePest: data.isQuarantinePest ?? false,
    })
    .returning()

  await db.insert(auditLogs).values({
    cityOfficeId,
    actorUserId,
    action:      'catalog.pest_created',
    entityType:  'pest_catalog',
    entityId:    row!.id,
    changesJson: { code: data.code, kind: data.kind },
  })

  return rowToPestRow(row!)
}

export async function updatePest(
  id: string,
  cityOfficeId: string,
  data: UpdatePestInput,
  actorUserId: string
): Promise<PestRow | null> {
  const [row] = await db
    .update(pestCatalog)
    .set({
      ...(data.name !== undefined             ? { name: data.name } : {}),
      ...(data.preventionAdvice !== undefined ? { preventionAdvice: data.preventionAdvice } : {}),
      ...(data.isQuarantinePest !== undefined ? { isQuarantinePest: data.isQuarantinePest } : {}),
      ...(data.status !== undefined           ? { status: data.status } : {}),
      updatedAt: new Date(),
    })
    .where(and(eq(pestCatalog.id, id), eq(pestCatalog.cityOfficeId, cityOfficeId)))
    .returning()

  if (!row) return null

  await db.insert(auditLogs).values({
    cityOfficeId,
    actorUserId,
    action:      'catalog.pest_updated',
    entityType:  'pest_catalog',
    entityId:    id,
    changesJson: data,
  })

  return rowToPestRow(row)
}

// ---- Chemical helpers ----

function rowToChemicalRow(row: typeof registeredChemicals.$inferSelect): ChemicalRow {
  return {
    id:                     row.id,
    cityOfficeId:           row.cityOfficeId,
    brandName:              row.brandName,
    activeIngredient:       row.activeIngredient,
    registrationNumber:     row.registrationNumber,
    category:               row.category as 'insecticide' | 'fungicide' | 'herbicide' | 'other',
    dosageText:             row.dosageText as Record<string, string>,
    protectiveEquipmentText: row.protectiveEquipmentText as Record<string, string> | null,
    safetyIntervalDays:     row.safetyIntervalDays,
    permittedZones:         row.permittedZones as ('dega' | 'weyna_dega' | 'kolla')[] | null,
    targetCropIds:          (row.targetCropIds ?? []) as string[],
    targetPestIds:          (row.targetPestIds ?? []) as string[],
    status:                 row.status as 'active' | 'retired',
    effectiveFrom:          row.effectiveFrom,
    effectiveTo:            row.effectiveTo ?? null,
    createdAt:              row.createdAt.toISOString(),
    updatedAt:              row.updatedAt.toISOString(),
  }
}

export async function listChemicals(cityOfficeId: string): Promise<ChemicalRow[]> {
  const rows = await db
    .select()
    .from(registeredChemicals)
    .where(eq(registeredChemicals.cityOfficeId, cityOfficeId))
    .orderBy(registeredChemicals.brandName)

  return rows.map(rowToChemicalRow)
}

export async function createChemical(
  data: CreateChemicalInput,
  cityOfficeId: string,
  actorUserId: string
): Promise<ChemicalRow> {
  const [row] = await db
    .insert(registeredChemicals)
    .values({
      cityOfficeId,
      brandName:              data.brandName,
      activeIngredient:       data.activeIngredient,
      registrationNumber:     data.registrationNumber,
      category:               data.category,
      dosageText:             data.dosageText,
      protectiveEquipmentText: data.protectiveEquipmentText ?? null,
      safetyIntervalDays:     data.safetyIntervalDays,
      permittedZones:         data.permittedZones as ('dega' | 'weyna_dega' | 'kolla')[] | undefined,
      targetCropIds:          (data.targetCropIds ?? []) as string[],
      targetPestIds:          (data.targetPestIds ?? []) as string[],
      effectiveFrom:          data.effectiveFrom ?? new Date().toISOString().split('T')[0]!,
      effectiveTo:            data.effectiveTo ?? null,
    })
    .returning()

  await db.insert(auditLogs).values({
    cityOfficeId,
    actorUserId,
    action:      'catalog.chemical_created',
    entityType:  'registered_chemical',
    entityId:    row!.id,
    changesJson: { brandName: data.brandName, registrationNumber: data.registrationNumber },
  })

  return rowToChemicalRow(row!)
}

export async function updateChemical(
  id: string,
  cityOfficeId: string,
  data: UpdateChemicalInput,
  actorUserId: string
): Promise<ChemicalRow | null> {
  const [row] = await db
    .update(registeredChemicals)
    .set({
      ...(data.brandName !== undefined               ? { brandName: data.brandName } : {}),
      ...(data.dosageText !== undefined              ? { dosageText: data.dosageText } : {}),
      ...(data.protectiveEquipmentText !== undefined ? { protectiveEquipmentText: data.protectiveEquipmentText } : {}),
      ...(data.safetyIntervalDays !== undefined      ? { safetyIntervalDays: data.safetyIntervalDays } : {}),
      ...(data.permittedZones !== undefined          ? { permittedZones: data.permittedZones as ('dega' | 'weyna_dega' | 'kolla')[] } : {}),
      ...(data.targetCropIds !== undefined           ? { targetCropIds: data.targetCropIds as string[] } : {}),
      ...(data.targetPestIds !== undefined           ? { targetPestIds: data.targetPestIds as string[] } : {}),
      ...(data.status !== undefined                  ? { status: data.status } : {}),
      ...(data.effectiveTo !== undefined             ? { effectiveTo: data.effectiveTo } : {}),
      updatedAt: new Date(),
    })
    .where(and(eq(registeredChemicals.id, id), eq(registeredChemicals.cityOfficeId, cityOfficeId)))
    .returning()

  if (!row) return null

  await db.insert(auditLogs).values({
    cityOfficeId,
    actorUserId,
    action:      'catalog.chemical_updated',
    entityType:  'registered_chemical',
    entityId:    id,
    changesJson: data,
  })

  return rowToChemicalRow(row)
}

export async function retireChemical(
  id: string,
  cityOfficeId: string,
  actorUserId: string
): Promise<ChemicalRow | null> {
  const today = new Date().toISOString().split('T')[0]!

  const [row] = await db
    .update(registeredChemicals)
    .set({ status: 'retired', effectiveTo: today, updatedAt: new Date() })
    .where(and(eq(registeredChemicals.id, id), eq(registeredChemicals.cityOfficeId, cityOfficeId)))
    .returning()

  if (!row) return null

  await db.insert(auditLogs).values({
    cityOfficeId,
    actorUserId,
    action:      'catalog.chemical_retired',
    entityType:  'registered_chemical',
    entityId:    id,
    changesJson: { status: 'retired', effectiveTo: today },
  })

  return rowToChemicalRow(row)
}

export async function unretireChemical(
  id: string,
  cityOfficeId: string,
  actorUserId: string
): Promise<ChemicalRow | null> {
  const [row] = await db
    .update(registeredChemicals)
    .set({ status: 'active', effectiveTo: null, updatedAt: new Date() })
    .where(and(eq(registeredChemicals.id, id), eq(registeredChemicals.cityOfficeId, cityOfficeId)))
    .returning()

  if (!row) return null

  await db.insert(auditLogs).values({
    cityOfficeId,
    actorUserId,
    action:      'catalog.chemical_unretired',
    entityType:  'registered_chemical',
    entityId:    id,
    changesJson: { status: 'active', effectiveTo: null },
  })

  return rowToChemicalRow(row)
}
