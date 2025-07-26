import { GameState, Player, Piece } from '../types/game';

/**
 * Sistema de combate
 * Maneja los encuentros y combates entre fichas
 */
export class CombatSystem {
  
  /**
   * Procesar combate entre dos fichas
   */
  processCombat(gameState: GameState, attackerId: string, defenderId: string, attackerPiece: Piece, defenderPiece: Piece): any {
    try {
      // Calcular poder de combate
      const attackerPower = this.calculateCombatPower(attackerPiece);
      const defenderPower = this.calculateCombatPower(defenderPiece);

      // Añadir factor aleatorio
      const attackerRoll = Math.floor(Math.random() * 6) + 1;
      const defenderRoll = Math.floor(Math.random() * 6) + 1;

      const attackerTotal = attackerPower + attackerRoll;
      const defenderTotal = defenderPower + defenderRoll;

      // Determinar ganador
      const attackerWins = attackerTotal > defenderTotal;
      
      // Procesar resultado
      const result = {
        success: true,
        winner: attackerWins ? attackerId : defenderId,
        loser: attackerWins ? defenderId : attackerId,
        attackerRoll,
        defenderRoll,
        attackerTotal,
        defenderTotal,
        experience: this.calculateExperienceGain(attackerWins, attackerPiece, defenderPiece)
      };

      // Aplicar consecuencias
      this.applyCombatResult(gameState, result, attackerPiece, defenderPiece);

      return result;
    } catch (error) {
      return {
        success: false,
        error: `Combat processing failed: ${error}`
      };
    }
  }

  /**
   * Calcular poder de combate de una ficha
   */
  private calculateCombatPower(piece: Piece): number {
    let basePower = piece.level * 2;
    
    // Bonificaciones por equipamiento
    if (piece.equipment.weapon) {
      basePower += 2;
    }
    if (piece.equipment.armor) {
      basePower += 1;
    }

    return basePower;
  }

  /**
   * Calcular ganancia de experiencia
   */
  private calculateExperienceGain(won: boolean, attackerPiece: Piece, defenderPiece: Piece): number {
    const baseExp = won ? 10 : 5;
    const levelDifference = defenderPiece.level - attackerPiece.level;
    
    // Más experiencia por derrotar enemigos de mayor nivel
    return Math.max(1, baseExp + levelDifference);
  }

  /**
   * Aplicar resultado del combate
   */
  private applyCombatResult(gameState: GameState, result: any, attackerPiece: Piece, defenderPiece: Piece): void {
    // Añadir experiencia al ganador
    if (result.winner) {
      const winnerPiece = result.winner === 'attacker' ? attackerPiece : defenderPiece;
      winnerPiece.experience += result.experience;
      
      // Verificar subida de nivel
      this.checkLevelUp(winnerPiece);
    }

    // El perdedor retrocede o vuelve a casa (lógica simplificada)
    if (result.loser === 'defender') {
      defenderPiece.status = 'home';
      defenderPiece.position = { x: -1, y: -1, zone: 'safe' };
    }
  }

  /**
   * Verificar y procesar subida de nivel
   */
  private checkLevelUp(piece: Piece): boolean {
    const requiredExp = piece.level * 20; // 20 exp por nivel
    
    if (piece.experience >= requiredExp) {
      piece.level++;
      piece.experience -= requiredExp;
      return true;
    }
    
    return false;
  }

  /**
   * Verificar si puede ocurrir combate
   */
  canCombat(piece1: Piece, piece2: Piece): boolean {
    // No puede haber combate si alguna ficha está en casa o en zona segura
    if (piece1.status === 'home' || piece2.status === 'home') {
      return false;
    }
    
    if (piece1.status === 'safe' || piece2.status === 'safe') {
      return false;
    }

    return true;
  }

  /**
   * Obtener modificadores de combate por zona
   */
  private getZoneModifiers(position: any): number {
    // Diferentes zonas pueden dar bonificaciones/penalizaciones
    // Por ahora, implementación básica
    return 0;
  }
}