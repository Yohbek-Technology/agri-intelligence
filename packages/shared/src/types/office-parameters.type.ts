import type { z } from 'zod'
import type { officeParametersUpdateSchema } from '../validators/office-parameters.validator.js'

export type OfficeParametersUpdate = z.infer<typeof officeParametersUpdateSchema>
