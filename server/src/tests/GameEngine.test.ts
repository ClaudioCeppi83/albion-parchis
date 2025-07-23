import { describe, it, expect, beforeEach } from '@jest/globals';
import { GameEngine } from '../core/GameEngine';
import { GameState, GuildType } from '../types/game';

describe('GameEngine', () => {
  let gameEngine: GameEngine;
  let gameId: string;

  beforeEach(() => {
    gameEngine = new GameEngine();
    gameId = gameEngine.createGame('test-room', 4);
  });

  describe('Game Creation', () => {
    it('should create a new game with correct initial state', () => {
      const gameState = gameEngine.getGameState(gameId);
      
      expect(gameState).toBeDefined();
      expect(gameState?.id).toBe(gameId);
      expect(gameState?.status).toBe('waiting');
      expect(gameState?.players).toHaveLength(0);
      expect(gameState?.maxPlayers).toBe(4);
    });

    it('should generate unique game IDs', () => {
      const gameId2 = gameEngine.createGame('test-room-2', 4);
      expect(gameId2).not.toBe(gameId);
    });
  });

  describe('Player Management', () => {
    it('should allow players to join the game', () => {
      const playerId = 'player-1';
      const result = gameEngine.joinGame(gameId, playerId, 'TestPlayer', GuildType.STEEL);
      
      expect(result.success).toBe(true);
      
      const gameState = gameEngine.getGameState(gameId);
      expect(gameState?.players).toHaveLength(1);
      expect(gameState?.players[0].id).toBe(playerId);
      expect(gameState?.players[0].name).toBe('TestPlayer');
      expect(gameState?.players[0].guild).toBe(GuildType.STEEL);
    });

    it('should not allow more players than maxPlayers', () => {
      // Llenar el juego con jugadores
      for (let i = 0; i < 4; i++) {
        gameEngine.joinGame(gameId, `player-${i}`, `Player${i}`, GuildType.STEEL);
      }

      // Intentar agregar un quinto jugador
      const result = gameEngine.joinGame(gameId, 'player-5', 'Player5', GuildType.ARCANE);
      expect(result.success).toBe(false);
      expect(result.error).toContain('full');
    });

    it('should not allow duplicate player IDs', () => {
      gameEngine.joinGame(gameId, 'player-1', 'Player1', GuildType.STEEL);
      const result = gameEngine.joinGame(gameId, 'player-1', 'Player1Duplicate', GuildType.ARCANE);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('already');
    });
  });

  describe('Game Start', () => {
    it('should start game when minimum players are present', () => {
      // Agregar jugadores mínimos (2)
      gameEngine.joinGame(gameId, 'player-1', 'Player1', GuildType.STEEL);
      gameEngine.joinGame(gameId, 'player-2', 'Player2', GuildType.ARCANE);

      const result = gameEngine.startGame(gameId);
      expect(result.success).toBe(true);

      const gameState = gameEngine.getGameState(gameId);
      expect(gameState?.status).toBe('playing');
      expect(gameState?.currentTurn).toBeDefined();
    });

    it('should not start game with insufficient players', () => {
      gameEngine.joinGame(gameId, 'player-1', 'Player1', GuildType.STEEL);
      
      const result = gameEngine.startGame(gameId);
      expect(result.success).toBe(false);
      expect(result.error).toContain('minimum');
    });
  });

  describe('Game State Management', () => {
    it('should return null for non-existent game', () => {
      const gameState = gameEngine.getGameState('non-existent-id');
      expect(gameState).toBeNull();
    });

    it('should maintain game state consistency', () => {
      gameEngine.joinGame(gameId, 'player-1', 'Player1', GuildType.STEEL);
      gameEngine.joinGame(gameId, 'player-2', 'Player2', GuildType.ARCANE);
      gameEngine.startGame(gameId);

      const gameState = gameEngine.getGameState(gameId);
      expect(gameState?.players).toHaveLength(2);
      expect(gameState?.status).toBe('playing');
      expect(gameState?.currentTurn?.playerId).toBeDefined();
    });
  });
});