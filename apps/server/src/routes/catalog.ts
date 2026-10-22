import { Hono } from "hono"
import { sessionGuard, tenantGuard, requireAdminOrOfficer, requireDeskStaff } from '@/middlewares/index.js'
import {
  listCrops, createCrop, updateCrop,
  listVarieties, createVariety, updateVariety,
  listFertilizerRates, upsertFertilizerRate,
  listPests, createPest, updatePest,
  listChemicals, createChemical, updateChemical, retireChemical,
} from '@/services/catalog.js'
import {
  createCropSchema, updateCropSchema,
  createVarietySchema, updateVarietySchema,
  upsertFertilizerRateSchema,
  createPestSchema, updatePestSchema,
  createChemicalSchema, updateChemicalSchema,
} from '@repo/shared'

// ---- Public (any authenticated staff) read router ----
export const catalogPublicRouter = new Hono()
catalogPublicRouter.use('*', sessionGuard, tenantGuard)

catalogPublicRouter.get('/crops', async (c) => {
  const user = c.get('user')
  if (!user.cityOfficeId) return c.json({ error: { code: 'forbidden', message: 'No office assigned.' } }, 403)
  const list = await listCrops(user.cityOfficeId)
  return c.json({ data: list })
})

catalogPublicRouter.get('/varieties', async (c) => {
  const user = c.get('user')
  if (!user.cityOfficeId) return c.json({ error: { code: 'forbidden', message: 'No office assigned.' } }, 403)
  const cropId = c.req.query('cropId')
  const list = await listVarieties(user.cityOfficeId, cropId)
  return c.json({ data: list })
})

catalogPublicRouter.get('/pests', async (c) => {
  const user = c.get('user')
  if (!user.cityOfficeId) return c.json({ error: { code: 'forbidden', message: 'No office assigned.' } }, 403)
  const list = await listPests(user.cityOfficeId)
  return c.json({ data: list })
})

catalogPublicRouter.get('/chemicals', async (c) => {
  const user = c.get('user')
  if (!user.cityOfficeId) return c.json({ error: { code: 'forbidden', message: 'No office assigned.' } }, 403)
  const list = await listChemicals(user.cityOfficeId)
  return c.json({ data: list })
})

// Fertilizer rates are readable by all desk staff (da + officer + system_admin)
catalogPublicRouter.get('/fertilizer-rates', requireDeskStaff, async (c) => {
  const user = c.get('user')
  if (!user.cityOfficeId) return c.json({ error: { code: 'forbidden', message: 'No office assigned.' } }, 403)
  const list = await listFertilizerRates(user.cityOfficeId)
  return c.json({ data: list })
})

// ---- Officer-only write router ----
export const officeCatalogRouter = new Hono()
officeCatalogRouter.use('*', sessionGuard, tenantGuard, requireAdminOrOfficer)

// Crops
officeCatalogRouter.post('/crops', async (c) => {
  const user = c.get('user')
  if (!user.cityOfficeId) return c.json({ error: { code: 'forbidden', message: 'No office assigned.' } }, 403)
  const body = await c.req.json().catch(() => null)
  const parsed = createCropSchema.safeParse(body)
  if (!parsed.success) {
    return c.json({ error: { code: 'validation_error', message: 'Invalid crop data.', details: parsed.error.flatten() } }, 422)
  }
  try {
    const crop = await createCrop(parsed.data, user.cityOfficeId, user.id)
    return c.json({ data: crop }, 201)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : ''
    if (msg.includes('crops_city_office_id_code_key')) {
      return c.json({ error: { code: 'conflict', message: 'Crop code already exists for this office.' } }, 409)
    }
    throw err
  }
})

officeCatalogRouter.patch('/crops/:id', async (c) => {
  const user = c.get('user')
  if (!user.cityOfficeId) return c.json({ error: { code: 'forbidden', message: 'No office assigned.' } }, 403)
  const id = c.req.param('id')
  const body = await c.req.json().catch(() => null)
  const parsed = updateCropSchema.safeParse(body)
  if (!parsed.success) {
    return c.json({ error: { code: 'validation_error', message: 'Invalid crop data.', details: parsed.error.flatten() } }, 422)
  }
  try {
    const crop = await updateCrop(id, user.cityOfficeId, parsed.data, user.id)
    if (!crop) return c.json({ error: { code: 'not_found', message: 'Crop not found.' } }, 404)
    return c.json({ data: crop })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : ''
    if (msg.includes('SELF_SUCCESSOR')) {
      return c.json({ error: { code: 'validation_error', message: 'A crop cannot be its own recommended successor.' } }, 422)
    }
    throw err
  }
})

// Varieties
officeCatalogRouter.post('/varieties', async (c) => {
  const user = c.get('user')
  if (!user.cityOfficeId) return c.json({ error: { code: 'forbidden', message: 'No office assigned.' } }, 403)
  const body = await c.req.json().catch(() => null)
  const parsed = createVarietySchema.safeParse(body)
  if (!parsed.success) {
    return c.json({ error: { code: 'validation_error', message: 'Invalid variety data.', details: parsed.error.flatten() } }, 422)
  }
  try {
    const variety = await createVariety(parsed.data, user.cityOfficeId, user.id)
    return c.json({ data: variety }, 201)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : ''
    if (msg.includes('crop_varieties_crop_id_name_key')) {
      return c.json({ error: { code: 'conflict', message: 'Variety name already exists for this crop.' } }, 409)
    }
    throw err
  }
})

officeCatalogRouter.patch('/varieties/:id', async (c) => {
  const user = c.get('user')
  if (!user.cityOfficeId) return c.json({ error: { code: 'forbidden', message: 'No office assigned.' } }, 403)
  const id = c.req.param('id')
  const body = await c.req.json().catch(() => null)
  const parsed = updateVarietySchema.safeParse(body)
  if (!parsed.success) {
    return c.json({ error: { code: 'validation_error', message: 'Invalid variety data.', details: parsed.error.flatten() } }, 422)
  }
  const variety = await updateVariety(id, user.cityOfficeId, parsed.data, user.id)
  if (!variety) return c.json({ error: { code: 'not_found', message: 'Variety not found.' } }, 404)
  return c.json({ data: variety })
})

// Fertilizer rates
officeCatalogRouter.put('/fertilizer-rates', async (c) => {
  const user = c.get('user')
  if (!user.cityOfficeId) return c.json({ error: { code: 'forbidden', message: 'No office assigned.' } }, 403)
  const body = await c.req.json().catch(() => null)
  const parsed = upsertFertilizerRateSchema.safeParse(body)
  if (!parsed.success) {
    return c.json({ error: { code: 'validation_error', message: 'Invalid rate data.', details: parsed.error.flatten() } }, 422)
  }
  const rate = await upsertFertilizerRate(parsed.data, user.cityOfficeId, user.id)
  return c.json({ data: rate }, 201)
})

// Pests
officeCatalogRouter.post('/pests', async (c) => {
  const user = c.get('user')
  if (!user.cityOfficeId) return c.json({ error: { code: 'forbidden', message: 'No office assigned.' } }, 403)
  const body = await c.req.json().catch(() => null)
  const parsed = createPestSchema.safeParse(body)
  if (!parsed.success) {
    return c.json({ error: { code: 'validation_error', message: 'Invalid pest data.', details: parsed.error.flatten() } }, 422)
  }
  try {
    const pest = await createPest(parsed.data, user.cityOfficeId, user.id)
    return c.json({ data: pest }, 201)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : ''
    if (msg.includes('pest_catalog_city_office_id_code_key')) {
      return c.json({ error: { code: 'conflict', message: 'Pest code already exists for this office.' } }, 409)
    }
    throw err
  }
})

officeCatalogRouter.patch('/pests/:id', async (c) => {
  const user = c.get('user')
  if (!user.cityOfficeId) return c.json({ error: { code: 'forbidden', message: 'No office assigned.' } }, 403)
  const id = c.req.param('id')
  const body = await c.req.json().catch(() => null)
  const parsed = updatePestSchema.safeParse(body)
  if (!parsed.success) {
    return c.json({ error: { code: 'validation_error', message: 'Invalid pest data.', details: parsed.error.flatten() } }, 422)
  }
  const pest = await updatePest(id, user.cityOfficeId, parsed.data, user.id)
  if (!pest) return c.json({ error: { code: 'not_found', message: 'Pest not found.' } }, 404)
  return c.json({ data: pest })
})

// Chemicals
officeCatalogRouter.post('/chemicals', async (c) => {
  const user = c.get('user')
  if (!user.cityOfficeId) return c.json({ error: { code: 'forbidden', message: 'No office assigned.' } }, 403)
  const body = await c.req.json().catch(() => null)
  const parsed = createChemicalSchema.safeParse(body)
  if (!parsed.success) {
    return c.json({ error: { code: 'validation_error', message: 'Invalid chemical data.', details: parsed.error.flatten() } }, 422)
  }
  try {
    const chemical = await createChemical(parsed.data, user.cityOfficeId, user.id)
    return c.json({ data: chemical }, 201)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : ''
    if (msg.includes('registered_chemicals_office_registration_key')) {
      return c.json({ error: { code: 'conflict', message: 'Registration number already exists for this office.' } }, 409)
    }
    throw err
  }
})

officeCatalogRouter.patch('/chemicals/:id', async (c) => {
  const user = c.get('user')
  if (!user.cityOfficeId) return c.json({ error: { code: 'forbidden', message: 'No office assigned.' } }, 403)
  const id = c.req.param('id')
  const body = await c.req.json().catch(() => null)
  const parsed = updateChemicalSchema.safeParse(body)
  if (!parsed.success) {
    return c.json({ error: { code: 'validation_error', message: 'Invalid chemical data.', details: parsed.error.flatten() } }, 422)
  }
  const chemical = await updateChemical(id, user.cityOfficeId, parsed.data, user.id)
  if (!chemical) return c.json({ error: { code: 'not_found', message: 'Chemical not found.' } }, 404)
  return c.json({ data: chemical })
})

officeCatalogRouter.post('/chemicals/:id/retire', async (c) => {
  const user = c.get('user')
  if (!user.cityOfficeId) return c.json({ error: { code: 'forbidden', message: 'No office assigned.' } }, 403)
  const id = c.req.param('id')
  const chemical = await retireChemical(id, user.cityOfficeId, user.id)
  if (!chemical) return c.json({ error: { code: 'not_found', message: 'Chemical not found.' } }, 404)
  return c.json({ data: chemical })
})
