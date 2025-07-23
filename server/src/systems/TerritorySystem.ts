import { GameState, Player, Territory } from '../types/game';

/**
 * Sistema de territorios
 * Maneja la captura y control de territorios
 */
export class TerritorySystem {
  
  /**
   * Procesar reclamación de territorio
   */
  processTerritoryClaim(gameState: GameState, playerId: string, position: any): any {
    try {
      const player = gameState.players.find(p => p.id === playerId);
      if (!player) {
        return { success: false, error: 'Player not found' };
      }

      // Verificar si el territorio ya está ocupado
      const existingTerritory = this.getTerritoryAtPosition(gameState, position);
      if (existingTerritory && existingTerritory.ownerId !== playerId) {
        return { success: false, error: 'Territory already claimed by another player' };
      }

      // Crear o actualizar territorio
      const territory: Territory = {
        id: `territory_${position.x}_${position.y}`,
        position,
        ownerId: playerId,
        type: this.determineTerritoryType(position),
        level: existingTerritory ? existingTerritory.level : 1,
        resources: this.calculateTerritoryResources(position),
        defenseBonus: this.calculateDefenseBonus(position)
      };

      // Añadir territorio al estado del juego
      if (!gameState.territories) {
        gameState.territories = [];
      }

      const territoryIndex = gameState.territories.findIndex(t => t.id === territory.id);
      if (territoryIndex >= 0) {
        gameState.territories[territoryIndex] = territory;
      } else {
        gameState.territories.push(territory);
      }

      // Añadir territorio al jugador
      if (!player.territories) {
        player.territories = [];
      }
      
      if (!player.territories.includes(territory.id)) {
        player.territories.push(territory.id);
      }

      return {
        success: true,
        territory,
        message: existingTerritory ? 'Territory upgraded' : 'Territory claimed'
      };
    } catch (error) {
      return {
        success: false,
        error: `Territory claim failed: ${error}`
      };
    }
  }

  /**
   * Obtener territorio en una posición
   */
  private getTerritoryAtPosition(gameState: GameState, position: any): Territory | undefined {
    if (!gameState.territories) return undefined;
    
    return gameState.territories.find(t => 
      t.position.x === position.x && t.position.y === position.y
    );
  }

  /**
   * Determinar tipo de territorio según la posición
   */
  private determineTerritoryType(position: any): string {
    // Lógica simplificada - en el futuro se basará en el mapa
    const types = ['forest', 'mountain', 'plains', 'swamp'];
    return types[Math.floor(Math.random() * types.length)];
  }

  /**
   * Calcular recursos que genera el territorio
   */
  private calculateTerritoryResources(position: any): any {
    return {
      stone: Math.floor(Math.random() * 3) + 1,
      wood: Math.floor(Math.random() * 3) + 1,
      fiber: Math.floor(Math.random() * 2) + 1
    };
  }

  /**
   * Calcular bonificación defensiva del territorio
   */
  private calculateDefenseBonus(position: any): number {
    // Diferentes tipos de territorio dan diferentes bonificaciones
    return Math.floor(Math.random() * 3) + 1;
  }

  /**
   * Procesar generación de recursos de territorios
   */
  processResourceGeneration(gameState: GameState): void {
    if (!gameState.territories) return;

    for (const territory of gameState.territories) {
      const owner = gameState.players.find(p => p.id === territory.ownerId);
      if (!owner) continue;

      // Generar recursos según el territorio
      for (const [resourceType, amount] of Object.entries(territory.resources)) {
        const resourceAmount = typeof amount === 'number' ? amount : 0;
        owner.resources[resourceType as keyof typeof owner.resources] = 
          (owner.resources[resourceType as keyof typeof owner.resources] || 0) + resourceAmount;
      }
    }
  }

  /**
   * Obtener territorios de un jugador
   */
  getPlayerTerritories(gameState: GameState, playerId: string): Territory[] {
    if (!gameState.territories) return [];
    
    return gameState.territories.filter(t => t.ownerId === playerId);
  }

  /**
   * Calcular puntuación de territorios
   */
  calculateTerritoryScore(gameState: GameState, playerId: string): number {
    const territories = this.getPlayerTerritories(gameState, playerId);
    return territories.reduce((score, territory) => score + territory.level, 0);
  }

  /**
   * Inicializar territorios para un nuevo juego
   */
  initializeTerritories(): Territory[] {
    // Por ahora retornamos un array vacío
    // En el futuro se pueden pre-definir territorios especiales
    return [];
  }

  /**
   * Verificar si un jugador puede reclamar territorio
   */
  canClaimTerritory(gameState: GameState, playerId: string, position: any): boolean {
    const player = gameState.players.find(p => p.id === playerId);
    if (!player) return false;

    // Verificar si el jugador tiene una ficha en esa posición
    const hasPlayerPiece = player.pieces.some(piece => 
      piece.position.x === position.x && 
      piece.position.y === position.y &&
      piece.status === 'board'
    );

    return hasPlayerPiece;
  }
}