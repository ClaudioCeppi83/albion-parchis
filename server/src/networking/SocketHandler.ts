import { Server as SocketIOServer, Socket } from 'socket.io';
import { GameEngine } from '../core/GameEngine';
import { logger } from '../utils/logger';
import { ClientMessage, ServerMessage, PlayerAction } from '../types/game';

/**
 * Manejador de conexiones Socket.IO
 * Gestiona la comunicación en tiempo real entre cliente y servidor
 */
export class SocketHandler {
  private io: SocketIOServer;
  private gameEngine: GameEngine;
  private connectedPlayers: Map<string, { socketId: string; playerId?: string; gameId?: string }>;

  constructor(io: SocketIOServer, gameEngine: GameEngine) {
    this.io = io;
    this.gameEngine = gameEngine;
    this.connectedPlayers = new Map();
  }

  /**
   * Manejar nueva conexión
   */
  handleConnection(socket: Socket): void {
    const clientId = socket.id;
    this.connectedPlayers.set(clientId, { socketId: clientId });

    logger.info(`New connection: ${clientId}`);

    // Configurar listeners de eventos
    this.setupEventListeners(socket);

    // Enviar mensaje de bienvenida
    socket.emit('server_message', {
      type: 'connection_established',
      data: {
        socketId: clientId,
        serverTime: new Date().toISOString()
      }
    });
  }

  /**
   * Configurar listeners de eventos del socket
   */
  private setupEventListeners(socket: Socket): void {
    // Autenticación del jugador
    socket.on('authenticate', (data: { playerId: string; gameId: string }) => {
      this.handleAuthentication(socket, data);
    });

    // Unirse a un juego
    socket.on('join_game', (data: { gameId: string; playerName: string }) => {
      this.handleJoinGame(socket, data);
    });

    // Crear nuevo juego
    socket.on('create_game', (data: { playerName: string; gameConfig?: any }) => {
      this.handleCreateGame(socket, data);
    });

    // Acciones del juego
    socket.on('player_action', (data: PlayerAction) => {
      this.handlePlayerAction(socket, data);
    });

    // Solicitar estado del juego
    socket.on('request_game_state', () => {
      this.handleGameStateRequest(socket);
    });

    // Chat del juego
    socket.on('chat_message', (data: { message: string }) => {
      this.handleChatMessage(socket, data);
    });

    // Ping/Pong para mantener conexión
    socket.on('ping', () => {
      socket.emit('pong', { timestamp: Date.now() });
    });

    // Manejo de errores
    socket.on('error', (error) => {
      logger.error(`Socket error for ${socket.id}:`, error);
    });
  }

  /**
   * Manejar autenticación del jugador
   */
  private handleAuthentication(socket: Socket, data: { playerId: string; gameId: string }): void {
    try {
      const { playerId, gameId } = data;
      const clientInfo = this.connectedPlayers.get(socket.id);
      
      if (!clientInfo) {
        socket.emit('error', { message: 'Client not found' });
        return;
      }

      // Verificar que el jugador existe en el juego
      const gameState = this.gameEngine.getGameState(gameId);
      if (!gameState) {
        socket.emit('error', { message: 'Game not found' });
        return;
      }

      const player = gameState.players.find(p => p.id === playerId);
      if (!player) {
        socket.emit('error', { message: 'Player not found in game' });
        return;
      }

      // Actualizar información del cliente
      clientInfo.playerId = playerId;
      clientInfo.gameId = gameId;
      this.connectedPlayers.set(socket.id, clientInfo);

      // Unir al socket a la sala del juego
      socket.join(gameId);

      // Marcar jugador como conectado
      player.isConnected = true;

      // Enviar confirmación
      socket.emit('authenticated', {
        playerId,
        gameId,
        playerName: player.name
      });

      // Notificar a otros jugadores
      socket.to(gameId).emit('player_connected', {
        playerId,
        playerName: player.name
      });

      // Enviar estado actual del juego
      socket.emit('game_state_update', gameState);

      logger.info(`Player authenticated: ${playerId} in game ${gameId}`);
    } catch (error) {
      logger.error('Authentication error:', error);
      socket.emit('error', { message: 'Authentication failed' });
    }
  }

  /**
   * Manejar unirse a un juego
   */
  private handleJoinGame(socket: Socket, data: { gameId: string; playerName: string }): void {
    try {
      const { gameId, playerName } = data;
      
      const result = this.gameEngine.joinGame(gameId, playerName);
      
      if (result.success && result.playerId) {
        const clientInfo = this.connectedPlayers.get(socket.id);
        if (clientInfo) {
          clientInfo.playerId = result.playerId;
          clientInfo.gameId = gameId;
          this.connectedPlayers.set(socket.id, clientInfo);
        }

        socket.join(gameId);

        socket.emit('game_joined', {
          gameId,
          playerId: result.playerId,
          playerName
        });

        // Enviar estado del juego
        const gameState = this.gameEngine.getGameState(gameId);
        if (gameState) {
          this.io.to(gameId).emit('game_state_update', gameState);
        }

        logger.info(`Player ${playerName} joined game ${gameId}`);
      } else {
        socket.emit('error', { message: result.error || 'Failed to join game' });
      }
    } catch (error) {
      logger.error('Join game error:', error);
      socket.emit('error', { message: 'Failed to join game' });
    }
  }

  /**
   * Manejar creación de nuevo juego
   */
  private handleCreateGame(socket: Socket, data: { playerName: string; gameConfig?: any }): void {
    try {
      const { playerName, gameConfig } = data;
      
      const result = this.gameEngine.createGame(playerName, gameConfig);
      
      if (result.success && result.gameId && result.playerId) {
        const clientInfo = this.connectedPlayers.get(socket.id);
        if (clientInfo) {
          clientInfo.playerId = result.playerId;
          clientInfo.gameId = result.gameId;
          this.connectedPlayers.set(socket.id, clientInfo);
        }

        socket.join(result.gameId);

        socket.emit('game_created', {
          gameId: result.gameId,
          playerId: result.playerId,
          playerName
        });

        // Enviar estado inicial del juego
        const gameState = this.gameEngine.getGameState(result.gameId);
        if (gameState) {
          socket.emit('game_state_update', gameState);
        }

        logger.info(`Game created: ${result.gameId} by ${playerName}`);
      } else {
        socket.emit('error', { message: result.error || 'Failed to create game' });
      }
    } catch (error) {
      logger.error('Create game error:', error);
      socket.emit('error', { message: 'Failed to create game' });
    }
  }

  /**
   * Manejar acciones del jugador
   */
  private handlePlayerAction(socket: Socket, action: PlayerAction): void {
    try {
      const clientInfo = this.connectedPlayers.get(socket.id);
      if (!clientInfo || !clientInfo.playerId || !clientInfo.gameId) {
        socket.emit('error', { message: 'Not authenticated' });
        return;
      }

      const result = this.gameEngine.processPlayerAction(
        clientInfo.gameId,
        clientInfo.playerId,
        action
      );

      if (result.success && result.gameState) {
        // Enviar estado actualizado a todos los jugadores del juego
        this.io.to(clientInfo.gameId).emit('game_state_update', result.gameState);

        // Enviar eventos específicos si los hay
        if (result.events && result.events.length > 0) {
          for (const event of result.events) {
            this.io.to(clientInfo.gameId).emit('game_event', event);
          }
        }

        logger.info(`Action processed: ${action.type} by ${clientInfo.playerId}`);
      } else {
        socket.emit('action_error', {
          action: action.type,
          error: result.error || 'Action failed'
        });
      }
    } catch (error) {
      logger.error('Player action error:', error);
      socket.emit('error', { message: 'Action processing failed' });
    }
  }

  /**
   * Manejar solicitud de estado del juego
   */
  private handleGameStateRequest(socket: Socket): void {
    try {
      const clientInfo = this.connectedPlayers.get(socket.id);
      if (!clientInfo || !clientInfo.gameId) {
        socket.emit('error', { message: 'Not in a game' });
        return;
      }

      const gameState = this.gameEngine.getGameState(clientInfo.gameId);
      if (gameState) {
        socket.emit('game_state_update', gameState);
      } else {
        socket.emit('error', { message: 'Game not found' });
      }
    } catch (error) {
      logger.error('Game state request error:', error);
      socket.emit('error', { message: 'Failed to get game state' });
    }
  }

  /**
   * Manejar mensajes de chat
   */
  private handleChatMessage(socket: Socket, data: { message: string }): void {
    try {
      const clientInfo = this.connectedPlayers.get(socket.id);
      if (!clientInfo || !clientInfo.playerId || !clientInfo.gameId) {
        socket.emit('error', { message: 'Not authenticated' });
        return;
      }

      const gameState = this.gameEngine.getGameState(clientInfo.gameId);
      if (!gameState) {
        socket.emit('error', { message: 'Game not found' });
        return;
      }

      const player = gameState.players.find(p => p.id === clientInfo.playerId);
      if (!player) {
        socket.emit('error', { message: 'Player not found' });
        return;
      }

      // Enviar mensaje a todos los jugadores del juego
      this.io.to(clientInfo.gameId).emit('chat_message', {
        playerId: player.id,
        playerName: player.name,
        message: data.message,
        timestamp: new Date().toISOString()
      });

      logger.info(`Chat message from ${player.name}: ${data.message}`);
    } catch (error) {
      logger.error('Chat message error:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  }

  /**
   * Manejar desconexión
   */
  handleDisconnection(socket: Socket, reason: string): void {
    try {
      const clientInfo = this.connectedPlayers.get(socket.id);
      
      if (clientInfo && clientInfo.playerId && clientInfo.gameId) {
        // Marcar jugador como desconectado
        const gameState = this.gameEngine.getGameState(clientInfo.gameId);
        if (gameState) {
          const player = gameState.players.find(p => p.id === clientInfo.playerId);
          if (player) {
            player.isConnected = false;
            
            // Notificar a otros jugadores
            socket.to(clientInfo.gameId).emit('player_disconnected', {
              playerId: player.id,
              playerName: player.name,
              reason
            });
          }
        }

        logger.info(`Player ${clientInfo.playerId} disconnected from game ${clientInfo.gameId}`);
      }

      this.connectedPlayers.delete(socket.id);
    } catch (error) {
      logger.error('Disconnection handling error:', error);
    }
  }

  /**
   * Obtener número de jugadores conectados
   */
  getConnectedPlayersCount(): number {
    return this.connectedPlayers.size;
  }

  /**
   * Enviar mensaje a un juego específico
   */
  sendToGame(gameId: string, event: string, data: any): void {
    this.io.to(gameId).emit(event, data);
  }

  /**
   * Enviar mensaje a un jugador específico
   */
  sendToPlayer(playerId: string, event: string, data: any): void {
    for (const [socketId, clientInfo] of this.connectedPlayers.entries()) {
      if (clientInfo.playerId === playerId) {
        this.io.to(socketId).emit(event, data);
        break;
      }
    }
  }
}