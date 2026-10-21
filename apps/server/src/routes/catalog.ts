import { Hono } from 'hono'
import { db } from '@/config/db.js'
import { registeredChemicals, pestCatalog, crops, cropVarieties } from '@/db/schemas/catalog.js'
import { cityOffices } from '@/db/schemas/tenancy.js'
import { sessionGuard } from '@/middlewares/session.js'
import { eq, and, ilike, or, desc } from 'drizzle-orm'

export const catalogRouter = new Hono()

/**
 * Ensures baseline MoA/EPA registered chemicals and pests exist for the given city office.
 */
export async function seedBaselineCatalog(cityOfficeId: string) {
  // 1. Ensure baseline pests exist
  const existingPests = await db
    .select({ id: pestCatalog.id, code: pestCatalog.code })
    .from(pestCatalog)
    .where(eq(pestCatalog.cityOfficeId, cityOfficeId))

  const pestMap = new Map(existingPests.map((p) => [p.code, p.id]))

  const baselinePests = [
    {
      code: 'wheat_stem_rust',
      kind: 'disease' as const,
      name: {
        en: 'Wheat Stem Rust',
        am: 'የስንዴ ቢጫ ዝገት',
        om: 'Waagii Qamadii',
        ti: 'ናይ ስርናይ ዝገት',
      },
      preventionAdvice: {
        en: 'Plant certified resistant varieties (e.g. Kakaba, Dandaa). Avoid excessive nitrogen fertilization in humid seasons.',
        am: 'የተረጋገጡ የበሽታ መቋቋም አቅም ያላቸውን ዝርያዎች ይዝሩ (ለምሳሌ ካካባ)።',
      },
    },
    {
      code: 'fall_armyworm',
      kind: 'pest' as const,
      name: {
        en: 'Fall Armyworm',
        am: 'የተምች ትል',
        om: 'Raammoo Hoolaa',
        ti: 'ተምች',
      },
      preventionAdvice: {
        en: 'Scout maize whorls weekly. Handpick egg masses or apply approved bio-pesticides at first sign.',
        am: 'የበቆሎውን እምብርት በየሳምንቱ ይፈትሹ።',
      },
    },
    {
      code: 'head_smut',
      kind: 'disease' as const,
      name: {
        en: 'Head Smut',
        am: 'የራስ አረም / ስመት',
        om: 'Wagii Boqqolloo',
        ti: 'ስመት',
      },
      preventionAdvice: {
        en: 'Treat seed with certified fungicides before planting. Practice 3-year crop rotation with legumes.',
        am: 'ዘር ከመዝራትዎ በፊት በማከሚያ ኬሚካል ያክሙ።',
      },
    },
  ]

  for (const bp of baselinePests) {
    if (!pestMap.has(bp.code)) {
      const [inserted] = await db
        .insert(pestCatalog)
        .values({
          cityOfficeId,
          code: bp.code,
          kind: bp.kind,
          name: bp.name,
          preventionAdvice: bp.preventionAdvice,
        })
        .onConflictDoNothing()
        .returning({ id: pestCatalog.id, code: pestCatalog.code })

      if (inserted) {
        pestMap.set(inserted.code, inserted.id)
      }
    }
  }

  // 2. Ensure baseline registered chemicals exist
  const existingChems = await db
    .select({ id: registeredChemicals.id, regNum: registeredChemicals.registrationNumber })
    .from(registeredChemicals)
    .where(eq(registeredChemicals.cityOfficeId, cityOfficeId))

  const chemRegs = new Set(existingChems.map((c) => c.regNum))

  const baselineChemicals = [
    {
      brandName: 'Tilt 250 EC',
      activeIngredient: 'Propiconazole 250 g/L',
      registrationNumber: 'MoA-ET/1042',
      category: 'fungicide' as const,
      dosageText: {
        en: '0.5 L / Ha diluted in 200 Liters clean water (approx. 25-30 ml per 15L knapsack)',
        am: 'በሄክታር 0.5 ሊትር በ200 ሊትር ንጹህ ውሃ (ወይም በ15 ሊትር ጀሪካን 30 ሚሊ)',
      },
      protectiveEquipmentText: {
        en: 'Protective face mask, chemical rubber gloves, rubber boots, and eye goggles',
        am: 'የፊት ማስክ፣ የጎማ ጓንት እና ቦት ጫማ',
      },
      safetyIntervalDays: 30,
      targetPestCodes: ['wheat_stem_rust'],
    },
    {
      brandName: 'Ampligo 150 ZC',
      activeIngredient: 'Chlorantraniliprole 100 g/L + Lambda-cyhalothrin 50 g/L',
      registrationNumber: 'MoA-ET/884',
      category: 'insecticide' as const,
      dosageText: {
        en: '0.2 L / Ha in 200 Liters water directed into the plant whorls',
        am: 'በሄክታር 0.2 ሊትር በእጽዋቱ እምብርት ውስጥ ይረጩ',
      },
      protectiveEquipmentText: {
        en: 'Vapor respirator mask, neoprene gloves, protective overall, boots',
        am: 'የመተንፈሻ ማስክ፣ የጎማ ጓንት እና ሙሉ ልብስ',
      },
      safetyIntervalDays: 14,
      targetPestCodes: ['fall_armyworm'],
    },
    {
      brandName: 'Nativo 300 SC',
      activeIngredient: 'Trifloxystrobin 100 g/L + Tebuconazole 200 g/L',
      registrationNumber: 'MoA-ET/920',
      category: 'fungicide' as const,
      dosageText: {
        en: '0.4 L / Ha in 200 Liters water applied at first visual onset of lesions',
        am: 'በሄክታር 0.4 ሊትር የመጀመሪያው የበሽታ ምልክት ሲታይ',
      },
      protectiveEquipmentText: {
        en: 'Protective mask, gloves, long trousers, protective eye shield',
        am: 'ማስክ፣ ጓንት እና የአይን መነፅር',
      },
      safetyIntervalDays: 28,
      targetPestCodes: ['wheat_stem_rust', 'head_smut'],
    },
  ]

  for (const bc of baselineChemicals) {
    if (!chemRegs.has(bc.registrationNumber)) {
      const targetPestIds: string[] = []
      for (const pcode of bc.targetPestCodes) {
        const pid = pestMap.get(pcode)
        if (pid) targetPestIds.push(pid)
      }

      await db
        .insert(registeredChemicals)
        .values({
          cityOfficeId,
          brandName: bc.brandName,
          activeIngredient: bc.activeIngredient,
          registrationNumber: bc.registrationNumber,
          category: bc.category,
          dosageText: bc.dosageText,
          protectiveEquipmentText: bc.protectiveEquipmentText,
          safetyIntervalDays: bc.safetyIntervalDays,
          targetPestIds,
        })
        .onConflictDoNothing()
    }
  }
}

/**
 * GET /api/v1/catalog/chemicals
 * List MoA-registered chemicals with optional search & category filter
 */
catalogRouter.get('/chemicals', sessionGuard, async (c) => {
  const user = c.get('user')
  const category = c.req.query('category')
  const search = c.req.query('search')
  const pestId = c.req.query('pestId')

  let cityOfficeId = user?.cityOfficeId
  if (!cityOfficeId) {
    const off = await db.select({ id: cityOffices.id }).from(cityOffices).limit(1)
    if (off.length) cityOfficeId = off[0].id
  }

  if (cityOfficeId) {
    await seedBaselineCatalog(cityOfficeId)
  }

  const conditions = [eq(registeredChemicals.status, 'active')]
  if (cityOfficeId) {
    conditions.push(eq(registeredChemicals.cityOfficeId, cityOfficeId))
  }
  if (category && category !== 'all') {
    conditions.push(eq(registeredChemicals.category, category as any))
  }
  if (search) {
    conditions.push(
      or(
        ilike(registeredChemicals.brandName, `%${search}%`),
        ilike(registeredChemicals.activeIngredient, `%${search}%`),
        ilike(registeredChemicals.registrationNumber, `%${search}%`)
      )!
    )
  }

  const chems = await db
    .select()
    .from(registeredChemicals)
    .where(and(...conditions))
    .orderBy(desc(registeredChemicals.createdAt))

  let filtered = chems
  if (pestId) {
    filtered = chems.filter((item) => item.targetPestIds && item.targetPestIds.includes(pestId))
  }

  return c.json({ data: filtered })
})

/**
 * GET /api/v1/catalog/pests
 * List known crop pests and diseases
 */
catalogRouter.get('/pests', sessionGuard, async (c) => {
  const user = c.get('user')
  const search = c.req.query('search')

  let cityOfficeId = user?.cityOfficeId
  if (!cityOfficeId) {
    const off = await db.select({ id: cityOffices.id }).from(cityOffices).limit(1)
    if (off.length) cityOfficeId = off[0].id
  }

  if (cityOfficeId) {
    await seedBaselineCatalog(cityOfficeId)
  }

  const conditions = [eq(pestCatalog.status, 'active')]
  if (cityOfficeId) {
    conditions.push(eq(pestCatalog.cityOfficeId, cityOfficeId))
  }
  if (search) {
    conditions.push(ilike(pestCatalog.code, `%${search}%`))
  }

  const pests = await db
    .select()
    .from(pestCatalog)
    .where(and(...conditions))
    .orderBy(desc(pestCatalog.createdAt))

  return c.json({ data: pests })
})
