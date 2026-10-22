import { z } from 'zod'

export const createKebeleSchema = z
  .object({
    name: z.string().min(2, 'Kebele name must be at least 2 characters').max(120, 'Kebele name must be 120 characters or less'),
    boundary: z.any().optional(),
    centroidLatitude:  z.number().min(-90, 'Latitude must be between -90 and 90').max(90, 'Latitude must be between -90 and 90').optional(),
    centroidLongitude: z.number().min(-180, 'Longitude must be between -180 and 180').max(180, 'Longitude must be between -180 and 180').optional(),
    radiusMeters:      z.number().int('Radius must be a whole number').positive('Radius must be a positive number of meters').optional(),
  })
  .refine(
    (d) =>
      d.boundary != null ||
      (d.centroidLatitude != null && d.centroidLongitude != null && d.radiusMeters != null),
    {
      message:
        'Either a valid GeoJSON boundary or centroid latitude, longitude, and radius must be provided',
    }
  )

export const updateKebeleSchema = z.object({
  name:              z.string().min(2, 'Kebele name must be at least 2 characters').max(120, 'Kebele name must be 120 characters or less').optional(),
  boundary:          z.any().optional(),
  centroidLatitude:  z.number().min(-90, 'Latitude must be between -90 and 90').max(90, 'Latitude must be between -90 and 90').optional(),
  centroidLongitude: z.number().min(-180, 'Longitude must be between -180 and 180').max(180, 'Longitude must be between -180 and 180').optional(),
  radiusMeters:      z.number().int('Radius must be a whole number').positive('Radius must be a positive number of meters').optional(),
})

