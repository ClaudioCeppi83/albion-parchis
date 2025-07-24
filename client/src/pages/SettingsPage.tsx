import React from 'react';
import { Settings, Volume2, Monitor, Gamepad2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, Button, Input } from '../components/ui';

const SettingsPage: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-game font-bold text-white mb-2">
          Configuración
        </h1>
        <p className="text-slate-300">
          Personaliza tu experiencia de juego
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Audio Settings */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6">
            <div className="flex items-center space-x-3 mb-6">
              <Volume2 className="w-6 h-6 text-blue-400" />
              <h2 className="text-xl font-semibold text-white">Audio</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Volumen Principal
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  defaultValue="75"
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Efectos de Sonido
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  defaultValue="60"
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Música de Fondo
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  defaultValue="40"
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Display Settings */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6">
            <div className="flex items-center space-x-3 mb-6">
              <Monitor className="w-6 h-6 text-green-400" />
              <h2 className="text-xl font-semibold text-white">Pantalla</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Modo Pantalla Completa</span>
                <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                  <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Animaciones</span>
                <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                  <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Efectos Visuales</span>
                <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                  <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                </button>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Game Settings */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-6">
            <div className="flex items-center space-x-3 mb-6">
              <Gamepad2 className="w-6 h-6 text-purple-400" />
              <h2 className="text-xl font-semibold text-white">Juego</h2>
            </div>
            
            <div className="space-y-4">
              <Input
                label="Nombre de Jugador"
                defaultValue="Jugador1"
                placeholder="Tu nombre en el juego"
              />
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Gremio Preferido
                </label>
                <select className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Seleccionar automáticamente</option>
                  <option value="steel">Steel Guild</option>
                  <option value="arcane">Arcane Guild</option>
                  <option value="green">Green Guild</option>
                  <option value="golden">Golden Guild</option>
                </select>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Auto-unirse a partidas</span>
                <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                  <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
                </button>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* System Info */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-6">
            <div className="flex items-center space-x-3 mb-6">
              <Settings className="w-6 h-6 text-yellow-400" />
              <h2 className="text-xl font-semibold text-white">Sistema</h2>
            </div>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Versión</span>
                <span className="text-white">1.0.0-beta</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Fase</span>
                <span className="text-white">1.2 - Componentes React</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Servidor</span>
                <span className="text-green-400">Conectado</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Latencia</span>
                <span className="text-green-400">~25ms</span>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-slate-700">
              <Button variant="outline" className="w-full">
                Restablecer Configuración
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Save Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex justify-center"
      >
        <Button size="lg">
          Guardar Cambios
        </Button>
      </motion.div>
    </div>
  );
};

export default SettingsPage;