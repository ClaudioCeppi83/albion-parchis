import { GameState, Player, PlayerResources } from '../types/game';

/**
 * Sistema de recursos
 * Maneja la recolección y gestión de recursos
 */
export class ResourceSystem {
  
  /**
   * Procesar recolección de recursos
   */
  processResourceCollection(gameState: GameState, playerId: string, position: any): any {
    const player = gameState.players.find(p => p.id === playerId);
    if (!player) {
      return { success: false, error: 'Player not found' };
    }

    // Determinar recursos según la posición
    const resources = this.getResourcesAtPosition(position);
    
    // Añadir recursos al jugador
    for (const [resourceType, amount] of Object.entries(resources)) {
      if (typeof amount === 'number') {
        player.resources[resourceType as keyof PlayerResources] = 
          (player.resources[resourceType as keyof PlayerResources] || 0) + amount;
      }
    }

    return { success: true, resources };
  }

  /**
   * Obtener recursos disponibles en una posición
   */
  private getResourcesAtPosition(position: any): Partial<PlayerResources> {
    // Lógica simplificada - en el futuro se basará en el tipo de zona
    const baseResources = {
      stone: Math.floor(Math.random() * 3) + 1,
      wood: Math.floor(Math.random() * 3) + 1,
      fiber: Math.floor(Math.random() * 2) + 1
    };

    return baseResources;
  }

  /**
   * Verificar si el jugador tiene suficientes recursos
   */
  hasResources(player: Player, requiredResources: Partial<PlayerResources>): boolean {
    for (const [resourceType, amount] of Object.entries(requiredResources)) {
      if (typeof amount === 'number') {
        const playerAmount = player.resources[resourceType as keyof PlayerResources] || 0;
        if (playerAmount < amount) {
          return false;
        }
      }
    }
    return true;
  }

  /**
   * Consumir recursos del jugador
   */
  consumeResources(player: Player, resources: Partial<PlayerResources>): boolean {
    if (!this.hasResources(player, resources)) {
      return false;
    }

    for (const [resourceType, amount] of Object.entries(resources)) {
      if (typeof amount === 'number') {
        player.resources[resourceType as keyof PlayerResources] -= amount;
      }
    }

    return true;
  }
}