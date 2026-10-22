import { eq, and, isNull, sql, inArray } from 'drizzle-orm'
import { db } from '@/config/db.js'
import { farmers, plots } from '@/db/schemas/farmers.js'
import { kebeles, cityOffices } from '@/db/schemas/tenancy.js'
import { users } from '@/db/schemas/auth-schema.js'
import { crops } from '@/db/schemas/catalog.js'
import { auditLogs } from '@/db/schemas/sync.js'
import type {
  RegistryFilterInput,
  ExportRegistryInput,
  PaginatedResponse,
  RegistryFarmerItem,
  RegistrySummaryMetrics,
  RegistryPlotDetail,
  AreaUnit,
} from '@repo/shared'

export async function getOfficeConversionFactors(cityOfficeId: string): Promise<{
  timadToHa: number
  kertToHa: number
  hectareToHa: number
}> {
  const [office] = await db
    .select({ parameters: cityOffices.parameters })
    .from(cityOffices)
    .where(eq(cityOffices.id, cityOfficeId))
    .limit(1)

  const params = (office?.parameters ?? {}) as Record<string, unknown>
  return {
    timadToHa: typeof params['land_unit.timad_to_ha'] === 'number' ? params['land_unit.timad_to_ha'] : 0.25,
    kertToHa: typeof params['land_unit.kert_to_ha'] === 'number' ? params['land_unit.kert_to_ha'] : 0.25,
    hectareToHa: typeof params['land_unit.hectare_to_ha'] === 'number' ? params['land_unit.hectare_to_ha'] : 1.0,
  }
}

export function convertHectaresToUnit(
  hectares: number,
  targetUnit: AreaUnit,
  factors: { timadToHa: number; kertToHa: number }
): number {
  if (targetUnit === 'timad') {
    return hectares / (factors.timadToHa || 0.25)
  }
  if (targetUnit === 'kert') {
    return hectares / (factors.kertToHa || 0.25)
  }
  return hectares
}

export async function queryMunicipalRegistry(
  cityOfficeId: string,
  filter: RegistryFilterInput
): Promise<{
  paginated: PaginatedResponse<RegistryFarmerItem>
  summary: RegistrySummaryMetrics
}> {
  const page = filter.page && filter.page > 0 ? filter.page : 1
  const limit = filter.limit && filter.limit > 0 ? filter.limit : 50
  const offset = (page - 1) * limit
  const displayUnit: AreaUnit = filter.unit ?? 'hectare'

  const factors = await getOfficeConversionFactors(cityOfficeId)

  // Farmer filter conditions
  const farmerConditions = [
    eq(farmers.cityOfficeId, cityOfficeId),
    isNull(farmers.deletedAt),
  ]

  if (filter.kebeleId) {
    farmerConditions.push(eq(farmers.kebeleId, filter.kebeleId))
  }
  if (filter.assignedDaUserId) {
    farmerConditions.push(eq(farmers.assignedDaUserId, filter.assignedDaUserId))
  }
  if (filter.isVerified === 'true') {
    farmerConditions.push(eq(farmers.isVerified, true))
  } else if (filter.isVerified === 'false') {
    farmerConditions.push(eq(farmers.isVerified, false))
  }
  if (filter.q) {
    const term = `%${filter.q.trim()}%`
    farmerConditions.push(
      sql`(${farmers.fullName} ILIKE ${term} OR ${farmers.localIdNumber} ILIKE ${term} OR ${farmers.phoneNumber} ILIKE ${term})`
    )
  }

  // If cropId or soilClass is filtered, we restrict to farmers having matching plots
  if (filter.cropId || filter.soilClass) {
    const plotSubQueryConditions = [
      eq(plots.cityOfficeId, cityOfficeId),
      isNull(plots.deletedAt),
    ]
    if (filter.cropId) {
      plotSubQueryConditions.push(eq(plots.plannedCropId, filter.cropId))
    }
    if (filter.soilClass) {
      plotSubQueryConditions.push(eq(plots.soilClass, filter.soilClass))
    }

    farmerConditions.push(
      sql`${farmers.id} IN (
        SELECT farmer_id FROM plots WHERE ${and(...plotSubQueryConditions)}
      )`
    )
  }

  // Count total matching farmers
  const [totalRes] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(farmers)
    .where(and(...farmerConditions))

  const total = totalRes?.count ?? 0

  // Fetch paginated farmers
  const farmerRows = await db
    .select({
      farmer: farmers,
      kebeleName: kebeles.name,
      daName: users.name,
    })
    .from(farmers)
    .leftJoin(kebeles, eq(farmers.kebeleId, kebeles.id))
    .leftJoin(users, eq(farmers.assignedDaUserId, users.id))
    .where(and(...farmerConditions))
    .orderBy(farmers.fullName)
    .limit(limit)
    .offset(offset)

  const farmerIds = farmerRows.map((r) => r.farmer.id)

  // Fetch plots for these farmers
  let plotsMap: Record<string, RegistryPlotDetail[]> = {}
  if (farmerIds.length > 0) {
    const plotRows = await db
      .select({
        plot: plots,
        cropName: crops.nameEn,
      })
      .from(plots)
      .leftJoin(crops, eq(plots.plannedCropId, crops.id))
      .where(
        and(
          inArray(plots.farmerId, farmerIds),
          eq(plots.cityOfficeId, cityOfficeId),
          isNull(plots.deletedAt)
        )
      )
      .orderBy(plots.name)

    plotsMap = plotRows.reduce<Record<string, RegistryPlotDetail[]>>((acc, r) => {
      const p = r.plot
      const plannedCropName = r.cropName ?? null
      const areaHectares = Number(p.areaHectares) || Number(p.areaValue) * Number(p.hectaresPerUnitApplied)
      const displayArea = convertHectaresToUnit(areaHectares, displayUnit, factors)

      const detail: RegistryPlotDetail = {
        id: p.id,
        name: p.name,
        areaValue: Number(p.areaValue),
        areaUnit: p.areaUnit,
        areaHectares: Math.round(areaHectares * 10000) / 10000,
        displayArea: Math.round(displayArea * 1000) / 1000,
        displayUnit,
        centroidLatitude: Number(p.centroidLatitude),
        centroidLongitude: Number(p.centroidLongitude),
        soilClass: p.soilClass ?? null,
        drainage: p.drainage ?? null,
        agroZone: p.agroZone,
        plannedCropId: p.plannedCropId ?? null,
        plannedCropName,
        status: p.status,
      }

      if (!acc[p.farmerId]) acc[p.farmerId] = []
      acc[p.farmerId]!.push(detail)
      return acc
    }, {})
  }

  // Construct farmer items
  const items: RegistryFarmerItem[] = farmerRows.map((r) => {
    const fPlots = plotsMap[r.farmer.id] ?? []
    const totalAreaHectares = fPlots.reduce((sum, p) => sum + p.areaHectares, 0)
    const totalAreaDisplay = convertHectaresToUnit(totalAreaHectares, displayUnit, factors)

    const cropSet = new Set<string>()
    fPlots.forEach((p) => {
      if (p.plannedCropName) cropSet.add(p.plannedCropName)
    })

    return {
      id: r.farmer.id,
      fullName: r.farmer.fullName,
      localIdNumber: r.farmer.localIdNumber,
      phoneNumber: r.farmer.phoneNumber ?? null,
      hasNoPhone: r.farmer.hasNoPhone,
      kebeleId: r.farmer.kebeleId,
      kebeleName: r.kebeleName ?? 'Unknown',
      assignedDaUserId: r.farmer.assignedDaUserId ?? null,
      assignedDaName: r.daName ?? null,
      isVerified: r.farmer.isVerified,
      plotsCount: fPlots.length,
      totalAreaHectares: Math.round(totalAreaHectares * 10000) / 10000,
      totalAreaDisplay: Math.round(totalAreaDisplay * 1000) / 1000,
      displayUnit,
      activeCrops: Array.from(cropSet),
      plots: fPlots,
    }
  })

  // Calculate office summary metrics
  const [metricCounts] = await db
    .select({
      totalFarmers: sql<number>`count(*)::int`,
      verifiedFarmers: sql<number>`count(*) filter (where ${farmers.isVerified} = true)::int`,
      selfRegisteredFarmers: sql<number>`count(*) filter (where ${farmers.isVerified} = false)::int`,
    })
    .from(farmers)
    .where(and(eq(farmers.cityOfficeId, cityOfficeId), isNull(farmers.deletedAt)))

  const [plotMetrics] = await db
    .select({
      totalPlots: sql<number>`count(*)::int`,
      totalHectares: sql<number>`coalesce(sum(${plots.areaHectares}), 0)::float`,
    })
    .from(plots)
    .where(and(eq(plots.cityOfficeId, cityOfficeId), isNull(plots.deletedAt)))

  const totalHectares = plotMetrics?.totalHectares ?? 0
  const totalDisplay = convertHectaresToUnit(totalHectares, displayUnit, factors)

  const summary: RegistrySummaryMetrics = {
    totalFarmers: metricCounts?.totalFarmers ?? 0,
    verifiedFarmers: metricCounts?.verifiedFarmers ?? 0,
    selfRegisteredFarmers: metricCounts?.selfRegisteredFarmers ?? 0,
    totalPlots: plotMetrics?.totalPlots ?? 0,
    totalCultivatedHectares: Math.round(totalHectares * 100) / 100,
    totalCultivatedDisplay: Math.round(totalDisplay * 100) / 100,
    displayUnit,
  }

  return {
    paginated: {
      data: items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    },
    summary,
  }
}

export async function exportMunicipalRegistry(
  cityOfficeId: string,
  actorUserId: string,
  filter: ExportRegistryInput
): Promise<{ id: string; format: 'csv' | 'xlsx'; data: string; totalRows: number }> {
  // Query all filtered rows without pagination
  const result = await queryMunicipalRegistry(cityOfficeId, {
    ...filter,
    page: 1,
    limit: 10000,
  })

  const unit = filter.unit ?? 'hectare'
  const unitLabel = unit.toUpperCase()

  // Generate CSV rows
  const headers = [
    'Farmer ID',
    'Full Name',
    'Local ID',
    'Phone Number',
    'Kebele',
    'Assigned DA',
    'Field Verified',
    'Plot Count',
    `Total Area (${unitLabel})`,
    'Total Area (Hectares)',
    'Crops Cultivated',
  ]

  const rows = result.paginated.data.map((f) => [
    `"${f.id}"`,
    `"${f.fullName.replace(/"/g, '""')}"`,
    `"${f.localIdNumber.replace(/"/g, '""')}"`,
    `"${f.phoneNumber || 'N/A'}"`,
    `"${f.kebeleName.replace(/"/g, '""')}"`,
    `"${f.assignedDaName || 'Unassigned'}"`,
    f.isVerified ? 'YES' : 'NO',
    f.plotsCount,
    f.totalAreaDisplay,
    f.totalAreaHectares,
    `"${f.activeCrops.join(', ').replace(/"/g, '""')}"`,
  ])

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')

  const exportId = crypto.randomUUID()

  // Audit log
  await db.insert(auditLogs).values({
    cityOfficeId,
    actorUserId,
    action: 'registry.export',
    entityType: 'registry',
    changesJson: {
      exportId,
      format: filter.format,
      totalRows: result.paginated.total,
      unit,
      filters: filter as Record<string, unknown>,
    },
  })

  return {
    id: exportId,
    format: filter.format,
    data: csvContent,
    totalRows: result.paginated.total,
  }
}
