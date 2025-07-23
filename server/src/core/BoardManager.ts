import { GameState, BoardPosition, ZoneType, Piece, Player, GuildType, Point2D, Equipment } from '../types/game';
import { v4 as uuidv4 } from 'uuid';

/**
 * Gestor del tablero y posiciones
 * Maneja la lógica del tablero, movimientos y posiciones de las fichas
 */
export class BoardManager {
  // Configuración del tablero
  private readonly BOARD_SIZE = 15;
  private readonly SAFE_POSITIONS = [0, 8, 17, 25, 34, 42, 51, 59]; // Posiciones seguras
  private readonly HOME_POSITIONS = {
    steel: [1, 2, 3, 4],
    arcane: [18, 19, 20, 21],
    green: [35, 36, 37, 38],
    golden: [52, 53, 54, 55]
  };
  private readonly FINISH_POSITIONS = {
    steel: [60, 61, 62, 63],
    arcane: [64, 65, 66, 67],
    green: [68, 69, 70, 71],
    golden: [72, 73, 74, 75]
  };

  /**
   * Inicializar las fichas de todos los jugadores en sus posiciones de casa
   */
  initializePieces(gameState: GameState): void {
    gameState.players.forEach((player, playerIndex) => {
      const guildType = this.getGuildTypeByIndex(playerIndex);
      player.guildType = guildType;
      
      player.pieces = this.createPlayerPieces(player.id, guildType);
    });
  }

  /**
   * Crear las 4 fichas de un jugador
   */
  private createPlayerPieces(playerId: string, guildType: GuildType): Piece[] {
    const homePositions = this.HOME_POSITIONS[guildType];
    
    return homePositions.map((position, index) => ({
      id: `${playerId}_piece_${index}`,
      position: this.getPositionFromIndex(position),
      level: 1,
      experience: 0,
      equipment: {},
      status: 'home'
    }));
  }

  /**
   * Obtener tipo de gremio por índice de jugador
   */
  private getGuildTypeByIndex(index: number): GuildType {
    const guilds: GuildType[] = ['steel', 'arcane', 'green', 'golden'];
    return guilds[index % 4];
  }

  /**
   * Convertir índice lineal a posición del tablero
   */
  private getPositionFromIndex(index: number): BoardPosition {
    // Mapeo simplificado para el MVP
    // En el futuro se implementará el mapeo isométrico completo
    const x = index % this.BOARD_SIZE;
    const y = Math.floor(index / this.BOARD_SIZE);
    
    return {
      x,
      y,
      zone: this.getZoneType(index)
    };
  }

  /**
   * Determinar el tipo de zona según la posición
   */
  private getZoneType(index: number): ZoneType {
    // Posiciones seguras (ciudades)
    if (this.SAFE_POSITIONS.includes(index)) {
      return 'safe';
    }
    
    // Posiciones de casa y meta
    const allHomePositions = Object.values(this.HOME_POSITIONS).flat();
    const allFinishPositions = Object.values(this.FINISH_POSITIONS).flat();
    
    if (allHomePositions.includes(index) || allFinishPositions.includes(index)) {
      return 'safe';
    }
    
    // Por ahora, todas las demás son zonas amarillas
    // En fases posteriores se implementarán zonas rojas y negras
    return 'yellow';
  }

  /**
   * Obtener movimientos disponibles para un jugador
   */
  getAvailableMoves(gameState: GameState, playerId: string, diceRoll: number): BoardPosition[] {
    const player = gameState.players.find(p => p.id === playerId);
    if (!player) return [];

    const availableMoves: BoardPosition[] = [];

    for (const piece of player.pieces) {
      if (piece.status === 'finished') continue;

      // Si la ficha está en casa, solo puede salir con 5 o 6
      if (piece.status === 'home') {
        if (diceRoll >= 5) {
          const startPosition = this.getStartPosition(player.guildType);
          if (this.isPositionAvailable(gameState, startPosition, playerId)) {
            availableMoves.push(startPosition);
          }
        }
        continue;
      }

      // Calcular nueva posición
      const newPosition = this.calculateNewPosition(piece.position, diceRoll, player.guildType);
      if (newPosition && this.isValidMove(gameState, piece, newPosition, playerId)) {
        availableMoves.push(newPosition);
      }
    }

    return availableMoves;
  }

  /**
   * Obtener posición de inicio para un gremio
   */
  private getStartPosition(guildType: GuildType): BoardPosition {
    const startIndices = {
      steel: 0,
      arcane: 17,
      green: 34,
      golden: 51
    };
    
    return this.getPositionFromIndex(startIndices[guildType]);
  }

  /**
   * Calcular nueva posición después del movimiento
   */
  private calculateNewPosition(currentPosition: Point2D, diceRoll: number, guildType: GuildType): BoardPosition | null {
    // Implementación simplificada para el MVP
    // En el futuro se implementará el recorrido completo del tablero
    
    // Convertir Point2D a BoardPosition para cálculos
    const currentBoardPos: BoardPosition = {
      x: currentPosition.x,
      y: currentPosition.y,
      zone: this.getZoneType(this.getIndexFromPosition({ x: currentPosition.x, y: currentPosition.y, zone: 'yellow' }))
    };
    
    const currentIndex = this.getIndexFromPosition(currentBoardPos);
    let newIndex = currentIndex + diceRoll;
    
    // Verificar si llega a la meta
    const finishPositions = this.FINISH_POSITIONS[guildType];
    if (newIndex >= finishPositions[0] && newIndex <= finishPositions[3]) {
      return this.getPositionFromIndex(newIndex);
    }
    
    // Wrap around del tablero (simplificado)
    if (newIndex >= 60) {
      newIndex = newIndex - 60;
    }
    
    return this.getPositionFromIndex(newIndex);
  }

  /**
   * Convertir posición a índice lineal
   */
  private getIndexFromPosition(position: BoardPosition): number {
    return position.y * this.BOARD_SIZE + position.x;
  }

  /**
   * Verificar si una posición está disponible
   */
  private isPositionAvailable(gameState: GameState, position: BoardPosition, playerId: string): boolean {
    // Verificar si hay otra ficha en esa posición
    for (const player of gameState.players) {
      if (player.id === playerId) continue;
      
      for (const piece of player.pieces) {
        if (piece.position.x === position.x && piece.position.y === position.y) {
          // En zonas seguras no se puede "comer"
          if (position.zone === 'safe') {
            return false;
          }
          // En otras zonas, se puede "comer" (implementar lógica de combate después)
          return true;
        }
      }
    }
    
    return true;
  }

  /**
   * Verificar si un movimiento es válido
   */
  private isValidMove(gameState: GameState, piece: Piece, newPosition: BoardPosition, playerId: string): boolean {
    // Verificar límites del tablero
    if (newPosition.x < 0 || newPosition.x >= this.BOARD_SIZE || 
        newPosition.y < 0 || newPosition.y >= this.BOARD_SIZE) {
      return false;
    }

    // Verificar disponibilidad de la posición
    return this.isPositionAvailable(gameState, newPosition, playerId);
  }

  /**
   * Mover una ficha
   */
  movePiece(gameState: GameState, moveData: { pieceId: string; targetPosition: BoardPosition }): { success: boolean; gameState?: GameState; error?: string } {
    try {
      const { pieceId, targetPosition } = moveData;
      
      // Encontrar la ficha
      let targetPiece: Piece | null = null;
      let targetPlayer: Player | null = null;
      
      for (const player of gameState.players) {
        const piece = player.pieces.find(p => p.id === pieceId);
        if (piece) {
          targetPiece = piece;
          targetPlayer = player;
          break;
        }
      }
      
      if (!targetPiece || !targetPlayer) {
        return {
          success: false,
          error: 'Piece not found'
        };
      }

      // Verificar si hay una ficha enemiga en la posición objetivo
      const enemyPiece = this.findPieceAtPosition(gameState, targetPosition, targetPlayer.id);
      if (enemyPiece && targetPosition.zone !== 'safe') {
        // "Comer" la ficha enemiga (enviarla a casa)
        enemyPiece.piece.status = 'home';
        const homePos = this.getHomePosition(enemyPiece.player.guildType, enemyPiece.piece);
        enemyPiece.piece.position = { x: homePos.x, y: homePos.y };
      }

      // Mover la ficha (convertir BoardPosition a Point2D)
      targetPiece.position = { x: targetPosition.x, y: targetPosition.y };
      
      // Actualizar estado de la ficha
      if (this.isFinishPosition(targetPosition, targetPlayer.guildType)) {
        targetPiece.status = 'finished';
      } else if (targetPiece.status === 'home') {
        targetPiece.status = 'board';
      }

      gameState.updatedAt = new Date();

      return {
        success: true,
        gameState
      };
    } catch (error) {
      return {
        success: false,
        error: `Error moving piece: ${error}`
      };
    }
  }

  /**
   * Encontrar ficha en una posición específica
   */
  private findPieceAtPosition(gameState: GameState, position: BoardPosition, excludePlayerId: string): { piece: Piece; player: Player } | null {
    for (const player of gameState.players) {
      if (player.id === excludePlayerId) continue;
      
      for (const piece of player.pieces) {
        if (piece.position.x === position.x && piece.position.y === position.y) {
          return { piece, player };
        }
      }
    }
    
    return null;
  }

  /**
   * Obtener posición de casa para una ficha
   */
  private getHomePosition(guildType: GuildType, piece: Piece): BoardPosition {
    const homePositions = this.HOME_POSITIONS[guildType];
    const pieceIndex = parseInt(piece.id.split('_').pop() || '0');
    return this.getPositionFromIndex(homePositions[pieceIndex]);
  }

  /**
   * Verificar si una posición es de meta
   */
  private isFinishPosition(position: BoardPosition, guildType: GuildType): boolean {
    const finishPositions = this.FINISH_POSITIONS[guildType];
    const positionIndex = this.getIndexFromPosition(position);
    return finishPositions.includes(positionIndex);
  }

  /**
   * Obtener información del tablero
   */
  getBoardInfo(): any {
    return {
      size: this.BOARD_SIZE,
      safePositions: this.SAFE_POSITIONS,
      homePositions: this.HOME_POSITIONS,
      finishPositions: this.FINISH_POSITIONS
    };
  }
}