import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import App from '../App'

describe('App Component', () => {
  it('should render the application without errors', () => {
    render(<App />)
    
    // Verificar que la aplicación se renderiza sin errores
    expect(document.body).toBeInTheDocument()
  })

  it('should render the main app container', () => {
    render(<App />)
    
    // Verificar que el contenedor principal existe
    const appContainer = document.querySelector('.App')
    expect(appContainer).toBeInTheDocument()
  })

  it('should render the layout structure', () => {
    render(<App />)
    
    // Verificar que hay un elemento main
    const mainElement = document.querySelector('main')
    expect(mainElement).toBeInTheDocument()
  })

  it('should have the correct background styling', () => {
    render(<App />)
    
    // Verificar que el layout tiene las clases de fondo correctas
    const layoutElement = document.querySelector('.min-h-screen')
    expect(layoutElement).toBeInTheDocument()
  })
})