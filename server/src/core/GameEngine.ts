import { GameState, Player, PlayerAction, GameResult, ValidationResult } from '../types/game';
import { BoardManager } from './BoardManager';
import { PlayerManager } from './PlayerManager';
import { ValidationEngine } from './ValidationEngine';
import { ResourceSystem } from '../systems/ResourceSystem';
import { CombatSystem } from '../systems/CombatSystem';
import { TerritorySystem } from '../systems/TerritorySystem';
import { TradingSystem } from '../systems/TradingSystem';
// Nuevos sistemas de mecánicas básicas
import { TurnSystem } from '../systems/TurnSystem';
import { MovementSystem } from '../systems/MovementSystem';
import { GameValidationSystem } from '../systems/GameValidationSystem';
import { GameStateManager } from '../systems/GameStateManager';
import { v4 as uuidv4 } from 'uuid';

/**
 * Motor principal del juego - Núcleo del sistema
 * Gestiona el estado del juego y coordina todos los sistemas
 */
export class GameEngine {
  private boardManager: BoardManager;
  private playerManager: PlayerManager;
  private validationEngine: ValidationEngine;
  
  // Estados del juego
  private activeGames: Map<string, GameState> = new Map();
  
  // Sistemas de juego originales
  private resourceSystem: ResourceSystem;
  private combatSystem: CombatSystem;
  private territorySystem: TerritorySystem;
  private tradingSystem: TradingSystem;

  // Nuevos sistemas de mecánicas básicas
  private turnSystem: TurnSystem;
  private movementSystem: MovementSystem;
  private gameValidationSystem: GameValidationSystem;
  private gameStateManager: GameStateManager;

  constructor() {
    this.boardManager = new BoardManager();
    this.playerManager = new PlayerManager();
    this.validationEngine = new ValidationEngine();
    
    this.resourceSystem = new ResourceSystem();
    this.combatSystem = new CombatSystem();
    this.territorySystem = new TerritorySystem();
    this.tradingSystem = new TradingSystem();

    // Inicializar nuevos sistemas
    this.turnSystem = new TurnSystem();
    this.movementSystem = new MovementSystem();
    this.gameValidationSystem = new GameValidationSystem();
    this.gameStateManager = new GameStateManager();
  }

  /**
   * Iniciar un juego manualmente
   */
  startGameManually(gameId: string): { success: boolean; error?: string } {
    try {
      const gameState = this.activeGames.get(gameId);
      if (!gameState) {
        return {
          success: false,
          error: 'Game not found'
        };
      }

      if (gameState.status !== 'waiting') {
        return {
          success: false,
          error: 'Game already started'
        };
      }

      if (gameState.players.length < 2) {
        return {
          success: false,
          error: 'Need at least 2 players to start'
        };
      }

      const startResult = this.gameStateManager.startGame(gameState);
      return startResult;
    } catch (error) {
      return {
        success: false,
        error: `Error starting game: ${error}`
      };
    }
  }

  /**
   * Iniciar una partida
   */
  private startGame(gameId: string): void {
    const gameState = this.activeGames.get(gameId);
    if (!gameState) return;

    // Usar el nuevo GameStateManager para iniciar el juego
    const result = this.gameStateManager.startGame(gameState);
    
    if (result.success) {
      this.activeGames.set(gameId, gameState);
    }
  }

  /**
   * Procesar acción del jugador
   */
  processPlayerAction(gameId: string, playerId: string, action: PlayerAction): GameResult {
    try {
      const gameState = this.activeGames.get(gameId);
      if (!gameState) {
        return {
          success: false,
          error: 'Game not found'
        };
      }

      // Usar el nuevo sistema de validaciones
      const validation = this.gameValidationSystem.validatePlayerAction(gameState, action);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.error
        };
      }

      // Procesar la acción según su tipo
      let result: GameResult;
      switch (action.type) {
        case 'roll_dice':
          result = this.processDiceRoll(gameState, playerId);
          break;
        case 'move_piece':
          result = this.processMovePiece(gameState, playerId, action.data);
          break;
        case 'trade_request':
          result = this.processTradingAction(gameState, action.data);
          break;
        case 'territory_claim':
          result = this.processTerritoryAction(gameState, playerId, action.data);
          break;
        default:
          return {
            success: false,
            error: 'Unknown action type'
          };
      }

      if (result.success && result.gameState) {
        this.activeGames.set(gameId, result.gameState);
        
        // Verificar condiciones de victoria usando el nuevo sistema
        const winCheck = this.gameStateManager.checkWinConditions(result.gameState);
        if (winCheck.hasWinner && winCheck.result) {
          this.gameStateManager.endGame(result.gameState, winCheck.result);
        }
      }

      return result;
    } catch (error) {
      return {
        success: false,
        error: `Error processing action: ${error}`
      };
    }
  }

  /**
   * Procesar tirada de dados
   */
  private processDiceRoll(gameState: GameState, playerId: string): GameResult {
    // Generar tirada de dados
    const diceRoll = Math.floor(Math.random() * 6) + 1;
    
    // Avanzar fase del turno con la tirada
    const result = this.turnSystem.advancePhase(gameState, diceRoll);
    
    if (!result.success) {
      return {
        success: false,
        error: result.error
      };
    }

    // Calcular movimientos disponibles usando el nuevo sistema
    const availableMoves = this.movementSystem.calculateAvailableMoves(gameState, playerId, diceRoll);
    gameState.currentTurn.availableMoves = availableMoves;

    // Si no hay movimientos disponibles, avanzar automáticamente al siguiente turno
    if (availableMoves.length === 0) {
      this.turnSystem.nextTurn(gameState);
    }

    return {
      success: true,
      gameState,
      events: [{
        id: uuidv4(),
        type: 'dice_roll',
        playerId,
        timestamp: new Date(),
        data: {
          diceRoll,
          availableMoves: availableMoves.length,
          canMove: availableMoves.length > 0
        }
      }]
    };
  }

  /**
   * Procesar movimiento de ficha
   */
  private processMovePiece(gameState: GameState, playerId: string, moveData: any): GameResult {
    // Usar el nuevo sistema de movimiento
    const moveResult = this.movementSystem.executeMove(
      gameState, 
      playerId, 
      moveData.pieceId, 
      moveData.targetPosition
    );

    if (!moveResult.success) {
      return {
        success: false,
        error: moveResult.error
      };
    }

    // Avanzar al siguiente turno
    const turnResult = this.turnSystem.nextTurn(gameState);
    
    if (!turnResult.success) {
      return {
        success: false,
        error: turnResult.error
      };
    }

    return {
      success: true,
      gameState,
      events: [{
        id: uuidv4(),
        type: 'piece_move',
        playerId,
        timestamp: new Date(),
        data: {
          moveEvents: moveResult.events,
          nextPlayer: gameState.currentTurn.playerId
        }
      }]
    };
  }

  /**
   * Procesar encuentros entre fichas (mantenido para compatibilidad)
   */
  private processEncounters(gameState: GameState, moveData: any): void {
    // Los encuentros ahora se manejan automáticamente en MovementSystem
    // Este método se mantiene para compatibilidad con sistemas existentes
  }

  /**
   * Obtener estado del juego
   */
  getGameState(gameId: string): GameState | null {
    return this.activeGames.get(gameId) || null;
  }

  /**
   * Obtener lista de juegos activos
   */
  getActiveGames(): string[] {
    return Array.from(this.activeGames.keys());
  }

  /**
   * Eliminar juego
   */
  removeGame(gameId: string): boolean {
    return this.activeGames.delete(gameId);
  }

  /**
   * Obtener número de juegos activos
   */
  getActiveGamesCount(): number {
    return this.activeGames.size;
  }

  /**
   * Obtener estadísticas del juego
   */
  getGameStats(): any {
    const totalGames = this.activeGames.size;
    const totalPlayers = Array.from(this.activeGames.values())
      .reduce((sum, game) => sum + game.players.length, 0);
    
    const gamesByStatus = Array.from(this.activeGames.values())
      .reduce((acc, game) => {
        acc[game.status] = (acc[game.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    return {
      totalGames,
      totalPlayers,
      gamesByStatus,
      averagePlayersPerGame: totalGames > 0 ? totalPlayers / totalGames : 0
    };
  }

  /**
   * Obtener lista de juegos públicos
   */
  getPublicGames(): any[] {
    return Array.from(this.activeGames.values())
      .filter(game => game.status === 'waiting')
      .map(game => ({
        gameId: game.gameId,
        playerCount: game.players.length,
        maxPlayers: 4,
        status: game.status,
        createdAt: game.createdAt
      }));
  }

  /**
   * Crear juego con configuración personalizada
   */
  createGame(playerName: string, gameConfig?: any): { success: boolean; gameId?: string; playerId?: string; error?: string } {
    try {
      const gameId = uuidv4();
      const playerId = uuidv4();
      const hostPlayer = this.playerManager.createPlayer(playerId, playerName);
      
      // Usar GameStateManager para inicializar el juego
      const gameState = this.gameStateManager.initializeGame(gameId, [hostPlayer]);
      
      this.activeGames.set(gameId, gameState);

      return {
        success: true,
        gameId,
        playerId
      };
    } catch (error) {
      return {
        success: false,
        error: `Error creating game: ${error}`
      };
    }
  }

  /**
   * Procesar acción de comercio
   */
  private processTradingAction(gameState: GameState, actionData: any): GameResult {
    try {
      let result;
      
      switch (actionData.action) {
        case 'create_offer':
          result = this.tradingSystem.createTradeOffer(
            gameState, 
            actionData.fromPlayerId, 
            actionData.toPlayerId, 
            actionData.offer
          );
          break;
        case 'accept_offer':
          result = this.tradingSystem.acceptTradeOffer(
            gameState, 
            actionData.tradeOfferId, 
            actionData.playerId
          );
          break;
        case 'reject_offer':
          result = this.tradingSystem.rejectTradeOffer(
            gameState, 
            actionData.tradeOfferId, 
            actionData.playerId
          );
          break;
        default:
          return {
            success: false,
            error: 'Unknown trading action'
          };
      }

      return {
        success: result.success,
        gameState: result.success ? gameState : undefined,
        error: result.error
      };
    } catch (error) {
      return {
        success: false,
        error: `Trading action failed: ${error}`
      };
    }
  }

  /**
   * Procesar acción de territorio
   */
  private processTerritoryAction(gameState: GameState, playerId: string, actionData: any): GameResult {
    try {
      const result = this.territorySystem.processTerritoryClaim(
        gameState, 
        playerId, 
        actionData.position
      );

      return {
        success: result.success,
        gameState: result.success ? gameState : undefined,
        error: result.error
      };
    } catch (error) {
      return {
        success: false,
        error: `Territory action failed: ${error}`
      };
    }
  }

  /**
   * Unirse a un juego
   */
  joinGame(gameId: string, playerName: string): { success: boolean; playerId?: string; error?: string } {
    try {
      const gameState = this.activeGames.get(gameId);
      if (!gameState) {
        return {
          success: false,
          error: 'Game not found'
        };
      }

      if (gameState.status !== 'waiting') {
        return {
          success: false,
          error: 'Game already started'
        };
      }

      if (gameState.players.length >= 4) {
        return {
          success: false,
          error: 'Game is full'
        };
      }

      const playerId = uuidv4();
      const newPlayer = this.playerManager.createPlayer(playerId, playerName);
      gameState.players.push(newPlayer);
      gameState.updatedAt = new Date();

      // El juego permanece en estado 'waiting' hasta que se inicie manualmente
      // o se alcance el número máximo de jugadores (4)
      if (gameState.players.length >= 4) {
        const startResult = this.gameStateManager.startGame(gameState);
        if (!startResult.success) {
          return {
            success: false,
            error: startResult.error
          };
        }
      }

      return {
        success: true,
        playerId
      };
    } catch (error) {
      return {
        success: false,
        error: `Error joining game: ${error}`
      };
    }
  }

  /**
   * Manejar desconexión de jugador
   */
  handlePlayerDisconnection(gameId: string, playerId: string): { success: boolean; error?: string } {
    const gameState = this.activeGames.get(gameId);
    if (!gameState) {
      return { success: false, error: 'Game not found' };
    }

    return this.gameStateManager.handlePlayerDisconnection(gameState, playerId);
  }

  /**
   * Manejar reconexión de jugador
   */
  handlePlayerReconnection(gameId: string, playerId: string): { success: boolean; error?: string } {
    const gameState = this.activeGames.get(gameId);
    if (!gameState) {
      return { success: false, error: 'Game not found' };
    }

    return this.gameStateManager.handlePlayerReconnection(gameState, playerId);
  }

  /**
   * Actualizar estado del juego (llamar periódicamente)
   */
  updateGameState(gameId: string, deltaTime: number): void {
    const gameState = this.activeGames.get(gameId);
    if (gameState) {
      this.gameStateManager.updateGameState(gameState, deltaTime);
    }
  }

  /**
   * Obtener resumen del estado del juego
   */
  getGameStateSummary(gameId: string): any {
    const gameState = this.activeGames.get(gameId);
    if (!gameState) {
      return null;
    }

    return this.gameStateManager.getGameStateSummary(gameState);
  }
}