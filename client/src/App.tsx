import React from 'react'
import { Gamepad2, Shield, Sparkles, Leaf, Crown } from 'lucide-react'

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-800/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Gamepad2 className="w-8 h-8 text-blue-400" />
              <h1 className="text-2xl font-game font-bold gradient-text">
                Albion Parchís
              </h1>
            </div>
            <div className="text-sm text-slate-400">
              Fase 1.1 - Fundamentos Técnicos
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Welcome Section */}
          <div className="text-center mb-12">
            <h2 className="text-4xl font-game font-bold text-white mb-4">
              Bienvenido a Albion Parchís
            </h2>
            <p className="text-xl text-slate-300 mb-8">
              Parchís reimaginado con elementos de Albion Online
            </p>
            <div className="inline-flex items-center space-x-2 bg-green-900/20 border border-green-500 rounded-lg px-4 py-2">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-400 font-medium">Sistema Inicializado</span>
            </div>
          </div>

          {/* Guild Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="card-hover group">
              <div className="flex items-center space-x-3 mb-4">
                <Shield className="w-8 h-8 text-steel-400" />
                <h3 className="text-lg font-game font-semibold text-steel-300">
                  Steel Guild
                </h3>
              </div>
              <p className="text-sm text-slate-400 mb-4">
                Maestros del metal y la forja. Especialistas en defensa y resistencia.
              </p>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-steel-500 rounded-full"></div>
                <span className="text-xs text-steel-400">+20% Recursos de Piedra</span>
              </div>
            </div>

            <div className="card-hover group">
              <div className="flex items-center space-x-3 mb-4">
                <Sparkles className="w-8 h-8 text-arcane-400" />
                <h3 className="text-lg font-game font-semibold text-arcane-300">
                  Arcane Guild
                </h3>
              </div>
              <p className="text-sm text-slate-400 mb-4">
                Magos y alquimistas. Dominan las artes arcanas y la transmutación.
              </p>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-arcane-500 rounded-full"></div>
                <span className="text-xs text-arcane-400">+50% Recursos de Plata</span>
              </div>
            </div>

            <div className="card-hover group">
              <div className="flex items-center space-x-3 mb-4">
                <Leaf className="w-8 h-8 text-green-400" />
                <h3 className="text-lg font-game font-semibold text-green-300">
                  Green Guild
                </h3>
              </div>
              <p className="text-sm text-slate-400 mb-4">
                Guardianes de la naturaleza. Expertos en recursos naturales.
              </p>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                <span className="text-xs text-green-400">+20% Madera y Fibra</span>
              </div>
            </div>

            <div className="card-hover group">
              <div className="flex items-center space-x-3 mb-4">
                <Crown className="w-8 h-8 text-golden-400" />
                <h3 className="text-lg font-game font-semibold text-golden-300">
                  Golden Guild
                </h3>
              </div>
              <p className="text-sm text-slate-400 mb-4">
                Comerciantes y nobles. Maestros del comercio y la riqueza.
              </p>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-golden-500 rounded-full"></div>
                <span className="text-xs text-golden-400">+30% Recursos de Mineral</span>
              </div>
            </div>
          </div>

          {/* System Status */}
          <div className="card">
            <h3 className="text-xl font-game font-semibold text-white mb-6">
              Estado del Sistema
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-slate-300 mb-3">Backend (Servidor)</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">GameEngine</span>
                    <span className="text-green-400 text-sm">✓ Configurado</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">BoardManager</span>
                    <span className="text-green-400 text-sm">✓ Configurado</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">ValidationSystem</span>
                    <span className="text-green-400 text-sm">✓ Configurado</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">ResourceManager</span>
                    <span className="text-green-400 text-sm">✓ Configurado</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">Socket.IO</span>
                    <span className="text-yellow-400 text-sm">⏳ Pendiente</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-slate-300 mb-3">Frontend (Cliente)</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">React + TypeScript</span>
                    <span className="text-green-400 text-sm">✓ Configurado</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">Tailwind CSS</span>
                    <span className="text-green-400 text-sm">✓ Configurado</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">Vite Build</span>
                    <span className="text-green-400 text-sm">✓ Configurado</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">Tema Albion</span>
                    <span className="text-green-400 text-sm">✓ Configurado</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">Componentes</span>
                    <span className="text-yellow-400 text-sm">⏳ Pendiente</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Test Actions */}
          <div className="mt-8 text-center">
            <div className="inline-flex space-x-4">
              <button className="btn-primary">
                Probar Servidor
              </button>
              <button className="btn-secondary">
                Verificar Estilos
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-700 bg-slate-800/50 backdrop-blur-sm mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-slate-400 text-sm">
            <p>Albion Parchís - Fase 1.1: Fundamentos Técnicos</p>
            <p className="mt-1">Desarrollado con React, TypeScript, Node.js y Socket.IO</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App