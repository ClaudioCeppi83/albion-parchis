import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import Input from '../../components/ui/Input'

describe('Input Component', () => {
  it('should render input with label', () => {
    render(<Input label="Test Label" />)
    
    expect(screen.getByText('Test Label')).toBeInTheDocument()
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('should render input with placeholder', () => {
    render(<Input placeholder="Enter text here" />)
    
    expect(screen.getByPlaceholderText('Enter text here')).toBeInTheDocument()
  })

  it('should render input with error message', () => {
    render(<Input label="Test Input" error="This field is required" />)
    
    expect(screen.getByText('This field is required')).toBeInTheDocument()
    expect(screen.getByRole('textbox')).toHaveClass('border-red-500')
  })

  it('should render input with steel variant', () => {
    render(<Input variant="steel" />)
    
    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('bg-steel-900/20', 'border-steel-500/50')
  })

  it('should render input with arcane variant', () => {
    render(<Input variant="arcane" />)
    
    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('bg-arcane-900/20', 'border-arcane-500/50')
  })

  it('should render input with green variant', () => {
    render(<Input variant="green" />)
    
    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('bg-green-900/20', 'border-green-500/50')
  })

  it('should render input with golden variant', () => {
    render(<Input variant="golden" />)
    
    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('bg-golden-900/20', 'border-golden-500/50')
  })

  it('should handle value changes', () => {
    const handleChange = vi.fn()
    render(<Input onChange={handleChange} />)
    
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'test value' } })
    
    expect(handleChange).toHaveBeenCalledTimes(1)
  })

  it('should render disabled input', () => {
    render(<Input disabled />)
    
    const input = screen.getByRole('textbox')
    expect(input).toBeDisabled()
  })

  it('should render input with email type', () => {
    render(<Input type="email" />)
    expect(screen.getByRole('textbox')).toHaveAttribute('type', 'email')
  })

  it('should render input with password type', () => {
    render(<Input type="password" />)
    const input = document.querySelector('input[type="password"]')
    expect(input).toBeInTheDocument()
  })

  it('should apply custom className', () => {
    render(<Input className="custom-class" />)
    
    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('custom-class')
  })
})