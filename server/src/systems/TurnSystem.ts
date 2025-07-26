import { GameState, Player, CurrentTurn, TurnPhase, GameEvent } from '../types/game';
import { v4 as uuidv4 } from 'uuid';

/**
 * Sistema de turnos
 * Gestiona el flujo de turnos, fases y tiempo límite
 */
export class TurnSystem {
  private readonly TURN_TIME_LIMIT = 60000; // 60 segundos por turno
  private readonly PHASE_TIME_LIMITS = {
    roll: 15000,   // 15 segundos para tirar dados
    move: 30000,   // 30 segundos para mover
    action: 15000  // 15 segundos para acciones adicionales
  };

  /**
   * Inicializar el primer turno del juego
   */
  initializeFirstTurn(gameState: GameState): void {
    if (gameState.players.length === 0) {
      throw new Error('No players to start turn');
    }

    // El primer jugador es quien creó la partida (índice 0)
    const firstPlayer = gameState.players[0];
    
    gameState.currentTurn = {
      playerId: firstPlayer.id,
      phase: 'roll',
      timeRemaining: this.PHASE_TIME_LIMITS.roll,
      diceRoll: undefined,
      availableMoves: []
    };

    // Registrar evento
    this.addGameEvent(gameState, 'turn_started', firstPlayer.id, {
      phase: 'roll',
      timeLimit: this.PHASE_TIME_LIMITS.roll
    });
  }

  /**
   * Avanzar a la siguiente fase del turno
   */
  advancePhase(gameState: GameState, diceRoll?: number): { success: boolean; error?: string } {
    const currentTurn = gameState.currentTurn;
    
    switch (currentTurn.phase) {
      case 'roll':
        if (diceRoll === undefined) {
          return { success: false, error: 'Dice roll required to advance from roll phase' };
        }
        
        currentTurn.diceRoll = diceRoll;
        currentTurn.phase = 'move';
        currentTurn.timeRemaining = this.PHASE_TIME_LIMITS.move;
        
        // Registrar evento de tirada
        this.addGameEvent(gameState, 'dice_rolled', currentTurn.playerId, {
          diceRoll,
          nextPhase: 'move'
        });
        
        return { success: true };

      case 'move':
        // Después del movimiento, verificar si hay acciones adicionales disponibles
        currentTurn.phase = 'action';
        currentTurn.timeRemaining = this.PHASE_TIME_LIMITS.action;
        
        this.addGameEvent(gameState, 'phase_advanced', currentTurn.playerId, {
          fromPhase: 'move',
          toPhase: 'action'
        });
        
        return { success: true };

      case 'action':
        // Finalizar turno y pasar al siguiente jugador
        return this.nextTurn(gameState);

      default:
        return { success: false, error: 'Invalid turn phase' };
    }
  }

  /**
   * Pasar al siguiente turno
   */
  nextTurn(gameState: GameState): { success: boolean; error?: string } {
    const currentPlayerIndex = gameState.players.findIndex(p => p.id === gameState.currentTurn.playerId);
    
    if (currentPlayerIndex === -1) {
      return { success: false, error: 'Current player not found' };
    }

    // Calcular siguiente jugador (circular)
    const nextPlayerIndex = (currentPlayerIndex + 1) % gameState.players.length;
    const nextPlayer = gameState.players[nextPlayerIndex];

    // Verificar si el siguiente jugador está conectado
    if (!nextPlayer.isConnected) {
      // Buscar el siguiente jugador conectado
      let searchIndex = nextPlayerIndex;
      let attempts = 0;
      
      while (attempts < gameState.players.length) {
        searchIndex = (searchIndex + 1) % gameState.players.length;
        attempts++;
        
        if (gameState.players[searchIndex].isConnected) {
          break;
        }
      }
      
      if (attempts >= gameState.players.length) {
        return { success: false, error: 'No connected players found' };
      }
      
      nextPlayer.id = gameState.players[searchIndex].id;
    }

    // Registrar fin del turno anterior
    this.addGameEvent(gameState, 'turn_ended', gameState.currentTurn.playerId, {
      phase: gameState.currentTurn.phase,
      diceRoll: gameState.currentTurn.diceRoll
    });

    // Configurar nuevo turno
    gameState.currentTurn = {
      playerId: nextPlayer.id,
      phase: 'roll',
      timeRemaining: this.PHASE_TIME_LIMITS.roll,
      diceRoll: undefined,
      availableMoves: []
    };

    // Registrar inicio del nuevo turno
    this.addGameEvent(gameState, 'turn_started', nextPlayer.id, {
      phase: 'roll',
      timeLimit: this.PHASE_TIME_LIMITS.roll
    });

    return { success: true };
  }

  /**
   * Forzar el siguiente turno (por timeout o desconexión)
   */
  forceTurnAdvance(gameState: GameState, reason: 'timeout' | 'disconnect'): { success: boolean; error?: string } {
    // Registrar evento de turno forzado
    this.addGameEvent(gameState, 'turn_forced', gameState.currentTurn.playerId, {
      reason,
      phase: gameState.currentTurn.phase
    });

    return this.nextTurn(gameState);
  }

  /**
   * Verificar si es el turno de un jugador específico
   */
  isPlayerTurn(gameState: GameState, playerId: string): boolean {
    return gameState.currentTurn.playerId === playerId;
  }

  /**
   * Verificar si el jugador puede realizar una acción en la fase actual
   */
  canPlayerAct(gameState: GameState, playerId: string, actionType: string): { canAct: boolean; error?: string } {
    if (!this.isPlayerTurn(gameState, playerId)) {
      return { canAct: false, error: 'Not your turn' };
    }

    const currentPhase = gameState.currentTurn.phase;

    switch (actionType) {
      case 'roll_dice':
        if (currentPhase !== 'roll') {
          return { canAct: false, error: 'Can only roll dice in roll phase' };
        }
        if (gameState.currentTurn.diceRoll !== undefined) {
          return { canAct: false, error: 'Dice already rolled this turn' };
        }
        break;

      case 'move_piece':
        if (currentPhase !== 'move') {
          return { canAct: false, error: 'Can only move pieces in move phase' };
        }
        if (gameState.currentTurn.diceRoll === undefined) {
          return { canAct: false, error: 'Must roll dice before moving' };
        }
        break;

      case 'trade_request':
      case 'territory_claim':
        if (currentPhase !== 'action') {
          return { canAct: false, error: 'Can only perform actions in action phase' };
        }
        break;

      default:
        return { canAct: false, error: 'Unknown action type' };
    }

    return { canAct: true };
  }

  /**
   * Obtener información del turno actual
   */
  getCurrentTurnInfo(gameState: GameState): any {
    const currentPlayer = gameState.players.find(p => p.id === gameState.currentTurn.playerId);
    
    return {
      currentPlayer: currentPlayer ? {
        id: currentPlayer.id,
        name: currentPlayer.name,
        guildType: currentPlayer.guildType
      } : null,
      phase: gameState.currentTurn.phase,
      timeRemaining: gameState.currentTurn.timeRemaining,
      diceRoll: gameState.currentTurn.diceRoll,
      availableMovesCount: gameState.currentTurn.availableMoves?.length || 0
    };
  }

  /**
   * Actualizar tiempo restante del turno
   */
  updateTurnTimer(gameState: GameState, deltaTime: number): { timeExpired: boolean } {
    gameState.currentTurn.timeRemaining -= deltaTime;
    
    if (gameState.currentTurn.timeRemaining <= 0) {
      gameState.currentTurn.timeRemaining = 0;
      return { timeExpired: true };
    }
    
    return { timeExpired: false };
  }

  /**
   * Obtener el orden de turnos
   */
  getTurnOrder(gameState: GameState): Player[] {
    const currentPlayerIndex = gameState.players.findIndex(p => p.id === gameState.currentTurn.playerId);
    
    if (currentPlayerIndex === -1) {
      return gameState.players;
    }

    // Reordenar array empezando por el jugador actual
    const reorderedPlayers = [
      ...gameState.players.slice(currentPlayerIndex),
      ...gameState.players.slice(0, currentPlayerIndex)
    ];

    return reorderedPlayers;
  }

  /**
   * Verificar si todos los jugadores han terminado sus fichas
   */
  checkGameEnd(gameState: GameState): { gameEnded: boolean; winner?: Player } {
    for (const player of gameState.players) {
      const finishedPieces = player.pieces.filter(piece => piece.status === 'finished');
      
      if (finishedPieces.length === player.pieces.length) {
        return { gameEnded: true, winner: player };
      }
    }

    return { gameEnded: false };
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
    gameState.updatedAt = new Date();
  }
}