import { GameState, Player, PlayerResources, ResourceType } from '../types/game';

/**
 * Sistema de gestión de recursos
 * Maneja la recolección, gasto y intercambio de recursos
 */
export class ResourceManager {
  
  // Configuración de recursos por zona
  private readonly ZONE_RESOURCES = {
    yellow: { stone: 1, wood: 1, fiber: 1 },
    red: { stone: 2, wood: 2, fiber: 2, ore: 1 },
    black: { stone: 3, wood: 3, fiber: 3, ore: 2, silver: 1 },
    safe: {} // Las zonas seguras no dan recursos
  };

  // Costos de equipamiento básico
  private readonly EQUIPMENT_COSTS = {
    basic_sword: { stone: 10, wood: 5 },
    basic_armor: { fiber: 15, stone: 5 },
    basic_tool: { wood: 8, stone: 3 }
  };

  /**
   * Inicializar recursos de un jugador
   */
  initializePlayerResources(player: Player): void {
    player.resources = {
      stone: 10,    // Recursos iniciales
      wood: 10,
      fiber: 10,
      ore: 0,
      silver: 0
    };
  }

  /**
   * Recolectar recursos cuando una ficha se mueve a una nueva zona
   */
  collectResources(gameState: GameState, playerId: string, zoneType: string): { success: boolean; resources?: PlayerResources; error?: string } {
    try {
      const player = gameState.players.find(p => p.id === playerId);
      if (!player) {
        return {
          success: false,
          error: 'Player not found'
        };
      }

      // Obtener recursos de la zona
      const zoneResources = this.ZONE_RESOURCES[zoneType as keyof typeof this.ZONE_RESOURCES];
      if (!zoneResources || Object.keys(zoneResources).length === 0) {
        return {
          success: true,
          resources: player.resources
        };
      }

      // Aplicar multiplicador por nivel de ficha (implementación futura)
      const multiplier = 1; // Por ahora, multiplicador base

      // Agregar recursos al jugador
      for (const [resourceType, amount] of Object.entries(zoneResources)) {
        const finalAmount = amount * multiplier;
        player.resources[resourceType as ResourceType] = 
          (player.resources[resourceType as ResourceType] || 0) + finalAmount;
      }

      return {
        success: true,
        resources: player.resources
      };
    } catch (error) {
      return {
        success: false,
        error: `Error collecting resources: ${error}`
      };
    }
  }

  /**
   * Gastar recursos para comprar equipamiento
   */
  spendResources(gameState: GameState, playerId: string, cost: PlayerResources): { success: boolean; remainingResources?: PlayerResources; error?: string } {
    try {
      const player = gameState.players.find(p => p.id === playerId);
      if (!player) {
        return {
          success: false,
          error: 'Player not found'
        };
      }

      // Verificar que el jugador tiene suficientes recursos
      const canAfford = this.canAffordCost(player.resources, cost);
      if (!canAfford.success) {
        return canAfford;
      }

      // Gastar los recursos
      for (const [resourceType, amount] of Object.entries(cost)) {
        if (amount > 0) {
          player.resources[resourceType as ResourceType] -= amount;
        }
      }

      return {
        success: true,
        remainingResources: player.resources
      };
    } catch (error) {
      return {
        success: false,
        error: `Error spending resources: ${error}`
      };
    }
  }

  /**
   * Verificar si un jugador puede pagar un costo
   */
  canAffordCost(playerResources: PlayerResources, cost: PlayerResources): { success: boolean; error?: string } {
    for (const [resourceType, amount] of Object.entries(cost)) {
      const playerAmount = playerResources[resourceType as ResourceType] || 0;
      if (playerAmount < amount) {
        return {
          success: false,
          error: `Insufficient ${resourceType}: has ${playerAmount}, needs ${amount}`
        };
      }
    }

    return { success: true };
  }

  /**
   * Procesar intercambio de recursos entre jugadores
   */
  processResourceTrade(
    gameState: GameState, 
    fromPlayerId: string, 
    toPlayerId: string, 
    offer: PlayerResources, 
    request: PlayerResources
  ): { success: boolean; gameState?: GameState; error?: string } {
    try {
      const fromPlayer = gameState.players.find(p => p.id === fromPlayerId);
      const toPlayer = gameState.players.find(p => p.id === toPlayerId);

      if (!fromPlayer || !toPlayer) {
        return {
          success: false,
          error: 'One or both players not found'
        };
      }

      // Verificar que ambos jugadores pueden hacer el intercambio
      const fromCanAfford = this.canAffordCost(fromPlayer.resources, offer);
      const toCanAfford = this.canAffordCost(toPlayer.resources, request);

      if (!fromCanAfford.success) {
        return {
          success: false,
          error: `Offering player: ${fromCanAfford.error}`
        };
      }

      if (!toCanAfford.success) {
        return {
          success: false,
          error: `Requesting player: ${toCanAfford.error}`
        };
      }

      // Realizar el intercambio
      // Jugador que ofrece pierde 'offer' y gana 'request'
      for (const [resourceType, amount] of Object.entries(offer)) {
        if (amount > 0) {
          fromPlayer.resources[resourceType as ResourceType] -= amount;
          toPlayer.resources[resourceType as ResourceType] = 
            (toPlayer.resources[resourceType as ResourceType] || 0) + amount;
        }
      }

      // Jugador que recibe pierde 'request' y gana 'offer'
      for (const [resourceType, amount] of Object.entries(request)) {
        if (amount > 0) {
          toPlayer.resources[resourceType as ResourceType] -= amount;
          fromPlayer.resources[resourceType as ResourceType] = 
            (fromPlayer.resources[resourceType as ResourceType] || 0) + amount;
        }
      }

      gameState.updatedAt = new Date();

      return {
        success: true,
        gameState
      };
    } catch (error) {
      return {
        success: false,
        error: `Error processing trade: ${error}`
      };
    }
  }

  /**
   * Obtener costo de equipamiento
   */
  getEquipmentCost(equipmentType: string): PlayerResources | null {
    const cost = this.EQUIPMENT_COSTS[equipmentType as keyof typeof this.EQUIPMENT_COSTS];
    if (!cost) return null;
    
    // Ensure all required PlayerResources properties are present
    return {
      stone: cost.stone || 0,
      wood: (cost as any).wood || 0,
      fiber: (cost as any).fiber || 0,
      ore: (cost as any).ore || 0,
      silver: (cost as any).silver || 0
    };
  }

  /**
   * Calcular valor total de recursos de un jugador
   */
  calculateResourceValue(resources: PlayerResources): number {
    // Valores relativos de los recursos (para IA y balanceo)
    const resourceValues = {
      stone: 1,
      wood: 1,
      fiber: 1,
      ore: 3,
      silver: 10
    };

    let totalValue = 0;
    for (const [resourceType, amount] of Object.entries(resources)) {
      const value = resourceValues[resourceType as ResourceType] || 0;
      totalValue += amount * value;
    }

    return totalValue;
  }

  /**
   * Generar recursos aleatorios para eventos especiales
   */
  generateRandomResources(tier: 'basic' | 'advanced' | 'premium'): PlayerResources {
    const baseAmounts = {
      basic: { min: 1, max: 3 },
      advanced: { min: 2, max: 5 },
      premium: { min: 3, max: 8 }
    };

    const amounts = baseAmounts[tier];
    const resources: PlayerResources = {
      stone: 0,
      wood: 0,
      fiber: 0,
      ore: 0,
      silver: 0
    };

    // Generar cantidades aleatorias
    resources.stone = Math.floor(Math.random() * (amounts.max - amounts.min + 1)) + amounts.min;
    resources.wood = Math.floor(Math.random() * (amounts.max - amounts.min + 1)) + amounts.min;
    resources.fiber = Math.floor(Math.random() * (amounts.max - amounts.min + 1)) + amounts.min;

    // Recursos más raros tienen menor probabilidad
    if (tier !== 'basic') {
      resources.ore = Math.floor(Math.random() * (amounts.max - amounts.min + 1)) + amounts.min;
    }

    if (tier === 'premium') {
      resources.silver = Math.floor(Math.random() * (amounts.max - amounts.min + 1)) + amounts.min;
    }

    return resources;
  }

  /**
   * Obtener información de recursos por zona
   */
  getZoneResourceInfo(): any {
    return {
      zoneResources: this.ZONE_RESOURCES,
      equipmentCosts: this.EQUIPMENT_COSTS
    };
  }

  /**
   * Aplicar bonificación de recursos por gremio
   */
  applyGuildBonus(resources: PlayerResources, guildType: string): PlayerResources {
    // Bonificaciones por gremio (implementación futura)
    const guildBonuses = {
      steel: { stone: 1.2 },      // +20% stone
      arcane: { silver: 1.5 },    // +50% silver
      green: { wood: 1.2, fiber: 1.2 }, // +20% wood y fiber
      golden: { ore: 1.3 }        // +30% ore
    };

    const bonus = guildBonuses[guildType as keyof typeof guildBonuses];
    if (!bonus) return resources;

    const bonusResources = { ...resources };
    for (const [resourceType, multiplier] of Object.entries(bonus)) {
      const currentAmount = bonusResources[resourceType as ResourceType] || 0;
      bonusResources[resourceType as ResourceType] = Math.floor(currentAmount * multiplier);
    }

    return bonusResources;
  }

  /**
   * Verificar límites de recursos
   */
  enforceResourceLimits(resources: PlayerResources): PlayerResources {
    // Límites máximos por tipo de recurso
    const limits = {
      stone: 999,
      wood: 999,
      fiber: 999,
      ore: 99,
      silver: 50
    };

    const limitedResources = { ...resources };
    for (const [resourceType, limit] of Object.entries(limits)) {
      const current = limitedResources[resourceType as ResourceType] || 0;
      if (current > limit) {
        limitedResources[resourceType as ResourceType] = limit;
      }
    }

    return limitedResources;
  }
}