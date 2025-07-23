import winston from 'winston';
import path from 'path';

// Configurar formato de logs
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    return `${timestamp} [${level.toUpperCase()}]: ${message} ${
      Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''
    }`;
  })
);

// Configurar transports
const transports: winston.transport[] = [
  // Console transport
  new winston.transports.Console({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  })
];

// Agregar file transports en producción
if (process.env.NODE_ENV === 'production') {
  // Log de errores
  transports.push(
    new winston.transports.File({
      filename: path.join(process.cwd(), 'logs', 'error.log'),
      level: 'error',
      format: logFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  );

  // Log combinado
  transports.push(
    new winston.transports.File({
      filename: path.join(process.cwd(), 'logs', 'combined.log'),
      format: logFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  );
}

// Crear logger
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  transports,
  // No salir en errores no manejados
  exitOnError: false
});

// Manejar excepciones no capturadas
logger.exceptions.handle(
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  })
);

// Manejar rechazos de promesas no manejados
logger.rejections.handle(
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  })
);

// Funciones de utilidad para logging específico del juego
export const gameLogger = {
  /**
   * Log de eventos del juego
   */
  gameEvent: (gameId: string, event: string, data?: any) => {
    logger.info(`Game Event: ${event}`, {
      gameId,
      event,
      data,
      category: 'game'
    });
  },

  /**
   * Log de acciones de jugador
   */
  playerAction: (gameId: string, playerId: string, action: string, data?: any) => {
    logger.info(`Player Action: ${action}`, {
      gameId,
      playerId,
      action,
      data,
      category: 'player'
    });
  },

  /**
   * Log de errores del juego
   */
  gameError: (gameId: string, error: string, details?: any) => {
    logger.error(`Game Error: ${error}`, {
      gameId,
      error,
      details,
      category: 'game'
    });
  },

  /**
   * Log de conexiones
   */
  connection: (socketId: string, event: string, data?: any) => {
    logger.info(`Connection: ${event}`, {
      socketId,
      event,
      data,
      category: 'connection'
    });
  },

  /**
   * Log de performance
   */
  performance: (operation: string, duration: number, data?: any) => {
    logger.info(`Performance: ${operation}`, {
      operation,
      duration,
      data,
      category: 'performance'
    });
  }
};

export default logger;