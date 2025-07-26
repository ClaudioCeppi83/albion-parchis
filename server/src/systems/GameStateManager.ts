import { GameState, GameStatus, Player, GameEvent, GameResult, GuildType } from '../types/game';
import { TurnSystem } from './TurnSystem';
import { MovementSystem } from './MovementSystem';
import { GameValidationSystem } from './GameValidationSystem';
import { v4 as uuidv4 } from 'uuid';

/**
 * Sistema de estados de juego
 * Gestiona las transiciones de estado y el flujo general del juego
 */
export class GameStateManager {
  private turnSystem: TurnSystem;
  private movementSystem: MovementSystem;
  private validationSystem: GameValidationSystem;

  constructor() {
    this.turnSystem = new TurnSystem();
    this.movementSystem = new MovementSystem();
    this.validationSystem = new GameValidationSystem();
  }

  /**
   * Inicializar un nuevo juego
   */
  initializeGame(gameId: string, players: Player[]): GameState {
    if (players.length < 1 || players.length > 4) {
      throw new Error('Game requires 1-4 players');
    }

    const gameState: GameState = {
      id: gameId,
      gameId: gameId,
      status: 'waiting',
      players: players.map((player, index) => ({
        ...player,
        guildType: this.assignGuildType(index),
        isConnected: true,
        pieces: [],
        resources: {
          silver: 100,
          stone: 50,
          wood: 50,
          fiber: 50,
          ore: 50
        }
      })),
      currentTurn: {
        playerId: '',
        phase: 'roll',
        timeRemaining: 0,
        diceRoll: undefined,
        availableMoves: []
      },
      territories: [],
      eventLog: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Inicializar fichas para cada jugador
    this.initializePlayerPieces(gameState);

    // Registrar evento de creación del juego
    this.addGameEvent(gameState, 'game_created', 'system', {
      gameId,
      playerCount: players.length,
      players: players.map(p => ({ id: p.id, name: p.name }))
    });

    return gameState;
  }

  /**
   * Iniciar el juego
   */
  startGame(gameState: GameState): { success: boolean; error?: string } {
    if (gameState.status !== 'waiting') {
      return { success: false, error: 'Game is not in waiting state' };
    }

    if (gameState.players.length < 2) {
      return { success: false, error: 'Not enough players to start game' };
    }

    // Verificar que todos los jugadores están conectados
    const disconnectedPlayers = gameState.players.filter(p => !p.isConnected);
    if (disconnectedPlayers.length > 0) {
      return { success: false, error: 'All players must be connected to start' };
    }

    // Cambiar estado a activo
    gameState.status = 'active';

    // Inicializar primer turno
    this.turnSystem.initializeFirstTurn(gameState);

    // Registrar evento de inicio
    this.addGameEvent(gameState, 'game_started', 'system', {
      firstPlayer: gameState.currentTurn.playerId,
      startTime: new Date()
    });

    gameState.updatedAt = new Date();

    return { success: true };
  }

  /**
   * Pausar el juego
   */
  pauseGame(gameState: GameState, reason: string): { success: boolean; error?: string } {
    if (gameState.status !== 'active') {
      return { success: false, error: 'Game is not active' };
    }

    gameState.status = 'paused';

    this.addGameEvent(gameState, 'game_paused', 'system', {
      reason,
      pausedAt: new Date(),
      currentTurn: gameState.currentTurn
    });

    gameState.updatedAt = new Date();

    return { success: true };
  }

  /**
   * Reanudar el juego
   */
  resumeGame(gameState: GameState): { success: boolean; error?: string } {
    if (gameState.status !== 'paused') {
      return { success: false, error: 'Game is not paused' };
    }

    gameState.status = 'active';

    this.addGameEvent(gameState, 'game_resumed', 'system', {
      resumedAt: new Date(),
      currentTurn: gameState.currentTurn
    });

    gameState.updatedAt = new Date();

    return { success: true };
  }

  /**
   * Finalizar el juego
   */
  endGame(gameState: GameState, result: GameResult): { success: boolean; error?: string } {
    if (gameState.status === 'finished') {
      return { success: false, error: 'Game is already finished' };
    }

    gameState.status = 'finished';

    // Calcular estadísticas finales
    const finalStats = this.calculateFinalStats(gameState);

    this.addGameEvent(gameState, 'game_ended', 'system', {
      result,
      finalStats,
      endTime: new Date(),
      duration: new Date().getTime() - gameState.createdAt.getTime()
    });

    gameState.updatedAt = new Date();

    return { success: true };
  }

  /**
   * Manejar desconexión de jugador
   */
  handlePlayerDisconnection(gameState: GameState, playerId: string): { success: boolean; error?: string } {
    const player = gameState.players.find(p => p.id === playerId);
    if (!player) {
      return { success: false, error: 'Player not found' };
    }

    player.isConnected = false;

    this.addGameEvent(gameState, 'player_disconnected', playerId, {
      disconnectedAt: new Date(),
      wasCurrentPlayer: gameState.currentTurn.playerId === playerId
    });

    // Si es el turno del jugador desconectado, forzar avance
    if (gameState.currentTurn.playerId === playerId && gameState.status === 'active') {
      this.turnSystem.forceTurnAdvance(gameState, 'disconnect');
    }

    // Verificar si quedan suficientes jugadores conectados
    const connectedPlayers = gameState.players.filter(p => p.isConnected);
    if (connectedPlayers.length < 2 && gameState.status === 'active') {
      this.pauseGame(gameState, 'Insufficient connected players');
    }

    gameState.updatedAt = new Date();

    return { success: true };
  }

  /**
   * Manejar reconexión de jugador
   */
  handlePlayerReconnection(gameState: GameState, playerId: string): { success: boolean; error?: string } {
    const player = gameState.players.find(p => p.id === playerId);
    if (!player) {
      return { success: false, error: 'Player not found' };
    }

    player.isConnected = true;

    this.addGameEvent(gameState, 'player_reconnected', playerId, {
      reconnectedAt: new Date()
    });

    // Si el juego estaba pausado por falta de jugadores, intentar reanudarlo
    if (gameState.status === 'paused') {
      const connectedPlayers = gameState.players.filter(p => p.isConnected);
      if (connectedPlayers.length >= 2) {
        this.resumeGame(gameState);
      }
    }

    gameState.updatedAt = new Date();

    return { success: true };
  }

  /**
   * Verificar condiciones de victoria
   */
  checkWinConditions(gameState: GameState): { hasWinner: boolean; winner?: Player; result?: GameResult } {
    // Verificar si algún jugador ha terminado todas sus fichas
    for (const player of gameState.players) {
      if (this.movementSystem.hasPlayerWon(gameState, player.id)) {
        const result: GameResult = {
          success: true,
          winnerId: player.id,
          winnerName: player.name,
          winCondition: 'all_pieces_finished',
          finalScores: this.calculatePlayerScores(gameState),
          gameStats: this.calculateFinalStats(gameState)
        };

        return { hasWinner: true, winner: player, result };
      }
    }

    // Verificar condiciones de victoria por tiempo (si aplica)
    // Verificar condiciones de victoria por puntos (si aplica)
    // Verificar condiciones de victoria por territorio (si aplica)

    return { hasWinner: false };
  }

  /**
   * Actualizar el estado del juego
   */
  updateGameState(gameState: GameState, deltaTime: number): void {
    if (gameState.status !== 'active') {
      return;
    }

    // Actualizar temporizador de turno
    const timerResult = this.turnSystem.updateTurnTimer(gameState, deltaTime);
    
    if (timerResult.timeExpired) {
      // Forzar avance de turno por timeout
      this.turnSystem.forceTurnAdvance(gameState, 'timeout');
    }

    // Verificar condiciones de victoria
    const winCheck = this.checkWinConditions(gameState);
    if (winCheck.hasWinner && winCheck.result) {
      this.endGame(gameState, winCheck.result);
    }

    // Validar integridad del estado del juego
    const validationResults = this.validationSystem.validateCompleteGameState(gameState);
    if (validationResults.length > 0) {
      // Log de errores de validación
      for (const validation of validationResults) {
        this.addGameEvent(gameState, 'validation_error', 'system', {
          error: validation.error,
          code: validation.code
        });
      }
    }

    gameState.updatedAt = new Date();
  }

  /**
   * Obtener resumen del estado actual
   */
  getGameStateSummary(gameState: GameState): any {
    return {
      id: gameState.id,
      status: gameState.status,
      playerCount: gameState.players.length,
      connectedPlayers: gameState.players.filter(p => p.isConnected).length,
      currentTurn: this.turnSystem.getCurrentTurnInfo(gameState),
      gameProgress: this.calculateGameProgress(gameState),
      uptime: new Date().getTime() - gameState.createdAt.getTime(),
      lastUpdate: gameState.updatedAt
    };
  }

  /**
   * Asignar tipo de gremio basado en el índice del jugador
   */
  private assignGuildType(playerIndex: number): GuildType {
    const guildTypes: GuildType[] = ['steel', 'arcane', 'green', 'golden'];
    return guildTypes[playerIndex % guildTypes.length];
  }

  /**
   * Inicializar fichas para todos los jugadores
   */
  private initializePlayerPieces(gameState: GameState): void {
    for (const player of gameState.players) {
      // Crear 4 fichas para cada jugador
      player.pieces = Array.from({ length: 4 }, (_, index) => ({
        id: uuidv4(),
        playerId: player.id,
        guildType: player.guildType,
        position: { x: -1, y: -1, zone: 'home' }, // Posición inicial en casa
        status: 'home',
        equipment: {},
        level: 1,
        experience: 0
      }));
    }
  }

  /**
   * Calcular progreso del juego
   */
  private calculateGameProgress(gameState: GameState): any {
    const totalPieces = gameState.players.length * 4;
    let finishedPieces = 0;
    let piecesOnBoard = 0;

    for (const player of gameState.players) {
      for (const piece of player.pieces) {
        if (piece.status === 'finished') {
          finishedPieces++;
        } else if (piece.status === 'board') {
          piecesOnBoard++;
        }
      }
    }

    return {
      totalPieces,
      finishedPieces,
      piecesOnBoard,
      piecesAtHome: totalPieces - finishedPieces - piecesOnBoard,
      progressPercentage: (finishedPieces / totalPieces) * 100
    };
  }

  /**
   * Calcular puntuaciones de jugadores
   */
  private calculatePlayerScores(gameState: GameState): any[] {
    return gameState.players.map(player => {
      const finishedPieces = player.pieces.filter(p => p.status === 'finished').length;
      const piecesOnBoard = player.pieces.filter(p => p.status === 'board').length;
      
      // Calcular distancia promedio de fichas en tablero
      let totalDistance = 0;
      const boardPieces = player.pieces.filter(p => p.status === 'board');
      
      for (const piece of boardPieces) {
        totalDistance += this.movementSystem.getDistanceToFinish(gameState, player.id, piece);
      }
      
      const averageDistance = boardPieces.length > 0 ? totalDistance / boardPieces.length : 0;

      return {
        playerId: player.id,
        playerName: player.name,
        finishedPieces,
        piecesOnBoard,
        averageDistance,
        score: (finishedPieces * 100) + (piecesOnBoard * 10) - averageDistance
      };
    });
  }

  /**
   * Calcular estadísticas finales
   */
  private calculateFinalStats(gameState: GameState): any {
    const totalTurns = gameState.eventLog.filter(e => e.type === 'turn_started').length;
    const totalMoves = gameState.eventLog.filter(e => e.type === 'piece_moved').length;
    const totalCaptures = gameState.eventLog.filter(e => e.type === 'piece_captured').length;

    return {
      totalTurns,
      totalMoves,
      totalCaptures,
      gameDuration: new Date().getTime() - gameState.createdAt.getTime(),
      playerStats: this.calculatePlayerScores(gameState)
    };
  }

  /**
   * Agregar evento al log del juego
   */
  private addGameEvent(gameState: GameState, type: string, playerId: string, data: any): void {
    const event: GameEvent = {
      id: uuidv4(),
      type,
      playerId,
      timestamp: new Date(),
      data
    };

    gameState.eventLog.push(event);
  }
}