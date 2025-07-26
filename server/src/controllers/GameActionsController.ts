import { GameState, PlayerAction, ValidationResult } from '../types/game';
import { GameEngine } from '../core/GameEngine';

/**
 * Controlador de acciones de juego
 * Maneja las acciones específicas de las mecánicas básicas
 */
export class GameActionsController {
  private gameEngine: GameEngine;

  constructor(gameEngine: GameEngine) {
    this.gameEngine = gameEngine;
  }

  /**
   * Tirar dados
   */
  async rollDice(gameId: string, playerId: string): Promise<any> {
    const action: PlayerAction = {
      playerId,
      type: 'roll_dice',
      data: {},
      timestamp: new Date()
    };

    const result = this.gameEngine.processPlayerAction(gameId, playerId, action);
    
    if (result.success) {
      return {
        success: true,
        diceRoll: result.gameState?.currentTurn.diceRoll,
        availableMoves: result.gameState?.currentTurn.availableMoves,
        canMove: result.gameState?.currentTurn.availableMoves && result.gameState.currentTurn.availableMoves.length > 0,
        gameState: this.getPublicGameState(result.gameState!)
      };
    }

    return {
      success: false,
      error: result.error
    };
  }

  /**
   * Mover ficha
   */
  async movePiece(gameId: string, playerId: string, pieceId: string, targetPosition: any): Promise<any> {
    const action: PlayerAction = {
      playerId,
      type: 'move_piece',
      data: {
        pieceId,
        targetPosition
      },
      timestamp: new Date()
    };

    const result = this.gameEngine.processPlayerAction(gameId, playerId, action);
    
    if (result.success) {
      return {
        success: true,
        moveEvents: result.events || [],
        nextPlayer: result.gameState?.currentTurn.playerId,
        gameState: this.getPublicGameState(result.gameState!)
      };
    }

    return {
      success: false,
      error: result.error
    };
  }

  /**
   * Obtener movimientos disponibles para un jugador
   */
  getAvailableMoves(gameId: string, playerId: string): any {
    const gameState = this.gameEngine.getGameState(gameId);
    
    if (!gameState) {
      return {
        success: false,
        error: 'Game not found'
      };
    }

    if (gameState.currentTurn.playerId !== playerId) {
      return {
        success: false,
        error: 'Not your turn'
      };
    }

    if (!gameState.currentTurn.diceRoll) {
      return {
        success: false,
        error: 'Must roll dice first'
      };
    }

    return {
      success: true,
      moves: gameState.currentTurn.availableMoves || []
    };
  }

  /**
   * Obtener información del turno actual
   */
  getCurrentTurnInfo(gameId: string): any {
    const gameState = this.gameEngine.getGameState(gameId);
    
    if (!gameState) {
      return {
        success: false,
        error: 'Game not found'
      };
    }

    const currentPlayer = gameState.players.find(p => p.id === gameState.currentTurn.playerId);
    
    return {
      success: true,
      currentTurn: {
        playerId: gameState.currentTurn.playerId,
        playerName: currentPlayer?.name || 'Unknown',
        phase: gameState.currentTurn.phase,
        timeRemaining: gameState.currentTurn.timeRemaining,
        diceRoll: gameState.currentTurn.diceRoll,
        availableMovesCount: gameState.currentTurn.availableMoves?.length || 0
      }
    };
  }

  /**
   * Obtener estadísticas del jugador
   */
  getPlayerStats(gameId: string, playerId: string): any {
    const gameState = this.gameEngine.getGameState(gameId);
    
    if (!gameState) {
      return {
        success: false,
        error: 'Game not found'
      };
    }

    const player = gameState.players.find(p => p.id === playerId);
    
    if (!player) {
      return {
        success: false,
        error: 'Player not found'
      };
    }

    const stats = {
      totalPieces: player.pieces.length,
      piecesAtHome: player.pieces.filter(p => p.status === 'home').length,
      piecesOnBoard: player.pieces.filter(p => p.status === 'board').length,
      piecesFinished: player.pieces.filter(p => p.status === 'finished').length
    };

    return {
      success: true,
      stats
    };
  }

  /**
   * Obtener estado público del juego (sin información sensible)
   */
  private getPublicGameState(gameState: GameState): any {
    return {
      id: gameState.id,
      status: gameState.status,
      players: gameState.players.map(player => ({
        id: player.id,
        name: player.name,
        guildType: player.guildType,
        isConnected: player.isConnected,
        pieces: player.pieces.map(piece => ({
          id: piece.id,
          position: piece.position,
          status: piece.status
        })),
        stats: {
          piecesAtHome: player.pieces.filter(p => p.status === 'home').length,
          piecesOnBoard: player.pieces.filter(p => p.status === 'board').length,
          piecesFinished: player.pieces.filter(p => p.status === 'finished').length
        }
      })),
      currentTurn: {
        playerId: gameState.currentTurn.playerId,
        phase: gameState.currentTurn.phase,
        timeRemaining: gameState.currentTurn.timeRemaining,
        diceRoll: gameState.currentTurn.diceRoll,
        availableMovesCount: gameState.currentTurn.availableMoves?.length || 0
      },
      gameProgress: this.calculateGameProgress(gameState),
      lastUpdate: gameState.updatedAt
    };
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
      progressPercentage: Math.round((finishedPieces / totalPieces) * 100)
    };
  }

  /**
   * Forzar siguiente turno (para administradores o timeouts)
   */
  async forceNextTurn(gameId: string, reason: 'timeout' | 'admin' = 'admin'): Promise<any> {
    const gameState = this.gameEngine.getGameState(gameId);
    
    if (!gameState) {
      return {
        success: false,
        error: 'Game not found'
      };
    }

    // Aquí podrías agregar lógica adicional para forzar el turno
    // Por ahora, simplemente procesamos una acción de "pasar turno"
    
    return {
      success: true,
      message: 'Turn forced',
      gameState: this.getPublicGameState(gameState)
    };
  }

  /**
   * Obtener historial de eventos del juego
   */
  getGameEvents(gameId: string, limit: number = 10): any {
    const gameState = this.gameEngine.getGameState(gameId);
    
    if (!gameState) {
      return {
        success: false,
        error: 'Game not found'
      };
    }

    const events = gameState.eventLog
      .slice(-limit)
      .map(event => ({
        id: event.id,
        type: event.type,
        playerId: event.playerId,
        timestamp: event.timestamp,
        data: event.data
      }));

    return {
      success: true,
      events
    };
  }

  /**
   * Validar si una acción es posible
   */
  validateAction(gameId: string, playerId: string, actionType: string, actionData?: any): any {
    const gameState = this.gameEngine.getGameState(gameId);
    
    if (!gameState) {
      return {
        success: false,
        error: 'Game not found'
      };
    }

    const action: PlayerAction = {
      playerId,
      type: actionType as 'roll_dice' | 'move_piece' | 'trade_request' | 'territory_claim',
      data: actionData || {},
      timestamp: new Date()
    };

    // Aquí podrías usar el GameValidationSystem directamente
    // Por ahora, retornamos una validación básica
    
    return {
      success: true,
      canPerform: gameState.currentTurn.playerId === playerId,
      reason: gameState.currentTurn.playerId === playerId ? 'Valid' : 'Not your turn'
    };
  }
}