import { GameState, Player, PlayerAction, ValidationResult } from '../types/game';

/**
 * Sistema de validación de acciones del juego
 * Valida todas las acciones de los jugadores antes de procesarlas
 */
export class ValidationSystem {
  
  /**
   * Validar acción de jugador
   */
  validatePlayerAction(gameState: GameState, playerId: string, action: PlayerAction): ValidationResult {
    try {
      // Validaciones básicas
      const basicValidation = this.validateBasicAction(gameState, playerId, action);
      if (!basicValidation.isValid) {
        return basicValidation;
      }

      // Validaciones específicas por tipo de acción
      switch (action.type) {
        case 'roll_dice':
          return this.validateDiceRoll(gameState, playerId);
        
        case 'move_piece':
          return this.validatePieceMove(gameState, playerId, action);
        
        case 'trade_request':
          return this.validateTradeRequest(gameState, playerId, action);
        
        case 'claim_territory':
          return this.validateTerritoryClaim(gameState, playerId, action);
        
        default:
          return {
            isValid: false,
            error: `Unknown action type: ${action.type}`
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
   * Validaciones básicas para cualquier acción
   */
  private validateBasicAction(gameState: GameState, playerId: string, action: PlayerAction): ValidationResult {
    // Verificar que el juego esté activo
    if (gameState.status !== 'active') {
      return {
        isValid: false,
        error: 'Game is not active'
      };
    }

    // Verificar que el jugador existe
    const player = gameState.players.find(p => p.id === playerId);
    if (!player) {
      return {
        isValid: false,
        error: 'Player not found'
      };
    }

    // Verificar que es el turno del jugador
    if (gameState.currentTurn.playerId !== playerId) {
      return {
        isValid: false,
        error: 'Not your turn'
      };
    }

    // Verificar que el jugador está conectado
    if (!player.isConnected) {
      return {
        isValid: false,
        error: 'Player is not connected'
      };
    }

    return { isValid: true };
  }

  /**
   * Validar tirada de dados
   */
  private validateDiceRoll(gameState: GameState, playerId: string): ValidationResult {
    const currentTurn = gameState.currentTurn;
    
    // Verificar que es la fase correcta
    if (currentTurn.phase !== 'rolling') {
      return {
        isValid: false,
        error: 'Not in rolling phase'
      };
    }

    // Verificar que no se ha tirado ya
    if (currentTurn.diceRoll !== null) {
      return {
        isValid: false,
        error: 'Dice already rolled this turn'
      };
    }

    return { isValid: true };
  }

  /**
   * Validar movimiento de ficha
   */
  private validatePieceMove(gameState: GameState, playerId: string, action: PlayerAction): ValidationResult {
    const currentTurn = gameState.currentTurn;
    
    // Verificar que es la fase correcta
    if (currentTurn.phase !== 'moving') {
      return {
        isValid: false,
        error: 'Not in moving phase'
      };
    }

    // Verificar que se ha tirado el dado
    if (currentTurn.diceRoll === null) {
      return {
        isValid: false,
        error: 'Must roll dice first'
      };
    }

    // Verificar que la acción tiene los datos necesarios
    if (!action.data || !action.data.pieceId || !action.data.targetPosition) {
      return {
        isValid: false,
        error: 'Missing piece movement data'
      };
    }

    // Verificar que la ficha pertenece al jugador
    const player = gameState.players.find(p => p.id === playerId)!;
    const piece = player.pieces.find(p => p.id === action.data.pieceId);
    
    if (!piece) {
      return {
        isValid: false,
        error: 'Piece not found or does not belong to player'
      };
    }

    // Verificar que la ficha puede moverse
    if (piece.status === 'finished') {
      return {
        isValid: false,
        error: 'Piece has already finished'
      };
    }

    // Verificar que el movimiento es válido según el dado
    const isValidDistance = this.validateMoveDistance(piece, action.data.targetPosition, currentTurn.diceRoll);
    if (!isValidDistance.isValid) {
      return isValidDistance;
    }

    return { isValid: true };
  }

  /**
   * Validar distancia de movimiento
   */
  private validateMoveDistance(piece: any, targetPosition: any, diceRoll: number): ValidationResult {
    // Implementación simplificada para el MVP
    // En el futuro se implementará la validación completa de distancias en el tablero
    
    // Si la ficha está en casa, solo puede salir con 5 o 6
    if (piece.status === 'home') {
      if (diceRoll < 5) {
        return {
          isValid: false,
          error: 'Need 5 or 6 to move piece from home'
        };
      }
    }

    // Validación básica de distancia (se mejorará en fases posteriores)
    const distance = Math.abs(targetPosition.x - piece.position.x) + Math.abs(targetPosition.y - piece.position.y);
    if (distance > diceRoll) {
      return {
        isValid: false,
        error: 'Move distance exceeds dice roll'
      };
    }

    return { isValid: true };
  }

  /**
   * Validar solicitud de intercambio
   */
  private validateTradeRequest(gameState: GameState, playerId: string, action: PlayerAction): ValidationResult {
    // Verificar que el intercambio está habilitado en esta fase
    if (gameState.currentTurn.phase !== 'moving') {
      return {
        isValid: false,
        error: 'Trading not available in current phase'
      };
    }

    // Verificar datos de la acción
    if (!action.data || !action.data.targetPlayerId || !action.data.offer || !action.data.request) {
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

    // Verificar que no se está intercambiando consigo mismo
    if (action.data.targetPlayerId === playerId) {
      return {
        isValid: false,
        error: 'Cannot trade with yourself'
      };
    }

    // Verificar que el jugador tiene los recursos que ofrece
    const player = gameState.players.find(p => p.id === playerId)!;
    const hasResources = this.validatePlayerResources(player, action.data.offer);
    if (!hasResources.isValid) {
      return hasResources;
    }

    return { isValid: true };
  }

  /**
   * Validar reclamación de territorio
   */
  private validateTerritoryClaim(gameState: GameState, playerId: string, action: PlayerAction): ValidationResult {
    // Verificar datos de la acción
    if (!action.data || !action.data.territoryPosition) {
      return {
        isValid: false,
        error: 'Missing territory position'
      };
    }

    // Verificar que el territorio no está ya reclamado
    const existingTerritory = gameState.territories.find(t => 
      t.position.x === action.data.territoryPosition.x && 
      t.position.y === action.data.territoryPosition.y
    );

    if (existingTerritory) {
      return {
        isValid: false,
        error: 'Territory already claimed'
      };
    }

    // Verificar que el jugador tiene una ficha en esa posición
    const player = gameState.players.find(p => p.id === playerId)!;
    const pieceAtPosition = player.pieces.find(piece => 
      piece.position.x === action.data.territoryPosition.x && 
      piece.position.y === action.data.territoryPosition.y
    );

    if (!pieceAtPosition) {
      return {
        isValid: false,
        error: 'No piece at territory position'
      };
    }

    return { isValid: true };
  }

  /**
   * Validar que un jugador tiene los recursos especificados
   */
  private validatePlayerResources(player: Player, requiredResources: any): ValidationResult {
    if (!requiredResources) {
      return { isValid: true };
    }

    // Verificar cada tipo de recurso
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

  /**
   * Validar estado del juego
   */
  validateGameState(gameState: GameState): ValidationResult {
    try {
      // Verificar número de jugadores
      if (gameState.players.length < 2 || gameState.players.length > 4) {
        return {
          isValid: false,
          error: 'Invalid number of players'
        };
      }

      // Verificar que todos los jugadores tienen fichas
      for (const player of gameState.players) {
        if (!player.pieces || player.pieces.length !== 4) {
          return {
            isValid: false,
            error: `Player ${player.name} does not have 4 pieces`
          };
        }
      }

      // Verificar turno actual
      if (gameState.status === 'active') {
        const currentPlayer = gameState.players.find(p => p.id === gameState.currentTurn.playerId);
        if (!currentPlayer) {
          return {
            isValid: false,
            error: 'Current turn player not found'
          };
        }
      }

      return { isValid: true };
    } catch (error) {
      return {
        isValid: false,
        error: `Game state validation error: ${error}`
      };
    }
  }

  /**
   * Validar configuración del juego
   */
  validateGameConfig(config: any): ValidationResult {
    if (!config) {
      return {
        isValid: false,
        error: 'Game config is required'
      };
    }

    // Validar configuraciones básicas
    if (config.maxPlayers && (config.maxPlayers < 2 || config.maxPlayers > 4)) {
      return {
        isValid: false,
        error: 'Max players must be between 2 and 4'
      };
    }

    if (config.turnTimeLimit && config.turnTimeLimit < 10) {
      return {
        isValid: false,
        error: 'Turn time limit must be at least 10 seconds'
      };
    }

    return { isValid: true };
  }
}