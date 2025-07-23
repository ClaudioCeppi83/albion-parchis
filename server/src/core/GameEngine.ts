import { GameState, Player, PlayerAction, GameResult, ValidationResult } from '../types/game';
import { BoardManager } from './BoardManager';
import { PlayerManager } from './PlayerManager';
import { ValidationEngine } from './ValidationEngine';
import { ResourceSystem } from '../systems/ResourceSystem';
import { CombatSystem } from '../systems/CombatSystem';
import { TerritorySystem } from '../systems/TerritorySystem';
import { TradingSystem } from '../systems/TradingSystem';
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
  
  // Sistemas de juego
  private resourceSystem: ResourceSystem;
  private combatSystem: CombatSystem;
  private territorySystem: TerritorySystem;
  private tradingSystem: TradingSystem;

  constructor() {
    this.boardManager = new BoardManager();
    this.playerManager = new PlayerManager();
    this.validationEngine = new ValidationEngine();
    
    this.resourceSystem = new ResourceSystem();
    this.combatSystem = new CombatSystem();
    this.territorySystem = new TerritorySystem();
    this.tradingSystem = new TradingSystem();
  }

  /**
   * Iniciar una partida
   */
  private startGame(gameId: string): void {
    const gameState = this.activeGames.get(gameId);
    if (!gameState) return;

    gameState.status = 'playing';
    gameState.currentTurn = {
      playerId: gameState.players[0].id,
      phase: 'roll',
      timeRemaining: 60 // 60 segundos por turno
    };

    // Inicializar posiciones de las fichas
    this.boardManager.initializePieces(gameState);
    
    gameState.updatedAt = new Date();
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

      // Validar que es el turno del jugador
      if (gameState.currentTurn.playerId !== playerId) {
        return {
          success: false,
          error: 'Not your turn'
        };
      }

      // Validar la acción
      const validation = this.validationEngine.validateAction(action, gameState);
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
        this.checkWinConditions(result.gameState);
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
    if (gameState.currentTurn.phase !== 'roll') {
      return {
        success: false,
        error: 'Not in roll phase'
      };
    }

    const diceRoll = Math.floor(Math.random() * 6) + 1;
    gameState.currentTurn.diceRoll = diceRoll;
    gameState.currentTurn.phase = 'move';

    // Calcular movimientos disponibles
    const availableMoves = this.boardManager.getAvailableMoves(gameState, playerId, diceRoll);
    gameState.currentTurn.availableMoves = availableMoves;

    // Si no hay movimientos disponibles, pasar turno
    if (availableMoves.length === 0) {
      this.nextTurn(gameState);
    }

    return {
      success: true,
      gameState
    };
  }

  /**
   * Procesar movimiento de ficha
   */
  private processMovePiece(gameState: GameState, playerId: string, moveData: any): GameResult {
    if (gameState.currentTurn.phase !== 'move') {
      return {
        success: false,
        error: 'Not in move phase'
      };
    }

    const result = this.boardManager.movePiece(gameState, moveData);
    if (!result.success) {
      return result;
    }

    // Procesar encuentros si los hay
    if (result.gameState) {
      this.processEncounters(result.gameState, moveData);
      this.nextTurn(result.gameState);
    }

    return result;
  }

  /**
   * Procesar encuentros entre fichas
   */
  private processEncounters(gameState: GameState, moveData: any): void {
    // Implementar lógica de encuentros (combate, comercio, etc.)
    // Por ahora, implementación básica
  }

  /**
   * Pasar al siguiente turno
   */
  private nextTurn(gameState: GameState): void {
    const currentPlayerIndex = gameState.players.findIndex(p => p.id === gameState.currentTurn.playerId);
    const nextPlayerIndex = (currentPlayerIndex + 1) % gameState.players.length;
    
    gameState.currentTurn = {
      playerId: gameState.players[nextPlayerIndex].id,
      phase: 'roll',
      timeRemaining: 60
    };
  }

  /**
   * Verificar condiciones de victoria
   */
  private checkWinConditions(gameState: GameState): void {
    for (const player of gameState.players) {
      const finishedPieces = player.pieces.filter(p => p.status === 'finished');
      if (finishedPieces.length === 4) {
        gameState.status = 'finished';
        // Agregar evento de victoria
        gameState.eventLog.push({
          id: uuidv4(),
          type: 'game_won',
          playerId: player.id,
          timestamp: new Date(),
          data: { winner: player.name }
        });
        break;
      }
    }
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
      
      const gameState: GameState = {
        gameId,
        status: 'waiting',
        players: [hostPlayer],
        currentTurn: {
          playerId: '',
          phase: 'roll',
          timeRemaining: 0
        },
        territories: this.territorySystem.initializeTerritories(),
        eventLog: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

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

      // Si tenemos suficientes jugadores, iniciar la partida
      if (gameState.players.length >= 2) {
        this.startGame(gameId);
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
}