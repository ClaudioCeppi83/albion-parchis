import { Server as SocketIOServer, Socket } from 'socket.io';
import { GameEngine } from '../core/GameEngine';
import { GameActionsController } from '../controllers/GameActionsController';
import { logger } from '../utils/logger';
import { ClientMessage, ServerMessage, PlayerAction } from '../types/game';

/**
 * Manejador de conexiones Socket.IO
 * Gestiona la comunicación en tiempo real entre cliente y servidor
 */
export class SocketHandler {
  private io: SocketIOServer;
  private gameEngine: GameEngine;
  private gameActionsController: GameActionsController;
  private connectedPlayers: Map<string, { socketId: string; playerId?: string; gameId?: string }>;

  constructor(io: SocketIOServer, gameEngine: GameEngine) {
    this.io = io;
    this.gameEngine = gameEngine;
    this.gameActionsController = new GameActionsController(gameEngine);
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

    // Acciones del juego (genérico)
    socket.on('player_action', (data: PlayerAction) => {
      this.handlePlayerAction(socket, data);
    });

    // === EVENTOS ESPECÍFICOS DE MECÁNICAS BÁSICAS ===
    
    // Tirar dados
    socket.on('roll_dice', () => {
      this.handleRollDice(socket);
    });

    // Mover ficha
    socket.on('move_piece', (data: { pieceId: string; targetPosition: any }) => {
      this.handleMovePiece(socket, data);
    });

    // Obtener movimientos disponibles
    socket.on('get_available_moves', () => {
      this.handleGetAvailableMoves(socket);
    });

    // Obtener información del turno actual
    socket.on('get_turn_info', () => {
      this.handleGetTurnInfo(socket);
    });

    // Obtener estadísticas del jugador
    socket.on('get_player_stats', () => {
      this.handleGetPlayerStats(socket);
    });

    // Obtener eventos del juego
    socket.on('get_game_events', (data: { limit?: number }) => {
      this.handleGetGameEvents(socket, data);
    });

    // Validar acción
    socket.on('validate_action', (data: { actionType: string; actionData?: any }) => {
      this.handleValidateAction(socket, data);
    });

    // === EVENTOS EXISTENTES ===

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

  // === HANDLERS PARA MECÁNICAS BÁSICAS ===

  /**
   * Manejar tirada de dados
   */
  private async handleRollDice(socket: Socket): Promise<void> {
    try {
      const clientInfo = this.connectedPlayers.get(socket.id);
      if (!clientInfo || !clientInfo.playerId || !clientInfo.gameId) {
        socket.emit('error', { message: 'Not authenticated' });
        return;
      }

      const result = await this.gameActionsController.rollDice(
        clientInfo.gameId,
        clientInfo.playerId
      );

      if (result.success) {
        // Enviar resultado al jugador
        socket.emit('dice_rolled', {
          diceRoll: result.diceRoll,
          availableMoves: result.availableMoves,
          canMove: result.canMove
        });

        // Notificar a otros jugadores
        socket.to(clientInfo.gameId).emit('player_rolled_dice', {
          playerId: clientInfo.playerId,
          diceRoll: result.diceRoll
        });

        // Enviar estado actualizado
        this.io.to(clientInfo.gameId).emit('game_state_update', result.gameState);

        logger.info(`Dice rolled: ${result.diceRoll} by ${clientInfo.playerId}`);
      } else {
        socket.emit('action_error', {
          action: 'roll_dice',
          error: result.error
        });
      }
    } catch (error) {
      logger.error('Roll dice error:', error);
      socket.emit('error', { message: 'Failed to roll dice' });
    }
  }

  /**
   * Manejar movimiento de ficha
   */
  private async handleMovePiece(socket: Socket, data: { pieceId: string; targetPosition: any }): Promise<void> {
    try {
      const clientInfo = this.connectedPlayers.get(socket.id);
      if (!clientInfo || !clientInfo.playerId || !clientInfo.gameId) {
        socket.emit('error', { message: 'Not authenticated' });
        return;
      }

      const { pieceId, targetPosition } = data;
      const result = await this.gameActionsController.movePiece(
        clientInfo.gameId,
        clientInfo.playerId,
        pieceId,
        targetPosition
      );

      if (result.success) {
        // Enviar confirmación al jugador
        socket.emit('piece_moved', {
          pieceId,
          targetPosition,
          moveEvents: result.moveEvents
        });

        // Notificar a otros jugadores
        socket.to(clientInfo.gameId).emit('player_moved_piece', {
          playerId: clientInfo.playerId,
          pieceId,
          targetPosition,
          moveEvents: result.moveEvents
        });

        // Enviar estado actualizado
        this.io.to(clientInfo.gameId).emit('game_state_update', result.gameState);

        // Si hay cambio de turno, notificar
        if (result.nextPlayer) {
          this.io.to(clientInfo.gameId).emit('turn_changed', {
            nextPlayer: result.nextPlayer
          });
        }

        logger.info(`Piece moved: ${pieceId} by ${clientInfo.playerId}`);
      } else {
        socket.emit('action_error', {
          action: 'move_piece',
          error: result.error
        });
      }
    } catch (error) {
      logger.error('Move piece error:', error);
      socket.emit('error', { message: 'Failed to move piece' });
    }
  }

  /**
   * Manejar solicitud de movimientos disponibles
   */
  private handleGetAvailableMoves(socket: Socket): void {
    try {
      const clientInfo = this.connectedPlayers.get(socket.id);
      if (!clientInfo || !clientInfo.playerId || !clientInfo.gameId) {
        socket.emit('error', { message: 'Not authenticated' });
        return;
      }

      const result = this.gameActionsController.getAvailableMoves(
        clientInfo.gameId,
        clientInfo.playerId
      );

      socket.emit('available_moves', result);
    } catch (error) {
      logger.error('Get available moves error:', error);
      socket.emit('error', { message: 'Failed to get available moves' });
    }
  }

  /**
   * Manejar solicitud de información del turno
   */
  private handleGetTurnInfo(socket: Socket): void {
    try {
      const clientInfo = this.connectedPlayers.get(socket.id);
      if (!clientInfo || !clientInfo.gameId) {
        socket.emit('error', { message: 'Not in a game' });
        return;
      }

      const result = this.gameActionsController.getCurrentTurnInfo(clientInfo.gameId);
      socket.emit('turn_info', result);
    } catch (error) {
      logger.error('Get turn info error:', error);
      socket.emit('error', { message: 'Failed to get turn info' });
    }
  }

  /**
   * Manejar solicitud de estadísticas del jugador
   */
  private handleGetPlayerStats(socket: Socket): void {
    try {
      const clientInfo = this.connectedPlayers.get(socket.id);
      if (!clientInfo || !clientInfo.playerId || !clientInfo.gameId) {
        socket.emit('error', { message: 'Not authenticated' });
        return;
      }

      const result = this.gameActionsController.getPlayerStats(
        clientInfo.gameId,
        clientInfo.playerId
      );

      socket.emit('player_stats', result);
    } catch (error) {
      logger.error('Get player stats error:', error);
      socket.emit('error', { message: 'Failed to get player stats' });
    }
  }

  /**
   * Manejar solicitud de eventos del juego
   */
  private handleGetGameEvents(socket: Socket, data: { limit?: number }): void {
    try {
      const clientInfo = this.connectedPlayers.get(socket.id);
      if (!clientInfo || !clientInfo.gameId) {
        socket.emit('error', { message: 'Not in a game' });
        return;
      }

      const result = this.gameActionsController.getGameEvents(
        clientInfo.gameId,
        data.limit || 10
      );

      socket.emit('game_events', result);
    } catch (error) {
      logger.error('Get game events error:', error);
      socket.emit('error', { message: 'Failed to get game events' });
    }
  }

  /**
   * Manejar validación de acción
   */
  private handleValidateAction(socket: Socket, data: { actionType: string; actionData?: any }): void {
    try {
      const clientInfo = this.connectedPlayers.get(socket.id);
      if (!clientInfo || !clientInfo.playerId || !clientInfo.gameId) {
        socket.emit('error', { message: 'Not authenticated' });
        return;
      }

      const result = this.gameActionsController.validateAction(
        clientInfo.gameId,
        clientInfo.playerId,
        data.actionType,
        data.actionData
      );

      socket.emit('action_validation', result);
    } catch (error) {
      logger.error('Validate action error:', error);
      socket.emit('error', { message: 'Failed to validate action' });
    }
  }
}