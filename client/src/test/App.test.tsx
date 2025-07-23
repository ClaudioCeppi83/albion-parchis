import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import App from '../App'

describe('App Component', () => {
  it('should render the main title', () => {
    render(<App />)
    
    const title = screen.getByText('Albion Parchís')
    expect(title).toBeInTheDocument()
  })

  it('should render welcome message', () => {
    render(<App />)
    
    const welcome = screen.getByText('Bienvenido a Albion Parchís')
    expect(welcome).toBeInTheDocument()
  })

  it('should render all guild cards', () => {
    render(<App />)
    
    expect(screen.getByText('Steel Guild')).toBeInTheDocument()
    expect(screen.getByText('Arcane Guild')).toBeInTheDocument()
    expect(screen.getByText('Green Guild')).toBeInTheDocument()
    expect(screen.getByText('Golden Guild')).toBeInTheDocument()
  })

  it('should render system status section', () => {
    render(<App />)
    
    expect(screen.getByText('Estado del Sistema')).toBeInTheDocument()
    expect(screen.getByText('Backend (Servidor)')).toBeInTheDocument()
    expect(screen.getByText('Frontend (Cliente)')).toBeInTheDocument()
  })

  it('should show system initialization status', () => {
    render(<App />)
    
    expect(screen.getByText('Sistema Inicializado')).toBeInTheDocument()
    expect(screen.getByText('Fase 1.1 - Fundamentos Técnicos')).toBeInTheDocument()
  })

  it('should render test action buttons', () => {
    render(<App />)
    
    expect(screen.getByText('Probar Servidor')).toBeInTheDocument()
    expect(screen.getByText('Verificar Estilos')).toBeInTheDocument()
  })
})