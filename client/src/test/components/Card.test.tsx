import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Card from '../../components/ui/Card'

describe('Card Component', () => {
  it('should render card with default variant', () => {
    render(
      <Card>
        <div>
          <h3>Test Title</h3>
          <p>Test content</p>
        </div>
      </Card>
    )
    
    expect(screen.getByText('Test Title')).toBeInTheDocument()
    expect(screen.getByText('Test content')).toBeInTheDocument()
  })

  it('should render card with steel variant', () => {
    render(
      <Card variant="steel">
        <h3>Steel Card</h3>
      </Card>
    )
    
    const card = screen.getByText('Steel Card').closest('div')
    expect(card).toHaveClass('bg-steel-900/20', 'border-steel-500/30')
  })

  it('should render card with arcane variant', () => {
    render(
      <Card variant="arcane">
        <h3>Arcane Card</h3>
      </Card>
    )
    
    const card = screen.getByText('Arcane Card').closest('div')
    expect(card).toHaveClass('bg-arcane-900/20', 'border-arcane-500/30')
  })

  it('should render card with green variant', () => {
    render(
      <Card variant="green">
        <h3>Green Card</h3>
      </Card>
    )
    
    const card = screen.getByText('Green Card').closest('div')
    expect(card).toHaveClass('bg-green-900/20', 'border-green-500/30')
  })

  it('should render card with golden variant', () => {
    render(
      <Card variant="golden">
        <h3>Golden Card</h3>
      </Card>
    )
    
    const card = screen.getByText('Golden Card').closest('div')
    expect(card).toHaveClass('bg-golden-900/20', 'border-golden-500/30')
  })

  it('should render card with hover effect', () => {
    render(
      <Card hover>
        <h3>Hoverable Card</h3>
      </Card>
    )
    
    const card = screen.getByText('Hoverable Card').closest('div')
    expect(card).toHaveClass('hover:scale-105', 'hover:shadow-lg', 'cursor-pointer')
  })

  it('should render card with custom className', () => {
    render(
      <Card className="custom-class">
        <h3>Custom Card</h3>
      </Card>
    )
    
    const card = screen.getByText('Custom Card').closest('div')
    expect(card).toHaveClass('custom-class')
  })

  it('should render card without hover effect by default', () => {
    render(
      <Card>
        <h3>Normal Card</h3>
      </Card>
    )
    
    const card = screen.getByText('Normal Card').closest('div')
    expect(card).not.toHaveClass('hover:scale-105')
    expect(card).not.toHaveClass('cursor-pointer')
  })
})