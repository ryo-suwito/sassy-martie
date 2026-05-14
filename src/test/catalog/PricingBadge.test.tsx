import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import PricingBadge from '@/components/catalog/PricingBadge'

describe('PricingBadge', () => {
  it('renders free tag correctly', () => {
    render(<PricingBadge model="free" />)
    expect(screen.getByText('Free')).toBeInTheDocument()
    expect(screen.getByText('Free')).toHaveClass('tag-outline')
  })

  it('renders paid tag correctly', () => {
    render(<PricingBadge model="paid" />)
    expect(screen.getByText('Paid')).toBeInTheDocument()
    expect(screen.getByText('Paid')).toHaveClass('tag-red')
  })

  it('renders freemium tag correctly', () => {
    render(<PricingBadge model="freemium" />)
    expect(screen.getByText('Freemium')).toBeInTheDocument()
    expect(screen.getByText('Freemium')).toHaveClass('tag-peach')
  })

  it('renders contact tag correctly', () => {
    render(<PricingBadge model="contact" />)
    expect(screen.getByText('Contact')).toBeInTheDocument()
    expect(screen.getByText('Contact')).toHaveClass('tag-grey')
  })
})
