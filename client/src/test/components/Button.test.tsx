import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import Button from '../../components/ui/Button'

describe('Button Component', () => {
  it('should render button with default variant (primary)', () => {
    render(<Button>Test Button</Button>)
    
    const button = screen.getByRole('button', { name: 'Test Button' })
    expect(button).toBeInTheDocument()
    expect(button).toHaveClass('bg-blue-600', 'hover:bg-blue-700', 'text-white')
  })

  it('should render button with secondary variant', () => {
    render(<Button variant="secondary">Secondary Button</Button>)
    
    const button = screen.getByRole('button', { name: 'Secondary Button' })
    expect(button).toHaveClass('bg-slate-600', 'hover:bg-slate-700', 'text-white')
  })

  it('should render button with outline variant', () => {
    render(<Button variant="outline">Outline Button</Button>)
    
    const button = screen.getByRole('button', { name: 'Outline Button' })
    expect(button).toHaveClass('border-2', 'border-blue-600', 'text-blue-600')
  })

  it('should render button with ghost variant', () => {
    render(<Button variant="ghost">Ghost Button</Button>)
    
    const button = screen.getByRole('button', { name: 'Ghost Button' })
    expect(button).toHaveClass('text-slate-600', 'hover:bg-slate-100')
  })

  it('should render button with danger variant', () => {
    render(<Button variant="danger">Danger Button</Button>)
    
    const button = screen.getByRole('button', { name: 'Danger Button' })
    expect(button).toHaveClass('bg-red-600', 'hover:bg-red-700', 'text-white')
  })

  it('should render button with small size', () => {
    render(<Button size="sm">Small Button</Button>)
    
    const button = screen.getByRole('button', { name: 'Small Button' })
    expect(button).toHaveClass('px-3', 'py-1.5', 'text-sm')
  })

  it('should render button with medium size (default)', () => {
    render(<Button>Medium Button</Button>)
    
    const button = screen.getByRole('button', { name: 'Medium Button' })
    expect(button).toHaveClass('px-4', 'py-2', 'text-base')
  })

  it('should render button with large size', () => {
    render(<Button size="lg">Large Button</Button>)
    
    const button = screen.getByRole('button', { name: 'Large Button' })
    expect(button).toHaveClass('px-6', 'py-3', 'text-lg')
  })

  it('should render disabled button', () => {
    render(<Button disabled>Disabled Button</Button>)
    
    const button = screen.getByRole('button', { name: 'Disabled Button' })
    expect(button).toBeDisabled()
    expect(button).toHaveClass('disabled:opacity-50', 'disabled:cursor-not-allowed')
  })

  it('should render loading button', () => {
    render(<Button isLoading>Loading Button</Button>)
    
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    expect(screen.getByText('Cargando...')).toBeInTheDocument()
    
    // Verificar que el spinner está presente
    const spinner = button.querySelector('svg')
    expect(spinner).toBeInTheDocument()
    expect(spinner).toHaveClass('animate-spin')
  })

  it('should handle click events', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Clickable Button</Button>)
    
    const button = screen.getByRole('button', { name: 'Clickable Button' })
    fireEvent.click(button)
    
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('should not handle click events when disabled', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick} disabled>Disabled Button</Button>)
    
    const button = screen.getByRole('button', { name: 'Disabled Button' })
    fireEvent.click(button)
    
    expect(handleClick).not.toHaveBeenCalled()
  })

  it('should not handle click events when loading', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick} isLoading>Loading Button</Button>)
    
    const button = screen.getByRole('button')
    fireEvent.click(button)
    
    expect(handleClick).not.toHaveBeenCalled()
  })

  it('should apply custom className', () => {
    render(<Button className="custom-class">Custom Button</Button>)
    
    const button = screen.getByRole('button', { name: 'Custom Button' })
    expect(button).toHaveClass('custom-class')
  })
})