import { describe, it, expect, beforeEach } from '@jest/globals';
import { GameEngine } from '../core/GameEngine';
import { GameState, GuildType } from '../types/game';

describe('GameEngine', () => {
  let gameEngine: GameEngine;
  let gameId: string;
  let playerId: string;

  beforeEach(() => {
    gameEngine = new GameEngine();
    const result = gameEngine.createGame('TestPlayer');
    gameId = result.gameId!;
    playerId = result.playerId!;
  });

  describe('Game Creation', () => {
    it('should create a new game with correct initial state', () => {
      const gameState = gameEngine.getGameState(gameId);
      
      expect(gameState).toBeDefined();
      expect(gameState?.gameId).toBe(gameId);
      expect(gameState?.status).toBe('waiting');
      expect(gameState?.players).toHaveLength(1);
      expect(gameState?.players[0].name).toBe('TestPlayer');
    });

    it('should generate unique game IDs', () => {
      const result2 = gameEngine.createGame('TestPlayer2');
      expect(result2.gameId).not.toBe(gameId);
    });

    it('should return success and IDs when creating game', () => {
      const result = gameEngine.createGame('NewPlayer');
      expect(result.success).toBe(true);
      expect(result.gameId).toBeDefined();
      expect(result.playerId).toBeDefined();
    });
  });

  describe('Player Management', () => {
    it('should allow players to join the game', () => {
      const result = gameEngine.joinGame(gameId, 'Player2');
      
      expect(result.success).toBe(true);
      expect(result.playerId).toBeDefined();
      
      const gameState = gameEngine.getGameState(gameId);
      expect(gameState?.players).toHaveLength(2);
      expect(gameState?.players[1].name).toBe('Player2');
    });

    it('should not allow more than 4 players', () => {
      const gameId = gameEngine.createGame('Host').gameId!;
      
      // Agregar 3 jugadores más (total 4)
      gameEngine.joinGame(gameId, 'Player2');
      gameEngine.joinGame(gameId, 'Player3');
      gameEngine.joinGame(gameId, 'Player4'); // Esto debería iniciar automáticamente el juego
      
      // Intentar agregar un quinto jugador
      const result = gameEngine.joinGame(gameId, 'Player5');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Game already started'); // El juego ya se inició automáticamente
    });

    it('should not allow joining non-existent game', () => {
      const result = gameEngine.joinGame('non-existent-id', 'Player');
      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });
  });

  describe('Game State Management', () => {
    it('should return null for non-existent game', () => {
      const gameState = gameEngine.getGameState('non-existent-id');
      expect(gameState).toBeNull();
    });

    it('should remain in waiting state when 2 players join', () => {
      gameEngine.joinGame(gameId, 'Player2');
      
      const gameState = gameEngine.getGameState(gameId);
      expect(gameState?.status).toBe('waiting'); // Cambio: ahora permanece en waiting
      expect(gameState?.players).toHaveLength(2);
    });

    it('should maintain game state consistency', () => {
      gameEngine.joinGame(gameId, 'Player2');

      const gameState = gameEngine.getGameState(gameId);
      expect(gameState?.players).toHaveLength(2);
      expect(gameState?.status).toBe('waiting'); // Cambio: ahora permanece en waiting
      // Removemos la verificación de currentTurn ya que no existe en estado waiting
    });
  });

  describe('Game Statistics', () => {
    it('should return correct active games count', () => {
      const count = gameEngine.getActiveGamesCount();
      expect(count).toBe(1);
    });

    it('should return game statistics', () => {
      const stats = gameEngine.getGameStats();
      expect(stats).toHaveProperty('totalGames');
      expect(stats).toHaveProperty('totalPlayers');
      expect(stats).toHaveProperty('gamesByStatus');
      expect(stats.totalGames).toBe(1);
    });

    it('should return public games list', () => {
      const publicGames = gameEngine.getPublicGames();
      expect(Array.isArray(publicGames)).toBe(true);
    });
  });

  describe('Game Removal', () => {
    it('should remove game successfully', () => {
      const removed = gameEngine.removeGame(gameId);
      expect(removed).toBe(true);
      
      const gameState = gameEngine.getGameState(gameId);
      expect(gameState).toBeNull();
    });

    it('should return false when removing non-existent game', () => {
      const removed = gameEngine.removeGame('non-existent-id');
      expect(removed).toBe(false);
    });
  });
});