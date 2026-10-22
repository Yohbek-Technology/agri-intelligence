import { eq, and, isNull, sql } from 'drizzle-orm'
import { db } from '@/config/db.js'
import { plots, plotCropHistory, farmers } from '@/db/schemas/farmers.js'
import { crops } from '@/db/schemas/catalog.js'
import { kebeles, cityOffices } from '@/db/schemas/tenancy.js'
import { auditLogs } from '@/db/schemas/sync.js'
import type {
  CreatePlotInput,
  UpdatePlotInput,
  AgroZoneOverrideInput,
  PlotCropHistoryInput,
  PlotRow,
  PlotCropHistoryRow,
  GeoResolutionResult,
  AreaUnit,
  SoilClass,
  DrainageClass,
  PlotStatus,
  AgroZone,
} from '@repo/shared'

export function rowToPlot(
  row: typeof plots.$inferSelect,
  kebeleName?: string | null,
  plannedCropName?: string | null,
  displayUnit?: AreaUnit,
  conversionFactor?: number
): PlotRow {
  const areaHectares = Number(row.areaHectares) || Number(row.areaValue) * Number(row.hectaresPerUnitApplied)
  let displayArea = areaHectares
  const targetUnit = displayUnit ?? row.areaUnit

  if (targetUnit === 'timad') {
    const factor = conversionFactor ?? 0.25
    displayArea = areaHectares / (factor || 0.25)
  } else if (targetUnit === 'kert') {
    const factor = conversionFactor ?? 0.25
    displayArea = areaHectares / (factor || 0.25)
  } else {
    displayArea = areaHectares
  }

  return {
    id: row.id,
    cityOfficeId: row.cityOfficeId,
    farmerId: row.farmerId,
    name: row.name,
    areaValue: Number(row.areaValue),
    areaUnit: row.areaUnit,
    hectaresPerUnitApplied: Number(row.hectaresPerUnitApplied),
    areaHectares: Math.round(areaHectares * 10000) / 10000,
    displayArea: Math.round(displayArea * 1000) / 1000,
    displayUnit: targetUnit,
    centroidLatitude: Number(row.centroidLatitude),
    centroidLongitude: Number(row.centroidLongitude),
    gpsAccuracyMeters: Number(row.gpsAccuracyMeters),
    weatherGridLatitude: Number(row.weatherGridLatitude),
    weatherGridLongitude: Number(row.weatherGridLongitude),
    elevationMeters: row.elevationMeters,
    agroZoneDerived: row.agroZoneDerived,
    agroZone: row.agroZone,
    agroZoneOverrideReason: row.agroZoneOverrideReason ?? null,
    kebeleId: row.kebeleId ?? null,
    kebeleName: kebeleName ?? undefined,
    soilClass: row.soilClass ?? null,
    drainage: row.drainage ?? null,
    plannedCropId: row.plannedCropId ?? null,
    plannedCropName: plannedCropName ?? undefined,
    plannedSeasonYear: row.plannedSeasonYear ?? null,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }
}

export async function resolveElevation(lat: number, lng: number): Promise<number> {
  try {
    const res = await fetch(`https://api.open-meteo.com/v1/elevation?latitude=${lat}&longitude=${lng}`, {
      signal: AbortSignal.timeout(2000),
    })
    if (res.ok) {
      const data = await res.json()
      if (Array.isArray(data.elevation) && typeof data.elevation[0] === 'number') {
        return Math.round(data.elevation[0])
      }
    }
  } catch {
    // Offline or network timeout fallback
  }

  // Deterministic elevation estimation for Ethiopian coordinates
  // Central Great Rift Valley plateau base ~1700m
  const latOffset = (lat - 8.5) * 110
  const lngOffset = (lng - 39.2) * 90
  const pseudoElev = Math.round(1710 + latOffset + lngOffset)
  return Math.min(4400, Math.max(300, pseudoElev))
}

export function deriveAgroZone(
  elevationMeters: number,
  kollaMaxM = 1500,
  degaMinM = 2300
): AgroZone {
  if (elevationMeters < kollaMaxM) return 'kolla'
  if (elevationMeters > degaMinM) return 'dega'
  return 'weyna_dega'
}

export async function resolveGeo(
  cityOfficeId: string,
  lat: number,
  lng: number,
  unit: AreaUnit = 'hectare'
): Promise<GeoResolutionResult> {
  const [office] = await db
    .select({
      parameters: cityOffices.parameters,
      hasJurisdiction: sql<boolean>`${cityOffices.jurisdiction} IS NOT NULL`,
      covers: sql<boolean>`CASE WHEN ${cityOffices.jurisdiction} IS NOT NULL THEN ST_Covers(${cityOffices.jurisdiction}::geometry, ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geometry) ELSE true END`,
    })
    .from(cityOffices)
    .where(eq(cityOffices.id, cityOfficeId))
    .limit(1)

  const params = (office?.parameters ?? {}) as Record<string, unknown>
  const isInJurisdiction = office ? (office.hasJurisdiction ? Boolean(office.covers) : true) : true

  // Conversion factor
  let hectaresPerUnitApplied = 1.0
  if (unit === 'timad') {
    hectaresPerUnitApplied = typeof params['land_unit.timad_to_ha'] === 'number' ? params['land_unit.timad_to_ha'] : 0.25
  } else if (unit === 'kert') {
    hectaresPerUnitApplied = typeof params['land_unit.kert_to_ha'] === 'number' ? params['land_unit.kert_to_ha'] : 0.25
  } else {
    hectaresPerUnitApplied = typeof params['land_unit.hectare_to_ha'] === 'number' ? params['land_unit.hectare_to_ha'] : 1.0
  }

  const elevationMeters = await resolveElevation(lat, lng)
  const kollaMaxM = typeof params['agro_zone.kolla_max_m'] === 'number' ? params['agro_zone.kolla_max_m'] : 1500
  const degaMinM = typeof params['agro_zone.dega_min_m'] === 'number' ? params['agro_zone.dega_min_m'] : 2300
  const agroZoneDerived = deriveAgroZone(elevationMeters, kollaMaxM, degaMinM)

  // Resolve kebele by boundary containment, then centroid radius, then closest centroid
  let kebeleId: string | null = null
  let kebeleName: string | null = null

  const containingKebeles = await db
    .select({
      id: kebeles.id,
      name: kebeles.name,
    })
    .from(kebeles)
    .where(
      and(
        eq(kebeles.cityOfficeId, cityOfficeId),
        isNull(kebeles.deletedAt),
        sql`(
          (${kebeles.boundary} IS NOT NULL AND ST_Covers(${kebeles.boundary}::geometry, ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geometry))
          OR
          (${kebeles.centroidLatitude} IS NOT NULL AND ${kebeles.centroidLongitude} IS NOT NULL AND ${kebeles.radiusMeters} IS NOT NULL AND ST_DWithin(
            ST_SetSRID(ST_MakePoint(${kebeles.centroidLongitude}::float, ${kebeles.centroidLatitude}::float), 4326)::geography,
            ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography,
            ${kebeles.radiusMeters}
          ))
        )`
      )
    )
    .limit(1)

  if (containingKebeles.length && containingKebeles[0]) {
    kebeleId = containingKebeles[0].id
    kebeleName = containingKebeles[0].name
  } else {
    // Nearest kebele fallback
    const nearest = await db
      .select({
        id: kebeles.id,
        name: kebeles.name,
      })
      .from(kebeles)
      .where(and(eq(kebeles.cityOfficeId, cityOfficeId), isNull(kebeles.deletedAt)))
      .orderBy(
        sql`ST_Distance(
          COALESCE(${kebeles.boundary}, ST_SetSRID(ST_MakePoint(${kebeles.centroidLongitude}::float, ${kebeles.centroidLatitude}::float), 4326)::geography),
          ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography
        )`
      )
      .limit(1)

    if (nearest.length && nearest[0]) {
      kebeleId = nearest[0].id
      kebeleName = nearest[0].name
    }
  }

  return {
    elevationMeters,
    agroZoneDerived,
    kebeleId,
    kebeleName,
    isInJurisdiction,
    hectaresPerUnitApplied,
  }
}

export async function createPlot(
  farmerId: string,
  cityOfficeId: string,
  actorUserId: string,
  data: CreatePlotInput
): Promise<{ row?: PlotRow; error?: string; message?: string }> {
  // Verify farmer exists and belongs to office
  const [farmer] = await db
    .select()
    .from(farmers)
    .where(and(eq(farmers.id, farmerId), eq(farmers.cityOfficeId, cityOfficeId), isNull(farmers.deletedAt)))
    .limit(1)

  if (!farmer) {
    return { error: 'farmer_not_found', message: 'Farmer not found in this city jurisdiction.' }
  }

  const lat = data.centroid.lat
  const lng = data.centroid.lng

  // Spatial geo resolution & jurisdiction validation
  const geo = await resolveGeo(cityOfficeId, lat, lng, data.areaUnit)
  if (!geo.isInJurisdiction) {
    return {
      error: 'coordinates_outside_jurisdiction',
      message: 'Plot centroid coordinates fall outside the city office jurisdiction boundary.',
    }
  }

  // Planned crop validation if provided
  let plannedCropName: string | null = null
  if (data.plannedCropId) {
    const [crop] = await db
      .select({ id: crops.id, nameEn: crops.nameEn, nameAm: crops.nameAm, status: crops.status })
      .from(crops)
      .where(eq(crops.id, data.plannedCropId))
      .limit(1)

    if (!crop || crop.status !== 'active') {
      return { error: 'invalid_crop', message: 'Planned crop is not active in the catalog.' }
    }
    plannedCropName = crop.nameEn || crop.nameAm || 'Crop'
  }

  const [newPlot] = await db
    .insert(plots)
    .values({
      cityOfficeId,
      farmerId,
      name: data.name.trim(),
      areaValue: data.areaValue.toString(),
      areaUnit: data.areaUnit,
      hectaresPerUnitApplied: geo.hectaresPerUnitApplied.toString(),
      centroidLatitude: lat.toString(),
      centroidLongitude: lng.toString(),
      gpsAccuracyMeters: (data.centroid.accuracyMeters ?? 10).toString(),
      elevationMeters: geo.elevationMeters,
      agroZoneDerived: geo.agroZoneDerived,
      agroZone: geo.agroZoneDerived,
      kebeleId: geo.kebeleId,
      soilClass: data.soilClass,
      drainage: data.drainage,
      plannedCropId: data.plannedCropId ?? null,
      plannedSeasonYear: data.plannedSeasonYear ?? null,
      status: 'active',
    })
    .returning()

  if (!newPlot) {
    return { error: 'insert_failed', message: 'Failed to create plot.' }
  }

  // Audit log
  await db.insert(auditLogs).values({
    cityOfficeId,
    actorUserId,
    action: 'plot.create',
    entityType: 'plot',
    entityId: newPlot.id,
    changesJson: {
      name: newPlot.name,
      areaValue: newPlot.areaValue,
      areaUnit: newPlot.areaUnit,
      soilClass: newPlot.soilClass,
      drainage: newPlot.drainage,
      agroZoneDerived: geo.agroZoneDerived,
    },
  })

  return { row: rowToPlot(newPlot, geo.kebeleName, plannedCropName, data.areaUnit, geo.hectaresPerUnitApplied) }
}

export async function updatePlot(
  plotId: string,
  cityOfficeId: string,
  actorUserId: string,
  data: UpdatePlotInput
): Promise<{ row?: PlotRow; error?: string; message?: string }> {
  const [existing] = await db
    .select()
    .from(plots)
    .where(and(eq(plots.id, plotId), eq(plots.cityOfficeId, cityOfficeId), isNull(plots.deletedAt)))
    .limit(1)

  if (!existing) {
    return { error: 'not_found', message: 'Plot not found.' }
  }

  const updateSet: Partial<typeof plots.$inferInsert> = {
    updatedAt: new Date(),
  }

  if (data.name !== undefined) updateSet.name = data.name.trim()
  if (data.soilClass !== undefined) updateSet.soilClass = data.soilClass
  if (data.drainage !== undefined) updateSet.drainage = data.drainage

  if (data.areaValue !== undefined || data.areaUnit !== undefined) {
    const unit = data.areaUnit ?? existing.areaUnit
    const val = data.areaValue ?? Number(existing.areaValue)
    updateSet.areaUnit = unit
    updateSet.areaValue = val.toString()

    // Recalculate conversion factor
    const geo = await resolveGeo(cityOfficeId, Number(existing.centroidLatitude), Number(existing.centroidLongitude), unit)
    updateSet.hectaresPerUnitApplied = geo.hectaresPerUnitApplied.toString()
  }

  if (data.plannedCropId !== undefined || data.plannedSeasonYear !== undefined) {
    updateSet.plannedCropId = data.plannedCropId ?? null
    updateSet.plannedSeasonYear = data.plannedSeasonYear ?? null
  }

  const [updated] = await db
    .update(plots)
    .set(updateSet)
    .where(eq(plots.id, plotId))
    .returning()

  // Audit log
  await db.insert(auditLogs).values({
    cityOfficeId,
    actorUserId,
    action: 'plot.update',
    entityType: 'plot',
    entityId: plotId,
    changesJson: data as Record<string, unknown>,
  })

  return { row: rowToPlot(updated!) }
}

export async function archivePlot(
  plotId: string,
  cityOfficeId: string,
  actorUserId: string
): Promise<{ row?: PlotRow; error?: string; message?: string }> {
  const [updated] = await db
    .update(plots)
    .set({
      status: 'archived',
      updatedAt: new Date(),
    })
    .where(and(eq(plots.id, plotId), eq(plots.cityOfficeId, cityOfficeId)))
    .returning()

  if (!updated) return { error: 'not_found', message: 'Plot not found.' }

  await db.insert(auditLogs).values({
    cityOfficeId,
    actorUserId,
    action: 'plot.archive',
    entityType: 'plot',
    entityId: plotId,
    changesJson: { status: 'archived' },
  })

  return { row: rowToPlot(updated) }
}

export async function restorePlot(
  plotId: string,
  cityOfficeId: string,
  actorUserId: string
): Promise<{ row?: PlotRow; error?: string; message?: string }> {
  const [updated] = await db
    .update(plots)
    .set({
      status: 'active',
      updatedAt: new Date(),
    })
    .where(and(eq(plots.id, plotId), eq(plots.cityOfficeId, cityOfficeId)))
    .returning()

  if (!updated) return { error: 'not_found', message: 'Plot not found.' }

  await db.insert(auditLogs).values({
    cityOfficeId,
    actorUserId,
    action: 'plot.restore',
    entityType: 'plot',
    entityId: plotId,
    changesJson: { status: 'active' },
  })

  return { row: rowToPlot(updated) }
}

export async function overrideAgroZone(
  plotId: string,
  cityOfficeId: string,
  actorUserId: string,
  data: AgroZoneOverrideInput
): Promise<{ row?: PlotRow; error?: string; message?: string }> {
  const [plot] = await db
    .select()
    .from(plots)
    .where(and(eq(plots.id, plotId), eq(plots.cityOfficeId, cityOfficeId), isNull(plots.deletedAt)))
    .limit(1)

  if (!plot) return { error: 'not_found', message: 'Plot not found.' }

  const [updated] = await db
    .update(plots)
    .set({
      agroZone: data.agroZone,
      agroZoneOverrideReason: data.reason.trim(),
      updatedAt: new Date(),
    })
    .where(eq(plots.id, plotId))
    .returning()

  await db.insert(auditLogs).values({
    cityOfficeId,
    actorUserId,
    action: 'plot.zone_override',
    entityType: 'plot',
    entityId: plotId,
    changesJson: {
      previousZone: plot.agroZone,
      newZone: data.agroZone,
      derivedZone: plot.agroZoneDerived,
      reason: data.reason.trim(),
    },
  })

  return { row: rowToPlot(updated!) }
}

export async function listFarmerPlots(
  farmerId: string,
  cityOfficeId: string,
  options?: { status?: PlotStatus | 'all'; displayUnit?: AreaUnit }
): Promise<PlotRow[]> {
  const conditions = [
    eq(plots.farmerId, farmerId),
    eq(plots.cityOfficeId, cityOfficeId),
    isNull(plots.deletedAt),
  ]

  if (options?.status && options.status !== 'all') {
    conditions.push(eq(plots.status, options.status))
  }

  const rows = await db
    .select({
      plot: plots,
      kebeleName: kebeles.name,
      cropName: crops.nameEn,
    })
    .from(plots)
    .leftJoin(kebeles, eq(plots.kebeleId, kebeles.id))
    .leftJoin(crops, eq(plots.plannedCropId, crops.id))
    .where(and(...conditions))
    .orderBy(plots.createdAt)

  return rows.map((r) => {
    return rowToPlot(r.plot, r.kebeleName, r.cropName ?? null, options?.displayUnit)
  })
}

export async function getPlotById(
  plotId: string,
  cityOfficeId?: string,
  displayUnit?: AreaUnit
): Promise<PlotRow | null> {
  const conditions = [eq(plots.id, plotId), isNull(plots.deletedAt)]
  if (cityOfficeId) conditions.push(eq(plots.cityOfficeId, cityOfficeId))

  const rows = await db
    .select({
      plot: plots,
      kebeleName: kebeles.name,
      cropName: crops.nameEn,
    })
    .from(plots)
    .leftJoin(kebeles, eq(plots.kebeleId, kebeles.id))
    .leftJoin(crops, eq(plots.plannedCropId, crops.id))
    .where(and(...conditions))
    .limit(1)

  if (!rows.length || !rows[0]) return null
  const { plot, kebeleName, cropName } = rows[0]

  return rowToPlot(plot, kebeleName, cropName ?? null, displayUnit)
}

export async function listPlotCropHistory(
  plotId: string,
  cityOfficeId: string
): Promise<PlotCropHistoryRow[]> {
  const rows = await db
    .select({
      history: plotCropHistory,
      cropName: crops.nameEn,
    })
    .from(plotCropHistory)
    .leftJoin(crops, eq(plotCropHistory.cropId, crops.id))
    .where(
      and(
        eq(plotCropHistory.plotId, plotId),
        eq(plotCropHistory.cityOfficeId, cityOfficeId),
        isNull(plotCropHistory.deletedAt)
      )
    )
    .orderBy(plotCropHistory.seasonYear)

  return rows.map((r) => {
    const cName = r.cropName as Record<string, string> | null
    return {
      id: r.history.id,
      cityOfficeId: r.history.cityOfficeId,
      farmerId: r.history.farmerId,
      plotId: r.history.plotId,
      seasonYear: r.history.seasonYear,
      cropId: r.history.cropId ?? null,
      cropName: cName?.en || cName?.am || null,
      fallow: r.history.fallow,
      createdByUserId: r.history.createdByUserId ?? null,
      createdAt: r.history.createdAt.toISOString(),
      updatedAt: r.history.updatedAt.toISOString(),
    }
  })
}

export async function upsertPlotCropHistory(
  plotId: string,
  cityOfficeId: string,
  seasonYear: number,
  actorUserId: string,
  data: { cropId?: string | null; fallow?: boolean }
): Promise<{ row?: PlotCropHistoryRow; error?: string; message?: string }> {
  const [plot] = await db
    .select({ id: plots.id, farmerId: plots.farmerId })
    .from(plots)
    .where(and(eq(plots.id, plotId), eq(plots.cityOfficeId, cityOfficeId), isNull(plots.deletedAt)))
    .limit(1)

  if (!plot) return { error: 'plot_not_found', message: 'Plot not found.' }

  const isFallow = Boolean(data.fallow || !data.cropId)
  const targetCropId = isFallow ? null : data.cropId ?? null

  const [existing] = await db
    .select()
    .from(plotCropHistory)
    .where(and(eq(plotCropHistory.plotId, plotId), eq(plotCropHistory.seasonYear, seasonYear)))
    .limit(1)

  let row: typeof plotCropHistory.$inferSelect

  if (existing) {
    const [updated] = await db
      .update(plotCropHistory)
      .set({
        cropId: targetCropId,
        fallow: isFallow,
        updatedAt: new Date(),
      })
      .where(eq(plotCropHistory.id, existing.id))
      .returning()
    row = updated!
  } else {
    const [inserted] = await db
      .insert(plotCropHistory)
      .values({
        cityOfficeId,
        farmerId: plot.farmerId,
        plotId,
        seasonYear,
        cropId: targetCropId,
        fallow: isFallow,
        createdByUserId: actorUserId,
      })
      .returning()
    row = inserted!
  }

  await db.insert(auditLogs).values({
    cityOfficeId,
    actorUserId,
    action: 'plot.crop_history_update',
    entityType: 'plot_crop_history',
    entityId: row.id,
    changesJson: { plotId, seasonYear, cropId: targetCropId, fallow: isFallow },
  })

  return {
    row: {
      id: row.id,
      cityOfficeId: row.cityOfficeId,
      farmerId: row.farmerId,
      plotId: row.plotId,
      seasonYear: row.seasonYear,
      cropId: row.cropId ?? null,
      fallow: row.fallow,
      createdByUserId: row.createdByUserId ?? null,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    },
  }
}
