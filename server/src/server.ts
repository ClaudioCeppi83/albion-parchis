import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import { config } from 'dotenv';
import { GameEngine } from './core/GameEngine';
import { SocketHandler } from './networking/SocketHandler';
import { logger } from './utils/logger';

// Cargar variables de entorno
config();

/**
 * Servidor principal de Valdris Chronicles
 * Configura Express, Socket.IO y maneja las conexiones
 */
export class GameServer {
  private app: express.Application;
  private server: any;
  private io: SocketIOServer;
  private gameEngine: GameEngine;
  private socketHandler: SocketHandler;
  private port: number;

  constructor() {
    this.port = parseInt(process.env.PORT || '3001');
    this.app = express();
    this.server = createServer(this.app);
    
    // Inicializar Socket.IO con configuración CORS
    this.io = new SocketIOServer(this.server, {
      cors: {
        origin: process.env.CORS_ORIGIN || "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true
      },
      transports: ['websocket', 'polling']
    });

    this.gameEngine = new GameEngine();
    this.socketHandler = new SocketHandler(this.io, this.gameEngine);

    this.setupMiddleware();
    this.setupRoutes();
    this.setupSocketHandlers();
  }

  /**
   * Configurar middleware de Express
   */
  private setupMiddleware(): void {
    // Seguridad
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
    }));

    // CORS
    this.app.use(cors({
      origin: process.env.CORS_ORIGIN || "http://localhost:5173",
      credentials: true
    }));

    // Parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true }));

    // Logging
    this.app.use((req, res, next) => {
      logger.info(`${req.method} ${req.path}`, {
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
      next();
    });
  }

  /**
   * Configurar rutas HTTP
   */
  private setupRoutes(): void {
    // Ruta de salud
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: process.env.npm_package_version || '1.0.0'
      });
    });

    // Información del servidor
    this.app.get('/api/server-info', (req, res) => {
      res.json({
        name: 'Valdris Chronicles Server',
        version: '1.0.0',
        activeGames: this.gameEngine.getActiveGamesCount(),
        connectedPlayers: this.socketHandler.getConnectedPlayersCount(),
        uptime: process.uptime()
      });
    });

    // Estadísticas del juego
    this.app.get('/api/stats', (req, res) => {
      const stats = this.gameEngine.getGameStats();
      res.json(stats);
    });

    // Lista de juegos públicos
    this.app.get('/api/games', (req, res) => {
      const games = this.gameEngine.getPublicGames();
      res.json(games);
    });

    // Crear nuevo juego
    this.app.post('/api/games', (req, res) => {
      try {
        const { playerName, gameConfig } = req.body;
        
        if (!playerName) {
          return res.status(400).json({ error: 'Player name is required' });
        }

        const result = this.gameEngine.createGame(playerName, gameConfig);
        
        if (result.success) {
          return res.status(201).json({
            gameId: result.gameId,
            playerId: result.playerId,
            message: 'Game created successfully'
          });
        } else {
          return res.status(400).json({ error: result.error });
        }
      } catch (error) {
        logger.error('Error creating game:', error);
        return res.status(500).json({ error: 'Internal server error' });
      }
    });

    // Unirse a un juego
    this.app.post('/api/games/:gameId/join', (req, res) => {
      try {
        const { gameId } = req.params;
        const { playerName } = req.body;
        
        if (!playerName) {
          return res.status(400).json({ error: 'Player name is required' });
        }

        const result = this.gameEngine.joinGame(gameId, playerName);
        
        if (result.success) {
          return res.json({
            playerId: result.playerId,
            message: 'Joined game successfully'
          });
        } else {
          return res.status(400).json({ error: result.error });
        }
      } catch (error) {
        logger.error('Error joining game:', error);
        return res.status(500).json({ error: 'Internal server error' });
      }
    });

    // Obtener estado del juego
    this.app.get('/api/games/:gameId', (req, res) => {
      try {
        const { gameId } = req.params;
        const gameState = this.gameEngine.getGameState(gameId);
        
        if (gameState) {
          return res.json(gameState);
        } else {
          return res.status(404).json({ error: 'Game not found' });
        }
      } catch (error) {
        logger.error('Error getting game state:', error);
        return res.status(500).json({ error: 'Internal server error' });
      }
    });

    // Ruta 404
    this.app.use('*', (req, res) => {
      res.status(404).json({ error: 'Route not found' });
    });

    // Manejo de errores
    this.app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
      logger.error('Express error:', error);
      res.status(500).json({ error: 'Internal server error' });
    });
  }

  /**
   * Configurar manejadores de Socket.IO
   */
  private setupSocketHandlers(): void {
    this.io.on('connection', (socket) => {
      logger.info(`Client connected: ${socket.id}`);
      
      // Delegar el manejo al SocketHandler
      this.socketHandler.handleConnection(socket);
      
      socket.on('disconnect', (reason) => {
        logger.info(`Client disconnected: ${socket.id}, reason: ${reason}`);
        this.socketHandler.handleDisconnection(socket, reason);
      });
    });
  }

  /**
   * Iniciar el servidor
   */
  public start(): void {
    this.server.listen(this.port, () => {
      logger.info(`🎮 Valdris Chronicles Server running on port ${this.port}`);
      logger.info(`🌐 Client URL: ${process.env.CORS_ORIGIN || 'http://localhost:5173'}`);
      logger.info(`📊 Health check: http://localhost:${this.port}/health`);
      
      // Configurar manejo de señales para cierre graceful
      this.setupGracefulShutdown();
    });
  }

  /**
   * Configurar cierre graceful del servidor
   */
  private setupGracefulShutdown(): void {
    const shutdown = (signal: string) => {
      logger.info(`Received ${signal}, shutting down gracefully...`);
      
      this.server.close(() => {
        logger.info('HTTP server closed');
        
        // Cerrar conexiones de Socket.IO
        this.io.close(() => {
          logger.info('Socket.IO server closed');
          process.exit(0);
        });
      });

      // Forzar cierre después de 10 segundos
      setTimeout(() => {
        logger.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  }

  /**
   * Obtener instancia del servidor Express
   */
  public getApp(): express.Application {
    return this.app;
  }

  /**
   * Obtener instancia de Socket.IO
   */
  public getIO(): SocketIOServer {
    return this.io;
  }
}

export default GameServer;