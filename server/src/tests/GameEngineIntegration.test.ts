import { describe, it, expect } from '@jest/globals';
import { GameEngine } from '../core/GameEngine';

describe('GameEngine Integration Tests', () => {
  it('should create a game in waiting state with one player', () => {
    const gameEngine = new GameEngine();
    const result = gameEngine.createGame('Host');
    
    expect(result.success).toBe(true);
    expect(result.gameId).toBeDefined();
    expect(result.playerId).toBeDefined();
    
    const gameState = gameEngine.getGameState(result.gameId!);
    expect(gameState?.status).toBe('waiting');
    expect(gameState?.players.length).toBe(1);
  });

  it('should allow players to join and remain in waiting state', () => {
    const gameEngine = new GameEngine();
    const createResult = gameEngine.createGame('Host');
    const gameId = createResult.gameId!;
    
    // Unir segundo jugador
    const join2Result = gameEngine.joinGame(gameId, 'Player2');
    expect(join2Result.success).toBe(true);
    
    let gameState = gameEngine.getGameState(gameId);
    expect(gameState?.status).toBe('waiting'); // Debe permanecer en waiting
    expect(gameState?.players.length).toBe(2);
    
    // Unir tercer jugador
    const join3Result = gameEngine.joinGame(gameId, 'Player3');
    expect(join3Result.success).toBe(true);
    
    gameState = gameEngine.getGameState(gameId);
    expect(gameState?.status).toBe('waiting'); // Debe permanecer en waiting
    expect(gameState?.players.length).toBe(3);
  });

  it('should start game automatically when 4 players join', () => {
    const gameEngine = new GameEngine();
    const createResult = gameEngine.createGame('Host');
    const gameId = createResult.gameId!;
    
    // Unir jugadores 2, 3 y 4
    gameEngine.joinGame(gameId, 'Player2');
    gameEngine.joinGame(gameId, 'Player3');
    const join4Result = gameEngine.joinGame(gameId, 'Player4');
    
    expect(join4Result.success).toBe(true);
    
    const gameState = gameEngine.getGameState(gameId);
    expect(gameState?.status).toBe('active'); // Debe iniciarse automáticamente
    expect(gameState?.players.length).toBe(4);
  });

  it('should not allow more than 4 players', () => {
    const gameEngine = new GameEngine();
    const createResult = gameEngine.createGame('Host');
    const gameId = createResult.gameId!;
    
    // Unir 4 jugadores (incluyendo el host)
    gameEngine.joinGame(gameId, 'Player2');
    gameEngine.joinGame(gameId, 'Player3');
    gameEngine.joinGame(gameId, 'Player4');
    
    // Intentar unir quinto jugador
    const join5Result = gameEngine.joinGame(gameId, 'Player5');
    expect(join5Result.success).toBe(false);
    expect(join5Result.error).toBe('Game already started');
  });

  it('should allow manual game start with 2+ players', () => {
    const gameEngine = new GameEngine();
    const createResult = gameEngine.createGame('Host');
    const gameId = createResult.gameId!;
    
    // Unir segundo jugador
    gameEngine.joinGame(gameId, 'Player2');
    
    let gameState = gameEngine.getGameState(gameId);
    expect(gameState?.status).toBe('waiting');
    
    // Iniciar manualmente
    const startResult = gameEngine.startGameManually(gameId);
    expect(startResult.success).toBe(true);
    
    gameState = gameEngine.getGameState(gameId);
    expect(gameState?.status).toBe('active');
  });

  it('should not allow manual start with less than 2 players', () => {
    const gameEngine = new GameEngine();
    const createResult = gameEngine.createGame('Host');
    const gameId = createResult.gameId!;
    
    // Intentar iniciar con solo 1 jugador
    const startResult = gameEngine.startGameManually(gameId);
    expect(startResult.success).toBe(false);
    expect(startResult.error).toBe('Need at least 2 players to start');
  });

  it('should handle player disconnections and reconnections', () => {
    const gameEngine = new GameEngine();
    const createResult = gameEngine.createGame('Host');
    const gameId = createResult.gameId!;
    const hostPlayerId = createResult.playerId!;
    
    // Unir segundo jugador e iniciar
    const join2Result = gameEngine.joinGame(gameId, 'Player2');
    const player2Id = join2Result.playerId!;
    gameEngine.startGameManually(gameId);
    
    // Desconectar jugador
    const disconnectResult = gameEngine.handlePlayerDisconnection(gameId, player2Id);
    expect(disconnectResult.success).toBe(true);
    
    // Reconectar jugador
    const reconnectResult = gameEngine.handlePlayerReconnection(gameId, player2Id);
    expect(reconnectResult.success).toBe(true);
  });

  it('should process dice roll actions', () => {
    const gameEngine = new GameEngine();
    const createResult = gameEngine.createGame('Host');
    const gameId = createResult.gameId!;
    const hostPlayerId = createResult.playerId!;
    
    // Unir segundo jugador e iniciar
    gameEngine.joinGame(gameId, 'Player2');
    gameEngine.startGameManually(gameId);
    
    // Procesar acción de tirar dados
    const actionResult = gameEngine.processPlayerAction(gameId, hostPlayerId, {
      type: 'roll_dice',
      playerId: hostPlayerId,
      data: {},
      timestamp: new Date()
    });
    
    expect(actionResult.success).toBe(true);
    expect(actionResult.gameState).toBeDefined();
  });
});