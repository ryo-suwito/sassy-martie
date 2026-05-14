import { z } from 'zod'

export const step1Schema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  tagline: z.string().min(1, 'Tagline is required').max(160, 'Tagline must be at most 160 characters'),
  external_url: z.string().url('Must be a valid URL'),
  slug: z
    .string()
    .min(3, 'Slug must be at least 3 characters')
    .max(50)
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric and hyphens'),
})

export const step2Schema = z.object({
  pricing_model: z.enum(['free', 'paid', 'freemium', 'contact']),
  target_audience_description: z.string().max(500, 'Description must be at most 500 characters').optional().nullable(),
})

export const step3Schema = z.object({
  media: z.array(z.object({
    url: z.string().url('Must be a valid URL'),
    type: z.string().default('screenshot'),
    display_order: z.number().int().default(0),
  })).optional().default([]),
})

export const fullListingSchema = step1Schema.merge(step2Schema).merge(step3Schema)

export type ListingStep1Input = z.infer<typeof step1Schema>
export type ListingStep2Input = z.infer<typeof step2Schema>
export type ListingStep3Input = z.infer<typeof step3Schema>
export type FullListingInput = z.infer<typeof fullListingSchema>
