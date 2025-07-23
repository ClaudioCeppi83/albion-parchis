import { describe, it, expect, beforeEach } from '@jest/globals';
import { BoardManager } from '../core/BoardManager';
import { GuildType, Piece, BoardPosition } from '../types/game';

describe('BoardManager', () => {
  let boardManager: BoardManager;

  beforeEach(() => {
    boardManager = new BoardManager();
  });

  describe('Initialization', () => {
    it('should initialize with empty board', () => {
      const pieces = boardManager.getAllPieces();
      expect(pieces).toHaveLength(0);
    });

    it('should initialize player pieces correctly', () => {
      const playerId = 'player-1';
      boardManager.initializePlayerPieces(playerId, GuildType.STEEL);
      
      const pieces = boardManager.getPlayerPieces(playerId);
      expect(pieces).toHaveLength(4);
      
      pieces.forEach((piece, index) => {
        expect(piece.id).toBe(`${playerId}-piece-${index}`);
        expect(piece.playerId).toBe(playerId);
        expect(piece.guild).toBe(GuildType.STEEL);
        expect(piece.status).toBe('home');
        expect(piece.position.type).toBe('home');
      });
    });
  });

  describe('Piece Movement', () => {
    beforeEach(() => {
      boardManager.initializePlayerPieces('player-1', GuildType.STEEL);
    });

    it('should calculate available moves for piece in home', () => {
      const pieces = boardManager.getPlayerPieces('player-1');
      const piece = pieces[0];
      
      const moves = boardManager.getAvailableMoves(piece.id, 6);
      expect(moves).toHaveLength(1);
      expect(moves[0].type).toBe('start');
    });

    it('should not allow movement with insufficient dice roll from home', () => {
      const pieces = boardManager.getPlayerPieces('player-1');
      const piece = pieces[0];
      
      const moves = boardManager.getAvailableMoves(piece.id, 3);
      expect(moves).toHaveLength(0);
    });

    it('should move piece to start position with dice roll of 6', () => {
      const pieces = boardManager.getPlayerPieces('player-1');
      const piece = pieces[0];
      
      const newPosition: BoardPosition = { type: 'start', index: 0 };
      const result = boardManager.movePiece(piece.id, newPosition);
      
      expect(result.success).toBe(true);
      
      const updatedPiece = boardManager.getPiece(piece.id);
      expect(updatedPiece?.position.type).toBe('start');
      expect(updatedPiece?.status).toBe('active');
    });

    it('should calculate moves for piece on board', () => {
      const pieces = boardManager.getPlayerPieces('player-1');
      const piece = pieces[0];
      
      // Mover pieza al tablero primero
      const startPosition: BoardPosition = { type: 'start', index: 0 };
      boardManager.movePiece(piece.id, startPosition);
      
      // Calcular movimientos disponibles
      const moves = boardManager.getAvailableMoves(piece.id, 4);
      expect(moves.length).toBeGreaterThan(0);
    });
  });

  describe('Position Validation', () => {
    beforeEach(() => {
      boardManager.initializePlayerPieces('player-1', GuildType.STEEL);
    });

    it('should identify safe positions correctly', () => {
      const safePositions = [0, 8, 16, 24, 32, 40, 48, 56]; // Posiciones seguras típicas
      
      safePositions.forEach(index => {
        const position: BoardPosition = { type: 'board', index };
        expect(boardManager.isSafePosition(position)).toBe(true);
      });
    });

    it('should identify finish positions correctly', () => {
      const finishPosition: BoardPosition = { type: 'finish', index: 0 };
      expect(boardManager.isFinishPosition(finishPosition)).toBe(true);
      
      const boardPosition: BoardPosition = { type: 'board', index: 10 };
      expect(boardManager.isFinishPosition(boardPosition)).toBe(false);
    });
  });

  describe('Multiple Players', () => {
    it('should handle multiple players correctly', () => {
      boardManager.initializePlayerPieces('player-1', GuildType.STEEL);
      boardManager.initializePlayerPieces('player-2', GuildType.ARCANE);
      
      const allPieces = boardManager.getAllPieces();
      expect(allPieces).toHaveLength(8);
      
      const player1Pieces = boardManager.getPlayerPieces('player-1');
      const player2Pieces = boardManager.getPlayerPieces('player-2');
      
      expect(player1Pieces).toHaveLength(4);
      expect(player2Pieces).toHaveLength(4);
      
      // Verificar que las piezas tienen diferentes IDs
      const allIds = allPieces.map(p => p.id);
      const uniqueIds = new Set(allIds);
      expect(uniqueIds.size).toBe(allIds.length);
    });
  });
});