import { GameServer } from './server';
import { logger } from './utils/logger';

/**
 * Punto de entrada principal del servidor
 */
async function main() {
  try {
    // Crear instancia del servidor
    const gameServer = new GameServer();
    
    // Inicializar el servidor
    gameServer.start();
    
    logger.info('🚀 Albion Parchís Server started successfully');
    
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Ejecutar el servidor
main();