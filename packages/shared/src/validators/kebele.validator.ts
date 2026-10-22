import { z } from 'zod'

export const createKebeleSchema = z
  .object({
    name: z.string().min(2).max(120),
    boundary: z.any().optional(),
    centroidLatitude:  z.number().min(-90).max(90).optional(),
    centroidLongitude: z.number().min(-180).max(180).optional(),
    radiusMeters:      z.number().int().positive().optional(),
  })
  .refine(
    (d) =>
      d.boundary != null ||
      (d.centroidLatitude != null && d.centroidLongitude != null && d.radiusMeters != null),
    {
      message:
        'Either boundary (GeoJSON MultiPolygon) or centroidLatitude + centroidLongitude + radiusMeters must be provided',
    }
  )

export const updateKebeleSchema = z.object({
  name:              z.string().min(2).max(120).optional(),
  boundary:          z.any().optional(),
  centroidLatitude:  z.number().min(-90).max(90).optional(),
  centroidLongitude: z.number().min(-180).max(180).optional(),
  radiusMeters:      z.number().int().positive().optional(),
})
