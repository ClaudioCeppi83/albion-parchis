import { GameState, Player, PlayerAction, ValidationResult, GameStatus } from '../types/game';
import { TurnSystem } from './TurnSystem';
import { MovementSystem } from './MovementSystem';
import { BoardManager } from '../core/BoardManager';

/**
 * Sistema de validaciones mejorado
 * Valida todas las acciones del juego considerando el contexto completo
 */
export class GameValidationSystem {
  private turnSystem: TurnSystem;
  private movementSystem: MovementSystem;
  private boardManager: BoardManager;

  constructor() {
    this.turnSystem = new TurnSystem();
    this.movementSystem = new MovementSystem();
    this.boardManager = new BoardManager();
  }

  /**
   * Validar una acción de jugador
   */
  validatePlayerAction(gameState: GameState, action: PlayerAction): ValidationResult {
    try {
      // Validaciones básicas del estado del juego
      const gameStateValidation = this.validateGameState(gameState);
      if (!gameStateValidation.isValid) {
        return gameStateValidation;
      }

      // Validar que el jugador existe y está conectado
      const playerValidation = this.validatePlayer(gameState, action.playerId);
      if (!playerValidation.isValid) {
        return playerValidation;
      }

      // Validar permisos de turno
      const turnValidation = this.validateTurnPermissions(gameState, action);
      if (!turnValidation.isValid) {
        return turnValidation;
      }

      // Validar la acción específica
      return this.validateSpecificAction(gameState, action);

    } catch (error) {
      return {
        isValid: false,
        error: `Validation error: ${error instanceof Error ? error.message : String(error)}`,
        code: 'VALIDATION_ERROR'
      };
    }
  }

  /**
   * Validar el estado general del juego
   */
  private validateGameState(gameState: GameState): ValidationResult {
    if (!gameState) {
      return {
        isValid: false,
        error: 'Game state is null or undefined',
        code: 'INVALID_GAME_STATE'
      };
    }

    if (gameState.status !== 'active') {
      return {
        isValid: false,
        error: `Game is not active. Current status: ${gameState.status}`,
        code: 'GAME_NOT_ACTIVE'
      };
    }

    if (!gameState.currentTurn) {
      return {
        isValid: false,
        error: 'No current turn defined',
        code: 'NO_CURRENT_TURN'
      };
    }

    if (gameState.players.length < 2) {
      return {
        isValid: false,
        error: 'Not enough players to continue game',
        code: 'INSUFFICIENT_PLAYERS'
      };
    }

    return { isValid: true };
  }

  /**
   * Validar que el jugador existe y puede actuar
   */
  private validatePlayer(gameState: GameState, playerId: string): ValidationResult {
    const player = gameState.players.find(p => p.id === playerId);
    
    if (!player) {
      return {
        isValid: false,
        error: 'Player not found in game',
        code: 'PLAYER_NOT_FOUND'
      };
    }

    if (!player.isConnected) {
      return {
        isValid: false,
        error: 'Player is not connected',
        code: 'PLAYER_DISCONNECTED'
      };
    }

    return { isValid: true };
  }

  /**
   * Validar permisos de turno
   */
  private validateTurnPermissions(gameState: GameState, action: PlayerAction): ValidationResult {
    const canActResult = this.turnSystem.canPlayerAct(gameState, action.playerId, action.type);
    
    if (!canActResult.canAct) {
      return {
        isValid: false,
        error: canActResult.error || 'Cannot perform action in current turn state',
        code: 'TURN_PERMISSION_DENIED'
      };
    }

    return { isValid: true };
  }

  /**
   * Validar acción específica
   */
  private validateSpecificAction(gameState: GameState, action: PlayerAction): ValidationResult {
    switch (action.type) {
      case 'roll_dice':
        return this.validateDiceRoll(gameState, action);
      
      case 'move_piece':
        return this.validatePieceMove(gameState, action);
      
      case 'trade_request':
        return this.validateTradeRequest(gameState, action);
      
      case 'territory_claim':
        return this.validateTerritoryClaim(gameState, action);
      
      default:
        return {
          isValid: false,
          error: `Unknown action type: ${action.type}`,
          code: 'UNKNOWN_ACTION_TYPE'
        };
    }
  }

  /**
   * Validar tirada de dados
   */
  private validateDiceRoll(gameState: GameState, action: PlayerAction): ValidationResult {
    // Verificar que no se haya tirado ya en este turno
    if (gameState.currentTurn.diceRoll !== undefined) {
      return {
        isValid: false,
        error: 'Dice already rolled this turn',
        code: 'DICE_ALREADY_ROLLED'
      };
    }

    // Verificar que estamos en la fase correcta
    if (gameState.currentTurn.phase !== 'roll') {
      return {
        isValid: false,
        error: 'Not in dice rolling phase',
        code: 'WRONG_PHASE_FOR_DICE'
      };
    }

    return { isValid: true };
  }

  /**
   * Validar movimiento de ficha
   */
  private validatePieceMove(gameState: GameState, action: PlayerAction): ValidationResult {
    const { pieceId, targetPosition } = action.data;

    if (!pieceId) {
      return {
        isValid: false,
        error: 'Piece ID is required',
        code: 'MISSING_PIECE_ID'
      };
    }

    if (!targetPosition) {
      return {
        isValid: false,
        error: 'Target position is required',
        code: 'MISSING_TARGET_POSITION'
      };
    }

    // Verificar que se haya tirado el dado
    if (gameState.currentTurn.diceRoll === undefined) {
      return {
        isValid: false,
        error: 'Must roll dice before moving',
        code: 'NO_DICE_ROLL'
      };
    }

    // Encontrar la ficha del jugador
    const player = gameState.players.find(p => p.id === action.playerId);
    const piece = player?.pieces.find(p => p.id === pieceId);

    if (!piece) {
      return {
        isValid: false,
        error: 'Piece not found or does not belong to player',
        code: 'PIECE_NOT_FOUND'
      };
    }

    // Verificar que el movimiento es válido según las reglas del juego
    const availableMoves = this.movementSystem.calculateAvailableMoves(
      gameState, 
      action.playerId, 
      gameState.currentTurn.diceRoll
    );

    const validMove = availableMoves.find(move => 
      move.pieceId === pieceId &&
      move.toPosition.x === targetPosition.x &&
      move.toPosition.y === targetPosition.y
    );

    if (!validMove) {
      return {
        isValid: false,
        error: 'Invalid move for current dice roll',
        code: 'INVALID_MOVE'
      };
    }

    return { 
      isValid: true,
      data: {
        moveDetails: validMove
      }
    };
  }

  /**
   * Validar solicitud de intercambio
   */
  private validateTradeRequest(gameState: GameState, action: PlayerAction): ValidationResult {
    const { targetPlayerId, offeredResources, requestedResources } = action.data;

    if (!targetPlayerId) {
      return {
        isValid: false,
        error: 'Target player ID is required',
        code: 'MISSING_TARGET_PLAYER'
      };
    }

    if (targetPlayerId === action.playerId) {
      return {
        isValid: false,
        error: 'Cannot trade with yourself',
        code: 'SELF_TRADE_ATTEMPT'
      };
    }

    // Verificar que el jugador objetivo existe y está conectado
    const targetPlayer = gameState.players.find(p => p.id === targetPlayerId);
    if (!targetPlayer) {
      return {
        isValid: false,
        error: 'Target player not found',
        code: 'TARGET_PLAYER_NOT_FOUND'
      };
    }

    if (!targetPlayer.isConnected) {
      return {
        isValid: false,
        error: 'Target player is not connected',
        code: 'TARGET_PLAYER_DISCONNECTED'
      };
    }

    // Verificar que el jugador tiene los recursos ofrecidos
    const player = gameState.players.find(p => p.id === action.playerId);
    if (!this.hasRequiredResources(player!, offeredResources)) {
      return {
        isValid: false,
        error: 'Insufficient resources for trade offer',
        code: 'INSUFFICIENT_RESOURCES'
      };
    }

    return { isValid: true };
  }

  /**
   * Validar reclamación de territorio
   */
  private validateTerritoryClaim(gameState: GameState, action: PlayerAction): ValidationResult {
    const { territoryId } = action.data;

    if (!territoryId) {
      return {
        isValid: false,
        error: 'Territory ID is required',
        code: 'MISSING_TERRITORY_ID'
      };
    }

    // Verificar que el territorio existe
    const territory = gameState.territories?.find(t => t.id === territoryId);
    if (!territory) {
      return {
        isValid: false,
        error: 'Territory not found',
        code: 'TERRITORY_NOT_FOUND'
      };
    }

    // Verificar que el territorio no está ya reclamado
    if (territory.ownerId && territory.ownerId !== action.playerId) {
      return {
        isValid: false,
        error: 'Territory already claimed by another player',
        code: 'TERRITORY_ALREADY_CLAIMED'
      };
    }

    // Verificar que el jugador tiene una ficha en el territorio
    const player = gameState.players.find(p => p.id === action.playerId);
    const hasPieceInTerritory = player?.pieces.some(piece => 
      piece.status === 'board' &&
      this.isPositionInTerritory(piece.position, territory)
    );

    if (!hasPieceInTerritory) {
      return {
        isValid: false,
        error: 'No piece in territory to claim it',
        code: 'NO_PIECE_IN_TERRITORY'
      };
    }

    return { isValid: true };
  }

  /**
   * Verificar si el jugador tiene los recursos requeridos
   */
  private hasRequiredResources(player: Player, requiredResources: any): boolean {
    if (!requiredResources || !player.resources) {
      return true;
    }

    for (const [resourceType, amount] of Object.entries(requiredResources)) {
      const playerAmount = player.resources[resourceType] || 0;
      if (playerAmount < (amount as number)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Verificar si una posición está dentro de un territorio
   */
  private isPositionInTerritory(position: any, territory: any): boolean {
    // Implementación simplificada
    // En una implementación completa, verificaríamos si la posición está dentro de los límites del territorio
    return territory.positions?.some((pos: any) => 
      pos.x === position.x && pos.y === position.y
    ) || false;
  }

  /**
   * Validar el estado completo del juego para detectar inconsistencias
   */
  validateCompleteGameState(gameState: GameState): ValidationResult[] {
    const validationResults: ValidationResult[] = [];

    // Validar integridad de jugadores
    for (const player of gameState.players) {
      const playerValidation = this.validatePlayerIntegrity(player);
      if (!playerValidation.isValid) {
        validationResults.push(playerValidation);
      }
    }

    // Validar integridad del tablero
    const boardValidation = this.validateBoardIntegrity(gameState);
    if (!boardValidation.isValid) {
      validationResults.push(boardValidation);
    }

    // Validar consistencia de turnos
    const turnValidation = this.validateTurnConsistency(gameState);
    if (!turnValidation.isValid) {
      validationResults.push(turnValidation);
    }

    return validationResults;
  }

  /**
   * Validar integridad de un jugador
   */
  private validatePlayerIntegrity(player: Player): ValidationResult {
    if (player.pieces.length !== 4) {
      return {
        isValid: false,
        error: `Player ${player.name} has ${player.pieces.length} pieces, expected 4`,
        code: 'INVALID_PIECE_COUNT'
      };
    }

    // Verificar que no hay fichas duplicadas en la misma posición
    const positions = player.pieces
      .filter(piece => piece.status === 'board')
      .map(piece => `${piece.position.x},${piece.position.y}`);
    
    const uniquePositions = new Set(positions);
    if (positions.length !== uniquePositions.size) {
      return {
        isValid: false,
        error: `Player ${player.name} has multiple pieces in the same position`,
        code: 'DUPLICATE_PIECE_POSITIONS'
      };
    }

    return { isValid: true };
  }

  /**
   * Validar integridad del tablero
   */
  private validateBoardIntegrity(gameState: GameState): ValidationResult {
    const positionMap = new Map<string, string[]>();

    // Mapear todas las fichas en el tablero
    for (const player of gameState.players) {
      for (const piece of player.pieces) {
        if (piece.status === 'board') {
          const posKey = `${piece.position.x},${piece.position.y}`;
          if (!positionMap.has(posKey)) {
            positionMap.set(posKey, []);
          }
          positionMap.get(posKey)!.push(`${player.id}:${piece.id}`);
        }
      }
    }

    // Verificar que no hay más de una ficha por posición (excepto en zonas especiales)
    for (const [position, pieces] of positionMap.entries()) {
      if (pieces.length > 1) {
        const [x, y] = position.split(',').map(Number);
        const zoneType = this.boardManager.getZoneType({ x, y, zone: 'normal' });
        
        // En zonas normales no puede haber más de una ficha
        if (zoneType === 'normal' || zoneType === 'start') {
          return {
            isValid: false,
            error: `Multiple pieces at position ${position}: ${pieces.join(', ')}`,
            code: 'MULTIPLE_PIECES_SAME_POSITION'
          };
        }
      }
    }

    return { isValid: true };
  }

  /**
   * Validar consistencia de turnos
   */
  private validateTurnConsistency(gameState: GameState): ValidationResult {
    const currentPlayer = gameState.players.find(p => p.id === gameState.currentTurn.playerId);
    
    if (!currentPlayer) {
      return {
        isValid: false,
        error: 'Current turn player not found in game',
        code: 'INVALID_CURRENT_PLAYER'
      };
    }

    if (!currentPlayer.isConnected) {
      return {
        isValid: false,
        error: 'Current turn player is disconnected',
        code: 'CURRENT_PLAYER_DISCONNECTED'
      };
    }

    return { isValid: true };
  }
}