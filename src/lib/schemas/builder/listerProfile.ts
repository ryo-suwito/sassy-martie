import { z } from 'zod'

export const listerProfileSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be at most 30 characters')
    .regex(/^[a-z0-9-]+$/, 'Username must be lowercase alphanumeric and hyphens'),
  display_name: z.string().min(1, 'Display name is required').max(50).optional().nullable(),
  bio: z.string().max(300, 'Bio must be at most 300 characters').optional().nullable(),
  website_url: z.string().url('Must be a valid URL').optional().nullable().or(z.literal('')),
  twitter_handle: z.string().max(50).optional().nullable(),
  avatar_url: z.string().url('Must be a valid URL').optional().nullable().or(z.literal('')),
})

export type ListerProfileInput = z.infer<typeof listerProfileSchema>
