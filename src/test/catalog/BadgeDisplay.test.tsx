import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import BadgeDisplay from '@/components/catalog/BadgeDisplay'

describe('BadgeDisplay', () => {
  it('renders nothing when no badges provided', () => {
    const { container } = render(<BadgeDisplay badges={[]} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders functional badge correctly', () => {
    render(<BadgeDisplay badges={['FULLY_FUNCTIONAL']} />)
    expect(screen.getByText('FUNCTIONAL')).toBeInTheDocument()
  })

  it('renders secure badge correctly', () => {
    render(<BadgeDisplay badges={['SECURITY_VERIFIED']} />)
    expect(screen.getByText('SECURE')).toBeInTheDocument()
  })

  it('renders taste badge correctly', () => {
    render(<BadgeDisplay badges={['TASTE_APPROVED']} />)
    expect(screen.getByText('TASTE')).toBeInTheDocument()
  })

  it('renders multiple badges together', () => {
    render(<BadgeDisplay badges={['FULLY_FUNCTIONAL', 'SECURITY_VERIFIED']} />)
    expect(screen.getByText('FUNCTIONAL')).toBeInTheDocument()
    expect(screen.getByText('SECURE')).toBeInTheDocument()
  })
})
