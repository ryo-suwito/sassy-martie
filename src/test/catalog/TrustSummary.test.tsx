import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import TrustSummary from '@/components/catalog/TrustSummary'

describe('TrustSummary', () => {
  it('renders passing status correctly', () => {
    render(<TrustSummary status="passing" deadline={null} />)
    expect(screen.getByText('Verified & Healthy')).toBeInTheDocument()
  })

  it('renders grace period status with deadline', () => {
    const deadline = new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString()
    render(<TrustSummary status="grace_period" deadline={deadline} />)
    expect(screen.getByText('GRACE PERIOD ACTIVE')).toBeInTheDocument()
    expect(screen.getByText(/Expires:/)).toBeInTheDocument()
  })

  it('renders failing status correctly', () => {
    render(<TrustSummary status="failing" deadline={null} />)
    expect(screen.getByText('Health Check Failed')).toBeInTheDocument()
  })

  it('renders revoked status correctly', () => {
    render(<TrustSummary status="revoked" deadline={null} />)
    expect(screen.getByText('Trust Revoked by Admin')).toBeInTheDocument()
  })

  it('renders pending status by default', () => {
    render(<TrustSummary status="unverified" deadline={null} />)
    expect(screen.getByText('Verification Pending')).toBeInTheDocument()
  })
})
