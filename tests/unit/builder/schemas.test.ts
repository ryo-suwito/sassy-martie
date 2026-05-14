import { describe, it, expect } from 'vitest'
import { listerProfileSchema } from '@/lib/schemas/builder/listerProfile'
import { step1Schema, fullListingSchema } from '@/lib/schemas/builder/listingDraft'

describe('Builder Schemas', () => {
  describe('listerProfileSchema', () => {
    it('should validate a valid profile', () => {
      const valid = {
        username: 'martie-builder',
        display_name: 'Martie',
        bio: 'I build things.',
        website_url: 'https://martie.dev',
      }
      const result = listerProfileSchema.safeParse(valid)
      expect(result.success).toBe(true)
    })

    it('should reject invalid usernames', () => {
      const invalid = { username: 'Invalid Name' }
      const result = listerProfileSchema.safeParse(invalid)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.username?.[0]).toContain('alphanumeric')
      }
    })
  });

  describe('listingDraftSchema', () => {
    it('should validate step 1 partial data', () => {
      const validStep1 = {
        name: 'Cool Tool',
        tagline: 'The coolest tool ever',
        external_url: 'https://cool.tool',
        slug: 'cool-tool',
      }
      const result = step1Schema.safeParse(validStep1)
      expect(result.success).toBe(true)
    })

    it('should reject step 1 with missing name', () => {
      const invalid = { tagline: 'Cool', external_url: 'https://cool.tool', slug: 'cool' }
      const result = step1Schema.safeParse(invalid)
      expect(result.success).toBe(false)
    })

    it('should validate full schema for submission', () => {
      const validFull = {
        name: 'Cool Tool',
        tagline: 'Coolest',
        external_url: 'https://cool.tool',
        slug: 'cool-tool',
        pricing_model: 'free',
        target_audience_description: 'Everyone',
        media: [{ url: 'https://image.com/1.png' }]
      }
      const result = fullListingSchema.safeParse(validFull)
      expect(result.success).toBe(true)
    })
  });
})
