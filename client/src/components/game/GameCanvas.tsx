import React, { useEffect, useRef, useState } from 'react';
import { IsometricEngine } from '../../engine/IsometricEngine';

interface GameCanvasProps {
  width?: number;
  height?: number;
  className?: string;
}

/**
 * Componente Canvas para el juego isométrico
 */
export const GameCanvas: React.FC<GameCanvasProps> = ({
  width = 800,
  height = 600,
  className = ''
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<IsometricEngine | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeEngine = async () => {
      try {
        if (!canvasRef.current) return;

        // Crear instancia del motor
        engineRef.current = new IsometricEngine(canvasRef.current);
        
        // Renderizar el tablero inicial
        engineRef.current.renderBoard();
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error initializing isometric engine:', err);
        setError('Error al inicializar el motor gráfico');
        setIsLoading(false);
      }
    };

    initializeEngine();

    // Cleanup al desmontar
    return () => {
      if (engineRef.current) {
        engineRef.current.destroy();
        engineRef.current = null;
      }
    };
  }, []);

  // Manejar redimensionamiento
  useEffect(() => {
    const handleResize = () => {
      if (engineRef.current) {
        engineRef.current.resize(width, height);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [width, height]);

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded ${className}`}>
        <div className="text-center">
          <h3 className="font-bold">Error del Motor Gráfico</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75 z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando motor isométrico...</p>
          </div>
        </div>
      )}
      
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="border border-gray-300 rounded-lg shadow-lg"
        style={{ 
          display: 'block',
          maxWidth: '100%',
          height: 'auto'
        }}
      />
      
      {!isLoading && (
        <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
          Motor Isométrico Activo
        </div>
      )}
    </div>
  );
};

export default GameCanvas;