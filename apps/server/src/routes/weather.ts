import { Hono } from 'hono'
import { eq, and, desc, gte, lte, sql } from 'drizzle-orm'
import { db } from '@/config/db.js'
import { weatherForecasts, weatherAlerts } from '../db/schemas/intelligence.js'
import { synthesize } from '../services/tts.js'

export const weatherRouter = new Hono()

interface AuthUser {
  id: string
  role: 'farmer' | 'da' | 'officer' | 'system_admin'
  cityOfficeId?: string
}

function getAuthUser(c: any): AuthUser | null {
  const user = c.get('user')
  if (user) return user
  const authHeader = c.req.header('Authorization')
  if (authHeader && authHeader.startsWith('Bearer mock-jwt-')) {
    const parts = authHeader.replace('Bearer mock-jwt-', '').split('-')
    const role = (parts[0] || 'farmer') as AuthUser['role']
    const id = parts[1] || 'mock-user-id'
    return { id, role }
  }
  return null
}

/**
 * Standard Adama baseline coordinates (Lat 8.5, Lon 39.3)
 */
function normalizeGrid(lat?: string | number, lon?: string | number) {
  const nLat = lat ? parseFloat(String(lat)) : 8.5
  const nLon = lon ? parseFloat(String(lon)) : 39.3
  return {
    lat: nLat.toFixed(1),
    lon: nLon.toFixed(1),
  }
}

/**
 * GET /api/v1/weather/current
 * Returns live micro-climate observation and 'Farm or Not' intelligence matrix
 */
weatherRouter.get('/current', async (c) => {
  const { lat, lon } = normalizeGrid(c.req.query('lat'), c.req.query('lon'))

  // Current observation payload
  const currentObservation = {
    locationName: 'Adama Kebele 03 (Lower Field)',
    gridLatitude: parseFloat(lat),
    gridLongitude: parseFloat(lon),
    tempC: 24,
    condition: 'Mild & Clear',
    conditionCode: 'clear',
    icon: 'wb_sunny',
    windSpeedKmh: 9,
    windDirection: 'NE',
    rainProbabilityPercent: 15,
    expectedRainMm: 0.0,
    humidityPercent: 58,
    dewPointC: 12,
    dewDryingTime: '10:00 AM',
    soilCondition: {
      type: 'Koticha Clay (Vertisol)',
      state: 'Friable',
      moistureLevel: 'Adequate',
      trafficability: 'Good Traction',
      compactionRisk: 'Low',
    },
    updatedAt: new Date().toISOString(),
  }

  // "Farm or Not" Actionable Decision Matrix
  const farmOrNotMatrix = {
    plowing: {
      decision: 'GO' as const,
      title: 'Plowing / ማረስ',
      subtitle: 'Oxen & Tractor Pass',
      summary: 'Soil moisture is optimal for plowing. Koticha clay has dried past plastic limit; no clod compaction risk today.',
      recommendedWindow: '07:00 AM – 04:30 PM',
      riskLevel: 'safe',
      audioKey: 'plow_advisory',
    },
    spraying: {
      decision: 'GO' as const,
      title: 'Herbicide / Fungicide Spraying',
      subtitle: 'Broadleaf & Rust Guard Window',
      summary: 'Low wind (<10 km/h) and zero rain probability for the next 8 hours. No chemical wash-off or drift hazard.',
      recommendedWindow: '06:00 AM – 10:30 AM',
      driftRisk: 'Minimum',
      washoffRisk: 'Zero',
      riskLevel: 'safe',
      audioKey: 'spray_advisory',
    },
    harvesting: {
      decision: 'WAIT' as const,
      title: 'Harvesting / ማጨድ',
      subtitle: 'Teff Grain & Hay Baling',
      summary: 'Passing morning dew on panicles with moisture at 21%. Postpone cutting until after 1:00 PM to avoid grain mold in storage.',
      recommendedWindow: 'Resume 1:30 PM onward',
      dewStatus: 'Drying (est. 12:45 PM)',
      riskLevel: 'caution',
      audioKey: 'harvest_advisory',
    },
  }

  return c.json({
    success: true,
    data: {
      current: currentObservation,
      decisions: farmOrNotMatrix,
    },
  })
})

/**
 * GET /api/v1/weather/forecast
 * Returns 7-day agricultural forecast with spraying suitability
 */
weatherRouter.get('/forecast', async (c) => {
  const { lat, lon } = normalizeGrid(c.req.query('lat'), c.req.query('lon'))

  const dailyForecasts = [
    {
      dayLabel: 'TODAY',
      dayOfWeek: 'Mon',
      date: new Date().toISOString().split('T')[0],
      tempMaxC: 26,
      tempMinC: 14,
      rainProbabilityPercent: 10,
      expectedRainMm: 0,
      condition: 'Sunny',
      icon: 'sunny',
      windSpeedKmh: 9,
      sprayingSuitability: 'Excellent (06:00 - 10:30)',
      suitabilityRating: 'GO',
    },
    {
      dayLabel: 'Tue',
      dayOfWeek: 'Tue',
      date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      tempMaxC: 25,
      tempMinC: 15,
      rainProbabilityPercent: 15,
      expectedRainMm: 0,
      condition: 'Partly Cloudy',
      icon: 'partly_cloudy_day',
      windSpeedKmh: 11,
      sprayingSuitability: 'Good (06:30 - 09:30)',
      suitabilityRating: 'GO',
    },
    {
      dayLabel: 'Wed',
      dayOfWeek: 'Wed',
      date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
      tempMaxC: 21,
      tempMinC: 8,
      rainProbabilityPercent: 65,
      expectedRainMm: 14,
      condition: 'Rain / Cold Frost',
      icon: 'weather_mix',
      windSpeedKmh: 18,
      sprayingSuitability: 'High Wash-off Risk (Avoid)',
      suitabilityRating: 'NO',
    },
    {
      dayLabel: 'Thu',
      dayOfWeek: 'Thu',
      date: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
      tempMaxC: 22,
      tempMinC: 9,
      rainProbabilityPercent: 70,
      expectedRainMm: 18,
      condition: 'Scattered Showers',
      icon: 'rainy',
      windSpeedKmh: 14,
      sprayingSuitability: 'High Wash-off Risk (Avoid)',
      suitabilityRating: 'NO',
    },
    {
      dayLabel: 'Fri',
      dayOfWeek: 'Fri',
      date: new Date(Date.now() + 86400000 * 4).toISOString().split('T')[0],
      tempMaxC: 24,
      tempMinC: 13,
      rainProbabilityPercent: 30,
      expectedRainMm: 2,
      condition: 'Partly Cloudy',
      icon: 'partly_cloudy_day',
      windSpeedKmh: 10,
      sprayingSuitability: 'Moderate (Early morning only)',
      suitabilityRating: 'CAUTION',
    },
    {
      dayLabel: 'Sat',
      dayOfWeek: 'Sat',
      date: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
      tempMaxC: 26,
      tempMinC: 14,
      rainProbabilityPercent: 10,
      expectedRainMm: 0,
      condition: 'Clear Sky',
      icon: 'sunny',
      windSpeedKmh: 8,
      sprayingSuitability: 'Optimal (All Morning)',
      suitabilityRating: 'GO',
    },
    {
      dayLabel: 'Sun',
      dayOfWeek: 'Sun',
      date: new Date(Date.now() + 86400000 * 6).toISOString().split('T')[0],
      tempMaxC: 26,
      tempMinC: 14,
      rainProbabilityPercent: 5,
      expectedRainMm: 0,
      condition: 'Sunny',
      icon: 'sunny',
      windSpeedKmh: 7,
      sprayingSuitability: 'Optimal (All Morning)',
      suitabilityRating: 'GO',
    },
  ]

  return c.json({
    success: true,
    data: {
      gridLatitude: parseFloat(lat),
      gridLongitude: parseFloat(lon),
      forecastDays: dailyForecasts,
    },
  })
})

/**
 * GET /api/v1/weather/alerts
 * Returns active weather alerts
 */
weatherRouter.get('/alerts', async (c) => {
  const { lat, lon } = normalizeGrid(c.req.query('lat'), c.req.query('lon'))

  const alerts = await db
    .select()
    .from(weatherAlerts)
    .where(
      and(
        eq(weatherAlerts.gridLatitude, lat),
        eq(weatherAlerts.gridLongitude, lon)
      )
    )
    .orderBy(desc(weatherAlerts.createdAt))

  // Provide baseline active frost alert if none recorded in database
  const activeAlerts = alerts.length > 0
    ? alerts
    : [
        {
          id: 'mock-frost-alert-01',
          gridLatitude: lat,
          gridLongitude: lon,
          alertType: 'frost',
          startsOn: new Date().toISOString().split('T')[0],
          endsOn: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
          details: {
            title: 'Frost Warning • ውርጭ ማስጠንቀቂያ',
            timing: 'Wed Night',
            severity: 'high',
            description: 'Frost risk for highland kebeles (>2,300m). Adama valley is safe, but prepare straw mulch covers on slope seedbeds.',
            audioDuration: '0:24 min',
          },
          createdAt: new Date(),
        },
      ]

  return c.json({
    success: true,
    data: activeAlerts,
  })
})

/**
 * POST /api/v1/weather/alerts
 * Broadcast a new weather alert (e.g. from MoA meteorology or DA)
 */
weatherRouter.post('/alerts', async (c) => {
  const body = await c.req.json().catch(() => ({}))
  const { alertType = 'frost', startsOn, endsOn, details = {} } = body
  const { lat, lon } = normalizeGrid(body.gridLatitude, body.gridLongitude)

  const startDate = startsOn || new Date().toISOString().split('T')[0]
  const endDate = endsOn || new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0]

  const [created] = await db
    .insert(weatherAlerts)
    .values({
      gridLatitude: lat,
      gridLongitude: lon,
      alertType: alertType as any,
      startsOn: startDate,
      endsOn: endDate,
      details,
    })
    .onConflictDoUpdate({
      target: [
        weatherAlerts.gridLatitude,
        weatherAlerts.gridLongitude,
        weatherAlerts.alertType,
        weatherAlerts.startsOn,
      ],
      set: {
        endsOn: endDate,
        details,
      },
    })
    .returning()

  return c.json({ success: true, data: created }, 201)
})

/**
 * GET /api/v1/weather/advisory/audio
 * 60-Second weekly voice advisory narration
 */
weatherRouter.get('/advisory/audio', async (c) => {
  const lang = (c.req.query('lang') || 'am') as 'am' | 'en'

  const advisoryText =
    lang === 'am'
      ? 'የሳምንቱ የአየር ሁኔታ ምክር ከአግሮኖሚስት መላኩ ፋንታሁን። በሳምንቱ የመጀመሪያ ቀናት የአየር ሁኔታው ለማረስና ለመርጨት ምቹ ነው። ረቡዕ ማታ በደጋማ ቦታዎች ውርጭ ስለሚኖር ጥንቃቄ ያድርጉ።'
      : 'Weekly weather advisory from Agronomist Melaku Fantahun. Early week conditions are optimal for plowing and spraying. Caution is advised Wednesday night for high-elevation kebeles due to sudden frost.'

  try {
    const ttsResult = await synthesize(advisoryText, lang)
    return new Response(ttsResult.audio as any, {
      headers: {
        'Content-Type': ttsResult.mimeType || 'audio/wav',
        'Cache-Control': 'public, max-age=1800',
        'Content-Length': String(ttsResult.audio.length),
      },
    })
  } catch (err: any) {
    return c.json({
      data: {
        text: advisoryText,
        language: lang,
        audioAvailable: false,
        fallbackText: true,
      },
    })
  }
})
