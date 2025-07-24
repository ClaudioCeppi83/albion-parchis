import React from 'react';
import { motion } from 'framer-motion';
import GameCanvas from '../components/game/GameCanvas';
import { Button } from '../components/ui';

/**
 * Página de prueba para el Motor Isométrico
 */
export const IsometricTestPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-6xl mx-auto"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-4xl font-bold text-white mb-4"
          >
            🎮 Motor Isométrico
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-xl text-gray-300 mb-6"
          >
            Prueba del sistema de renderizado isométrico para Albion Parchís
          </motion.p>
        </div>

        {/* Canvas Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6 mb-8"
        >
          <div className="flex justify-center">
            <GameCanvas
              width={800}
              height={600}
              className="rounded-lg overflow-hidden"
            />
          </div>
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6"
        >
          <h2 className="text-2xl font-bold text-white mb-4">🎛️ Controles</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div className="bg-black bg-opacity-30 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-2">🖱️ Mouse</h3>
              <ul className="text-gray-300 text-sm space-y-1">
                <li>• <strong>Arrastrar:</strong> Mover cámara</li>
                <li>• <strong>Rueda:</strong> Zoom in/out</li>
                <li>• <strong>Click:</strong> Seleccionar tile</li>
              </ul>
            </div>
            
            <div className="bg-black bg-opacity-30 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-2">🎯 Características</h3>
              <ul className="text-gray-300 text-sm space-y-1">
                <li>• Vista isométrica</li>
                <li>• Tablero 15x15</li>
                <li>• Caminos del parchís</li>
                <li>• Interactividad completa</li>
              </ul>
            </div>
            
            <div className="bg-black bg-opacity-30 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-2">⚡ Tecnología</h3>
              <ul className="text-gray-300 text-sm space-y-1">
                <li>• PixiJS 7.x</li>
                <li>• WebGL/Canvas</li>
                <li>• TypeScript</li>
                <li>• React Integration</li>
              </ul>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 justify-center">
            <Button
              variant="primary"
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              🔄 Reiniciar Motor
            </Button>
            
            <Button
              variant="secondary"
              onClick={() => window.history.back()}
              className="bg-gray-600 hover:bg-gray-700"
            >
              ← Volver
            </Button>
            
            <Button
              variant="outline"
              onClick={() => {
                const canvas = document.querySelector('canvas');
                if (canvas) {
                  const link = document.createElement('a');
                  link.download = 'albion-parchis-board.png';
                  link.href = canvas.toDataURL();
                  link.click();
                }
              }}
              className="border-white text-white hover:bg-white hover:text-gray-900"
            >
              📸 Capturar
            </Button>
          </div>
        </motion.div>

        {/* Info Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="text-center mt-8"
        >
          <p className="text-gray-400 text-sm">
            Fase 1.4: Motor Isométrico - Albion Parchís Engine v1.0
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default IsometricTestPage;