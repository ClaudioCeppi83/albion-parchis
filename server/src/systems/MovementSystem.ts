import { GameState, Player, Piece, BoardPosition, GameEvent, PieceStatus, GuildType } from '../types/game';
import { BoardManager } from '../core/BoardManager';
import { v4 as uuidv4 } from 'uuid';

/**
 * Sistema de movimiento de fichas
 * Gestiona toda la lógica de movimiento, incluyendo reglas especiales
 */
export class MovementSystem {
  private boardManager: BoardManager;

  constructor() {
    this.boardManager = new BoardManager();
  }

  /**
   * Calcular todos los movimientos posibles para un jugador
   */
  calculateAvailableMoves(gameState: GameState, playerId: string, diceRoll: number): any[] {
    const player = gameState.players.find(p => p.id === playerId);
    if (!player) {
      throw new Error('Player not found');
    }

    const availableMoves: any[] = [];

    // Verificar cada ficha del jugador
    for (const piece of player.pieces) {
      const moves = this.calculatePieceMoves(gameState, piece, diceRoll, player.guildType, playerId);
      availableMoves.push(...moves);
    }

    return availableMoves;
  }

  /**
   * Calcular movimientos posibles para una ficha específica
   */
  private calculatePieceMoves(gameState: GameState, piece: Piece, diceRoll: number, guildType: GuildType, playerId?: string): any[] {
    const moves: any[] = [];

    switch (piece.status) {
      case 'home':
        // Ficha en casa: solo puede salir con 5 o 6
        if (diceRoll === 5 || diceRoll === 6) {
          const startPosition = this.boardManager.getStartPosition(guildType);
          const moveResult = this.validateMove(gameState, piece, startPosition, playerId);
          
          if (moveResult.isValid) {
            moves.push({
              pieceId: piece.id,
              fromPosition: piece.position,
              toPosition: startPosition,
              moveType: 'exit_home',
              consequences: moveResult.consequences
            });
          }
        }
        break;

      case 'board':
        // Ficha en el tablero: movimiento normal
        const newPosition = this.boardManager.calculateNewPosition(piece.position, diceRoll, guildType);
        
        if (newPosition) {
          const moveResult = this.validateMove(gameState, piece, newPosition, playerId);
          
          if (moveResult.isValid) {
            moves.push({
              pieceId: piece.id,
              fromPosition: piece.position,
              toPosition: newPosition,
              moveType: this.determineMoveType(piece.position, newPosition, guildType),
              consequences: moveResult.consequences
            });
          }
        }
        break;

      case 'finished':
        // Ficha terminada: no puede moverse
        break;
    }

    return moves;
  }

  /**
   * Validar si un movimiento es legal
   */
  private validateMove(gameState: GameState, piece: Piece, targetPosition: BoardPosition, playerId?: string): {
    isValid: boolean;
    consequences: any[];
    error?: string;
  } {
    const consequences: any[] = [];

    // Verificar si la posición está dentro del tablero
    if (!this.boardManager.isValidPosition(targetPosition)) {
      return { isValid: false, consequences: [], error: 'Invalid board position' };
    }

    // Verificar si hay una ficha en la posición objetivo
    const occupyingPiece = this.findPieceAtPosition(gameState, targetPosition, playerId);
    
    if (occupyingPiece) {
      // Verificar si es una ficha propia
      if (occupyingPiece.playerId === playerId) {
        return { isValid: false, consequences: [], error: 'Position occupied by own piece' };
      }

      // Verificar si es una zona segura
      const zoneType = this.boardManager.getZoneType(targetPosition);
      if (zoneType === 'safe') {
        return { isValid: false, consequences: [], error: 'Cannot capture in safe zone' };
      }

      // Ficha enemiga puede ser capturada
      consequences.push({
        type: 'capture',
        capturedPiece: occupyingPiece,
        capturedPosition: targetPosition
      });
    }

    return { isValid: true, consequences };
  }

  /**
   * Ejecutar un movimiento
   */
  executeMove(gameState: GameState, playerId: string, pieceId: string, targetPosition: BoardPosition): {
    success: boolean;
    error?: string;
    events: GameEvent[];
  } {
    const events: GameEvent[] = [];
    const player = gameState.players.find(p => p.id === playerId);
    
    if (!player) {
      return { success: false, error: 'Player not found', events };
    }

    const piece = player.pieces.find(p => p.id === pieceId);
    if (!piece) {
      return { success: false, error: 'Piece not found', events };
    }

    // Validar el movimiento
    const validation = this.validateMove(gameState, piece, targetPosition, playerId);
    if (!validation.isValid) {
      return { success: false, error: validation.error, events };
    }

    const originalPosition = { ...piece.position };

    // Ejecutar consecuencias del movimiento
    for (const consequence of validation.consequences) {
      switch (consequence.type) {
        case 'capture':
          this.executeCaptureConsequence(gameState, consequence, events);
          break;
      }
    }

    // Mover la ficha
    piece.position = targetPosition;
    
    // Actualizar estado de la ficha
    const newStatus = this.determinePieceStatus(targetPosition, player.guildType);
    piece.status = newStatus;

    // Registrar evento de movimiento
    events.push({
      id: uuidv4(),
      type: 'piece_moved',
      playerId,
      timestamp: new Date(),
      data: {
        pieceId,
        fromPosition: originalPosition,
        toPosition: targetPosition,
        newStatus,
        consequences: validation.consequences
      }
    });

    // Agregar eventos al log del juego
    gameState.eventLog.push(...events);
    gameState.updatedAt = new Date();

    return { success: true, events };
  }

  /**
   * Ejecutar consecuencia de captura
   */
  private executeCaptureConsequence(gameState: GameState, consequence: any, events: GameEvent[]): void {
    const capturedPiece = consequence.capturedPiece;
    const capturedPlayer = gameState.players.find(p => p.id === capturedPiece.playerId);
    
    if (capturedPlayer) {
      const piece = capturedPlayer.pieces.find(p => p.id === capturedPiece.id);
      if (piece) {
        // Enviar ficha capturada a casa
        piece.position = this.boardManager.getHomePosition(capturedPlayer.guildType, piece);
        piece.status = 'home';

        // Registrar evento de captura
        events.push({
          id: uuidv4(),
          type: 'piece_captured',
          playerId: capturedPiece.playerId,
          timestamp: new Date(),
          data: {
            pieceId: piece.id,
            capturedAt: consequence.capturedPosition,
            sentToHome: piece.position
          }
        });
      }
    }
  }

  /**
   * Determinar el tipo de movimiento
   */
  private determineMoveType(fromPosition: BoardPosition, toPosition: BoardPosition, guildType: GuildType): string {
    const fromZone = this.boardManager.getZoneType(fromPosition);
    const toZone = this.boardManager.getZoneType(toPosition);

    if (fromZone === 'home' && toZone === 'start') {
      return 'exit_home';
    }

    if (toZone === 'finish') {
      return 'enter_finish';
    }

    if (fromZone === 'normal' && toZone === 'safe') {
      return 'enter_safe';
    }

    if (fromZone === 'safe' && toZone === 'normal') {
      return 'exit_safe';
    }

    return 'normal';
  }

  /**
   * Determinar el estado de una ficha basado en su posición
   */
  private determinePieceStatus(position: BoardPosition, guildType: string): PieceStatus {
    const zoneType = this.boardManager.getZoneType(position);
    
    if (zoneType === 'finish') {
      return 'finished';
    }

    return 'board';
  }

  /**
   * Encontrar ficha en una posición específica
   */
  private findPieceAtPosition(gameState: GameState, position: BoardPosition, excludePlayerId?: string): any | null {
    for (const player of gameState.players) {
      if (excludePlayerId && player.id === excludePlayerId) {
        continue;
      }

      for (const piece of player.pieces) {
        if (piece.status === 'board' && 
            piece.position.x === position.x && 
            piece.position.y === position.y) {
          return {
            ...piece,
            playerId: player.id
          };
        }
      }
    }

    return null;
  }

  /**
   * Verificar si un jugador puede mover alguna ficha
   */
  canPlayerMove(gameState: GameState, playerId: string, diceRoll: number): boolean {
    const availableMoves = this.calculateAvailableMoves(gameState, playerId, diceRoll);
    return availableMoves.length > 0;
  }

  /**
   * Obtener estadísticas de movimiento para un jugador
   */
  getMovementStats(gameState: GameState, playerId: string): any {
    const player = gameState.players.find(p => p.id === playerId);
    if (!player) {
      return null;
    }

    const stats = {
      totalPieces: player.pieces.length,
      piecesAtHome: 0,
      piecesOnBoard: 0,
      piecesFinished: 0,
      piecesInSafeZones: 0
    };

    for (const piece of player.pieces) {
      switch (piece.status) {
        case 'home':
          stats.piecesAtHome++;
          break;
        case 'board':
          stats.piecesOnBoard++;
          const zoneType = this.boardManager.getZoneType(piece.position);
          if (zoneType === 'safe') {
            stats.piecesInSafeZones++;
          }
          break;
        case 'finished':
          stats.piecesFinished++;
          break;
      }
    }

    return stats;
  }

  /**
   * Verificar si un jugador ha ganado
   */
  hasPlayerWon(gameState: GameState, playerId: string): boolean {
    const player = gameState.players.find(p => p.id === playerId);
    if (!player) {
      return false;
    }

    return player.pieces.every(piece => piece.status === 'finished');
  }

  /**
   * Obtener la distancia restante para que una ficha llegue a la meta
   */
  getDistanceToFinish(gameState: GameState, playerId: string, piece: Piece): number {
    if (piece.status === 'finished') {
      return 0;
    }

    if (piece.status === 'home') {
      return -1; // Indica que la ficha no ha salido de casa
    }

    // Obtener el guildType del jugador
    const player = gameState.players.find(p => p.id === playerId);
    if (!player) {
      return -1;
    }

    // Calcular distancia basada en la posición actual y el recorrido del gremio
    // Esta es una implementación simplificada
    const finishPositions = this.boardManager.getBoardInfo().finishPositions[player.guildType];
    if (!finishPositions || finishPositions.length === 0) {
      return -1;
    }

    // Por ahora retornamos una estimación simple
    // En una implementación completa, calcularíamos la distancia real en el tablero
    return Math.abs(piece.position.x - finishPositions[0].x) + Math.abs(piece.position.y - finishPositions[0].y);
  }
}