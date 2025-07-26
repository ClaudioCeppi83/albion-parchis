import { describe, it, expect, beforeEach } from '@jest/globals';
import { GameStateManager } from '../systems/GameStateManager';
import { GameState, Player, GuildType } from '../types/game';
import { v4 as uuidv4 } from 'uuid';

describe('Simple Integration Tests', () => {
  let gameStateManager: GameStateManager;
  let gameId: string;

  beforeEach(() => {
    gameStateManager = new GameStateManager();
    gameId = 'test-game-' + Date.now();
  });

  const createTestPlayers = (names: string[]): Player[] => {
    return names.map(name => ({
      id: uuidv4(),
      name,
      guildType: 'steel' as GuildType,
      isConnected: true,
      pieces: [],
      resources: {
        silver: 0,
        stone: 0,
        wood: 0,
        fiber: 0,
        ore: 0
      },
      level: 1,
      experience: 0,
      territories: []
    }));
  };

  describe('Game Creation and Basic Operations', () => {
    it('should create a game with initial state', () => {
      const players = createTestPlayers(['Player1', 'Player2']);
      const gameState = gameStateManager.initializeGame(gameId, players);
      
      expect(gameState).toBeDefined();
      expect(gameState.id).toBe(gameId);
      expect(gameState.gameId).toBe(gameId);
      expect(gameState.status).toBe('waiting');
      expect(gameState.players).toHaveLength(2);
      expect(gameState.players[0].name).toBe('Player1');
      expect(gameState.players[1].name).toBe('Player2');
    });

    it('should assign different guild types to players', () => {
      const players = createTestPlayers(['Player1', 'Player2', 'Player3', 'Player4']);
      const gameState = gameStateManager.initializeGame(gameId, players);
      
      const guildTypes = gameState.players.map(p => p.guildType);
      const uniqueGuildTypes = new Set(guildTypes);
      
      expect(uniqueGuildTypes.size).toBe(4); // Todos diferentes
      expect(guildTypes).toContain('steel');
      expect(guildTypes).toContain('arcane');
      expect(guildTypes).toContain('green');
      expect(guildTypes).toContain('golden');
    });

    it('should initialize players with correct resources', () => {
      const players = createTestPlayers(['Player1', 'Player2']);
      const gameState = gameStateManager.initializeGame(gameId, players);
      
      gameState.players.forEach(player => {
        expect(player.resources).toBeDefined();
        expect(player.resources.silver).toBe(100);
        expect(player.resources.stone).toBe(50);
        expect(player.resources.wood).toBe(50);
        expect(player.resources.fiber).toBe(50);
        expect(player.resources.ore).toBe(50);
      });
    });

    it('should initialize players with 4 pieces each', () => {
      const players = createTestPlayers(['Player1', 'Player2']);
      const gameState = gameStateManager.initializeGame(gameId, players);
      
      gameState.players.forEach(player => {
        expect(player.pieces).toHaveLength(4);
        player.pieces.forEach(piece => {
          expect(piece.id).toBeDefined();
          expect(piece.status).toBe('home');
          expect(piece.position.zone).toBe('home');
          expect(piece.level).toBe(1);
          expect(piece.experience).toBe(0);
        });
      });
    });

    it('should start game and set current turn', () => {
      const players = createTestPlayers(['Player1', 'Player2']);
      const gameState = gameStateManager.initializeGame(gameId, players);
      
      const result = gameStateManager.startGame(gameState);
      
      expect(result.success).toBe(true);
      expect(gameState.status).toBe('active');
      expect(gameState.currentTurn.playerId).toBeDefined();
      expect(gameState.currentTurn.phase).toBe('roll');
      expect(gameState.currentTurn.timeRemaining).toBe(15000); // El sistema usa 15000ms por defecto
    });

    it('should handle player disconnection', () => {
      const players = createTestPlayers(['Player1', 'Player2']);
      const gameState = gameStateManager.initializeGame(gameId, players);
      
      const result = gameStateManager.handlePlayerDisconnection(gameState, gameState.players[0].id);
      
      expect(result.success).toBe(true);
      expect(gameState.players[0].isConnected).toBe(false);
    });

    it('should handle player reconnection', () => {
      const players = createTestPlayers(['Player1', 'Player2']);
      const gameState = gameStateManager.initializeGame(gameId, players);
      
      // Desconectar primero
      gameStateManager.handlePlayerDisconnection(gameState, gameState.players[0].id);
      expect(gameState.players[0].isConnected).toBe(false);
      
      // Reconectar
      const result = gameStateManager.handlePlayerReconnection(gameState, gameState.players[0].id);
      
      expect(result.success).toBe(true);
      expect(gameState.players[0].isConnected).toBe(true);
    });

    it('should check win conditions correctly', () => {
      const players = createTestPlayers(['Player1', 'Player2']);
      const gameState = gameStateManager.initializeGame(gameId, players);
      
      // Simular que el primer jugador ha ganado
      const player = gameState.players[0];
      player.pieces.forEach(piece => {
        piece.status = 'finished';
      });
      
      const result = gameStateManager.checkWinConditions(gameState);
      
      expect(result.hasWinner).toBe(true);
      expect(result.winner).toBeDefined();
      expect(result.winner?.id).toBe(player.id);
      expect(result.winner?.name).toBe(player.name);
      expect(result.result).toBeDefined();
      expect(result.result?.winnerId).toBe(player.id);
      expect(result.result?.winnerName).toBe(player.name);
    });

    it('should end game correctly', () => {
      const players = createTestPlayers(['Player1', 'Player2']);
      const gameState = gameStateManager.initializeGame(gameId, players);
      
      const mockResult = {
        success: true,
        gameState: gameState,
        winnerId: gameState.players[0].id,
        winnerName: gameState.players[0].name,
        winCondition: 'all_pieces_finished' as const,
        finalScores: [],
        gameStats: {}
      };
      
      const result = gameStateManager.endGame(gameState, mockResult);
      
      expect(result.success).toBe(true);
      expect(gameState.status).toBe('finished');
    });
  });

  describe('Game State Validation', () => {
    it('should have valid event log structure', () => {
      const players = createTestPlayers(['Player1', 'Player2']);
      const gameState = gameStateManager.initializeGame(gameId, players);
      
      expect(gameState.eventLog).toBeDefined();
      expect(Array.isArray(gameState.eventLog)).toBe(true);
    });

    it('should have valid timestamps', () => {
      const players = createTestPlayers(['Player1', 'Player2']);
      const gameState = gameStateManager.initializeGame(gameId, players);
      
      expect(gameState.createdAt).toBeInstanceOf(Date);
      expect(gameState.updatedAt).toBeInstanceOf(Date);
    });

    it('should have valid territories array', () => {
      const players = createTestPlayers(['Player1', 'Player2']);
      const gameState = gameStateManager.initializeGame(gameId, players);
      
      expect(gameState.territories).toBeDefined();
      expect(Array.isArray(gameState.territories)).toBe(true);
    });
  });
});