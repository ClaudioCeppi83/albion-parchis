import { GameState, Player, TradeOffer } from '../types/game';

/**
 * Sistema de comercio
 * Maneja las ofertas e intercambios entre jugadores
 */
export class TradingSystem {
  
  /**
   * Crear oferta de intercambio
   */
  createTradeOffer(gameState: GameState, fromPlayerId: string, toPlayerId: string, offer: any): any {
    try {
      const fromPlayer = gameState.players.find(p => p.id === fromPlayerId);
      const toPlayer = gameState.players.find(p => p.id === toPlayerId);

      if (!fromPlayer || !toPlayer) {
        return { success: false, error: 'Player not found' };
      }

      // Verificar que el jugador tiene los recursos ofrecidos
      if (!this.hasResources(fromPlayer, offer.giving)) {
        return { success: false, error: 'Insufficient resources to offer' };
      }

      // Crear oferta de intercambio
      const tradeOffer: TradeOffer = {
        id: `trade_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        fromPlayerId,
        toPlayerId,
        offering: offer.giving,
        requesting: offer.requesting,
        status: 'pending',
        createdAt: Date.now(),
        expiresAt: Date.now() + (5 * 60 * 1000) // 5 minutos
      };

      // Añadir al estado del juego
      if (!gameState.tradeOffers) {
        gameState.tradeOffers = [];
      }
      gameState.tradeOffers.push(tradeOffer);

      return {
        success: true,
        tradeOffer,
        message: 'Trade offer created'
      };
    } catch (error) {
      return {
        success: false,
        error: `Trade offer creation failed: ${error}`
      };
    }
  }

  /**
   * Aceptar oferta de intercambio
   */
  acceptTradeOffer(gameState: GameState, tradeOfferId: string, playerId: string): any {
    try {
      const tradeOffer = this.getTradeOffer(gameState, tradeOfferId);
      if (!tradeOffer) {
        return { success: false, error: 'Trade offer not found' };
      }

      if (tradeOffer.toPlayerId !== playerId) {
        return { success: false, error: 'Not authorized to accept this trade' };
      }

      if (tradeOffer.status !== 'pending') {
        return { success: false, error: 'Trade offer is no longer available' };
      }

      if (Date.now() > tradeOffer.expiresAt) {
        tradeOffer.status = 'expired';
        return { success: false, error: 'Trade offer has expired' };
      }

      const fromPlayer = gameState.players.find(p => p.id === tradeOffer.fromPlayerId);
      const toPlayer = gameState.players.find(p => p.id === tradeOffer.toPlayerId);

      if (!fromPlayer || !toPlayer) {
        return { success: false, error: 'Player not found' };
      }

      // Verificar recursos
      if (!this.hasResources(fromPlayer, tradeOffer.offering)) {
        tradeOffer.status = 'cancelled';
        return { success: false, error: 'Offering player no longer has required resources' };
      }

      if (!this.hasResources(toPlayer, tradeOffer.requesting)) {
        return { success: false, error: 'You do not have the requested resources' };
      }

      // Ejecutar intercambio
      this.executeTradeExchange(fromPlayer, toPlayer, tradeOffer);
      tradeOffer.status = 'completed';

      return {
        success: true,
        message: 'Trade completed successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: `Trade acceptance failed: ${error}`
      };
    }
  }

  /**
   * Rechazar oferta de intercambio
   */
  rejectTradeOffer(gameState: GameState, tradeOfferId: string, playerId: string): any {
    const tradeOffer = this.getTradeOffer(gameState, tradeOfferId);
    if (!tradeOffer) {
      return { success: false, error: 'Trade offer not found' };
    }

    if (tradeOffer.toPlayerId !== playerId) {
      return { success: false, error: 'Not authorized to reject this trade' };
    }

    tradeOffer.status = 'rejected';
    return {
      success: true,
      message: 'Trade offer rejected'
    };
  }

  /**
   * Obtener oferta de intercambio
   */
  private getTradeOffer(gameState: GameState, tradeOfferId: string): TradeOffer | undefined {
    if (!gameState.tradeOffers) return undefined;
    return gameState.tradeOffers.find(offer => offer.id === tradeOfferId);
  }

  /**
   * Verificar si el jugador tiene los recursos necesarios
   */
  private hasResources(player: Player, resources: any): boolean {
    if (!resources) return true;

    for (const [resourceType, amount] of Object.entries(resources)) {
      const playerAmount = player.resources[resourceType as keyof typeof player.resources] || 0;
      if (playerAmount < (amount as number)) {
        return false;
      }
    }
    return true;
  }

  /**
   * Ejecutar el intercambio de recursos
   */
  private executeTradeExchange(fromPlayer: Player, toPlayer: Player, tradeOffer: TradeOffer): void {
    // Transferir recursos del jugador que ofrece al que acepta
    for (const [resourceType, amount] of Object.entries(tradeOffer.offering)) {
      fromPlayer.resources[resourceType as keyof typeof fromPlayer.resources] -= amount as number;
      toPlayer.resources[resourceType as keyof typeof toPlayer.resources] = 
        (toPlayer.resources[resourceType as keyof typeof toPlayer.resources] || 0) + (amount as number);
    }

    // Transferir recursos del jugador que acepta al que ofrece
    for (const [resourceType, amount] of Object.entries(tradeOffer.requesting)) {
      toPlayer.resources[resourceType as keyof typeof toPlayer.resources] -= amount as number;
      fromPlayer.resources[resourceType as keyof typeof fromPlayer.resources] = 
        (fromPlayer.resources[resourceType as keyof typeof fromPlayer.resources] || 0) + (amount as number);
    }
  }

  /**
   * Limpiar ofertas expiradas
   */
  cleanupExpiredOffers(gameState: GameState): void {
    if (!gameState.tradeOffers) return;

    const now = Date.now();
    gameState.tradeOffers.forEach(offer => {
      if (offer.status === 'pending' && now > offer.expiresAt) {
        offer.status = 'expired';
      }
    });

    // Remover ofertas muy antiguas
    gameState.tradeOffers = gameState.tradeOffers.filter(offer => 
      now - offer.createdAt < (24 * 60 * 60 * 1000) // 24 horas
    );
  }

  /**
   * Obtener ofertas pendientes para un jugador
   */
  getPendingOffersForPlayer(gameState: GameState, playerId: string): TradeOffer[] {
    if (!gameState.tradeOffers) return [];

    return gameState.tradeOffers.filter(offer => 
      offer.toPlayerId === playerId && 
      offer.status === 'pending' &&
      Date.now() <= offer.expiresAt
    );
  }

  /**
   * Obtener ofertas enviadas por un jugador
   */
  getSentOffersByPlayer(gameState: GameState, playerId: string): TradeOffer[] {
    if (!gameState.tradeOffers) return [];

    return gameState.tradeOffers.filter(offer => 
      offer.fromPlayerId === playerId
    );
  }
}