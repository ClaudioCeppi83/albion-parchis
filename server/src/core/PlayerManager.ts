import { Player, PlayerResources, Piece, GuildType } from '../types/game';
import { v4 as uuidv4 } from 'uuid';

/**
 * Gestor de jugadores
 * Maneja la creación y gestión de jugadores
 */
export class PlayerManager {
  
  /**
   * Crear un nuevo jugador
   */
  createPlayer(playerId: string, playerName: string): Player {
    const player: Player = {
      id: playerId,
      name: playerName,
      guildType: 'steel', // Se asignará después por BoardManager
      pieces: [], // Se inicializarán después por BoardManager
      resources: this.initializeResources(),
      level: 1,
      experience: 0,
      isConnected: true,
      territories: []
    };

    return player;
  }

  /**
   * Inicializar fichas del jugador
   */
  private initializePieces(): Piece[] {
    const pieces: Piece[] = [];
    
    for (let i = 0; i < 4; i++) {
      pieces.push({
        id: uuidv4(),
        position: { x: -1, y: -1 }, // En casa inicialmente
        status: 'home',
        level: 1,
        experience: 0,
        equipment: {}
      });
    }

    return pieces;
  }

  /**
   * Inicializar recursos del jugador
   */
  private initializeResources(): PlayerResources {
    return {
      stone: 10,
      wood: 10,
      fiber: 10,
      ore: 5,
      silver: 2
    };
  }

  /**
   * Añadir experiencia al jugador
   */
  addExperience(player: Player, amount: number): boolean {
    player.experience += amount;
    
    // Verificar si sube de nivel
    const requiredExp = this.getRequiredExperience(player.level);
    if (player.experience >= requiredExp) {
      player.level++;
      player.experience -= requiredExp;
      return true; // Subió de nivel
    }
    
    return false;
  }

  /**
   * Obtener experiencia requerida para el siguiente nivel
   */
  private getRequiredExperience(currentLevel: number): number {
    return currentLevel * 100; // 100 exp por nivel
  }

  /**
   * Verificar si el jugador puede realizar una acción
   */
  canPlayerAct(player: Player): boolean {
    return player.isConnected && player.level > 0;
  }

  /**
   * Obtener información pública del jugador
   */
  getPublicPlayerInfo(player: Player): Partial<Player> {
    return {
      id: player.id,
      name: player.name,
      guildType: player.guildType,
      level: player.level,
      isConnected: player.isConnected,
      territories: player.territories
    };
  }
}