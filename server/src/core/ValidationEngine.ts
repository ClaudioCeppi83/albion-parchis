import { GameState, Player, PlayerAction, ValidationResult } from '../types/game';

/**
 * Motor de validación
 * Valida todas las acciones del juego
 */
export class ValidationEngine {
  
  /**
   * Validar acción del jugador
   */
  validateAction(action: PlayerAction, gameState: GameState): ValidationResult {
    try {
      // Validaciones básicas
      if (!action || !action.type) {
        return {
          isValid: false,
          error: 'Invalid action format'
        };
      }

      // Validar según el tipo de acción
      switch (action.type) {
        case 'roll_dice':
          return this.validateDiceRoll(action, gameState);
        case 'move_piece':
          return this.validateMovePiece(action, gameState);
        case 'trade_request':
          return this.validateTradeRequest(action, gameState);
        case 'territory_claim':
          return this.validateTerritoryAction(action, gameState);
        default:
          return {
            isValid: false,
            error: 'Unknown action type'
          };
      }
    } catch (error) {
      return {
        isValid: false,
        error: `Validation error: ${error}`
      };
    }
  }

  /**
   * Validar tirada de dados
   */
  private validateDiceRoll(action: PlayerAction, gameState: GameState): ValidationResult {
    if (gameState.currentTurn.phase !== 'roll') {
      return {
        isValid: false,
        error: 'Not in roll phase'
      };
    }

    return { isValid: true };
  }

  /**
   * Validar movimiento de ficha
   */
  private validateMovePiece(action: PlayerAction, gameState: GameState): ValidationResult {
    if (gameState.currentTurn.phase !== 'move') {
      return {
        isValid: false,
        error: 'Not in move phase'
      };
    }

    if (!action.data || !action.data.pieceId || !action.data.targetPosition) {
      return {
        isValid: false,
        error: 'Missing piece or target position'
      };
    }

    return { isValid: true };
  }

  /**
   * Validar solicitud de intercambio
   */
  private validateTradeRequest(action: PlayerAction, gameState: GameState): ValidationResult {
    if (!action.data || !action.data.targetPlayerId || !action.data.offer) {
      return {
        isValid: false,
        error: 'Missing trade data'
      };
    }

    // Verificar que el jugador objetivo existe
    const targetPlayer = gameState.players.find(p => p.id === action.data.targetPlayerId);
    if (!targetPlayer) {
      return {
        isValid: false,
        error: 'Target player not found'
      };
    }

    return { isValid: true };
  }

  /**
   * Validar acción de territorio
   */
  private validateTerritoryAction(action: PlayerAction, gameState: GameState): ValidationResult {
    if (!action.data || !action.data.territoryPosition) {
      return {
        isValid: false,
        error: 'Missing territory position'
      };
    }

    return { isValid: true };
  }

  /**
   * Validar estado del juego
   */
  validateGameState(gameState: GameState): ValidationResult {
    if (!gameState) {
      return {
        isValid: false,
        error: 'Game state is null'
      };
    }

    if (!gameState.players || gameState.players.length === 0) {
      return {
        isValid: false,
        error: 'No players in game'
      };
    }

    if (gameState.players.length > 4) {
      return {
        isValid: false,
        error: 'Too many players'
      };
    }

    return { isValid: true };
  }

  /**
   * Validar recursos del jugador
   */
  validatePlayerResources(player: Player, requiredResources: any): ValidationResult {
    if (!requiredResources) {
      return { isValid: true };
    }

    for (const [resourceType, amount] of Object.entries(requiredResources)) {
      const playerAmount = player.resources[resourceType as keyof typeof player.resources] || 0;
      if (playerAmount < (amount as number)) {
        return {
          isValid: false,
          error: `Insufficient ${resourceType}: has ${playerAmount}, needs ${amount}`
        };
      }
    }

    return { isValid: true };
  }
}