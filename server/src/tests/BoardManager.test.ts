import { describe, it, expect, beforeEach } from '@jest/globals';
import { BoardManager } from '../core/BoardManager';
import { GuildType, GameState, Player, BoardPosition } from '../types/game';

describe('BoardManager', () => {
  let boardManager: BoardManager;
  let gameState: GameState;

  beforeEach(() => {
    boardManager = new BoardManager();
    gameState = {
      gameId: 'test-game',
      status: 'playing',
      players: [
        {
          id: 'player-1',
          name: 'Player 1',
          guildType: 'steel',
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
          isConnected: true
        },
        {
          id: 'player-2',
          name: 'Player 2',
          guildType: 'arcane',
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
          isConnected: true
        }
      ],
      currentTurn: {
        playerId: 'player-1',
        phase: 'roll',
        timeRemaining: 30
      },
      territories: [],
      eventLog: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
  });

  describe('Initialization', () => {
    it('should initialize pieces for all players', () => {
      boardManager.initializePieces(gameState);
      
      expect(gameState.players[0].pieces).toHaveLength(4);
      expect(gameState.players[1].pieces).toHaveLength(4);
      
      // Verificar que las fichas tienen IDs únicos
      const allPieceIds = gameState.players.flatMap(p => p.pieces.map(piece => piece.id));
      const uniqueIds = new Set(allPieceIds);
      expect(uniqueIds.size).toBe(allPieceIds.length);
    });

    it('should assign correct guild types to players', () => {
      boardManager.initializePieces(gameState);
      
      expect(gameState.players[0].guildType).toBe('steel');
      expect(gameState.players[1].guildType).toBe('arcane');
    });

    it('should initialize pieces in home status', () => {
      boardManager.initializePieces(gameState);
      
      gameState.players.forEach(player => {
        player.pieces.forEach(piece => {
          expect(piece.status).toBe('home');
          expect(piece.level).toBe(1);
          expect(piece.experience).toBe(0);
        });
      });
    });
  });

  describe('Available Moves', () => {
    beforeEach(() => {
      boardManager.initializePieces(gameState);
    });

    it('should allow piece to exit home with dice roll of 5 or 6', () => {
      const moves = boardManager.getAvailableMoves(gameState, 'player-1', 6);
      expect(moves.length).toBeGreaterThan(0);
    });

    it('should not allow piece to exit home with dice roll less than 5', () => {
      const moves = boardManager.getAvailableMoves(gameState, 'player-1', 3);
      expect(moves).toHaveLength(0);
    });

    it('should return empty array for non-existent player', () => {
      const moves = boardManager.getAvailableMoves(gameState, 'non-existent', 6);
      expect(moves).toHaveLength(0);
    });
  });

  describe('Piece Movement', () => {
    beforeEach(() => {
      boardManager.initializePieces(gameState);
    });

    it('should successfully move a piece', () => {
      const player = gameState.players[0];
      const piece = player.pieces[0];
      const targetPosition: BoardPosition = { x: 0, y: 0, zone: 'safe' };
      
      const result = boardManager.movePiece(gameState, {
        pieceId: piece.id,
        targetPosition
      });
      
      expect(result.success).toBe(true);
      expect(piece.position.x).toBe(0);
      expect(piece.position.y).toBe(0);
    });

    it('should return error for non-existent piece', () => {
      const result = boardManager.movePiece(gameState, {
        pieceId: 'non-existent-piece',
        targetPosition: { x: 0, y: 0, zone: 'safe' }
      });
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Piece not found');
    });

    it('should update piece status when moved from home', () => {
      const player = gameState.players[0];
      const piece = player.pieces[0];
      const targetPosition: BoardPosition = { x: 0, y: 0, zone: 'yellow' };
      
      expect(piece.status).toBe('home');
      
      boardManager.movePiece(gameState, {
        pieceId: piece.id,
        targetPosition
      });
      
      expect(piece.status).toBe('board');
    });
  });

  describe('Board Information', () => {
    it('should return board configuration', () => {
      const boardInfo = boardManager.getBoardInfo();
      
      expect(boardInfo).toHaveProperty('size');
      expect(boardInfo).toHaveProperty('safePositions');
      expect(boardInfo).toHaveProperty('homePositions');
      expect(boardInfo).toHaveProperty('finishPositions');
      
      expect(boardInfo.size).toBe(15);
      expect(Array.isArray(boardInfo.safePositions)).toBe(true);
    });
  });
});