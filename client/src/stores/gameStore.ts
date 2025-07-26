import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// Tipos para el estado del juego
export interface Player {
  id: string;
  name: string;
  guild: 'steel' | 'arcane' | 'green' | 'golden';
  pieces: Piece[];
  isConnected: boolean;
  isCurrentTurn: boolean;
}

export interface Piece {
  id: string;
  playerId: string;
  position: number;
  isInHome: boolean;
  isInGoal: boolean;
  canMove: boolean;
}

export interface GameState {
  id: string;
  status: 'waiting' | 'playing' | 'finished';
  players: Player[];
  currentPlayerId: string | null;
  diceValue: number | null;
  canRollDice: boolean;
  winner: string | null;
  createdAt: Date;
  lastMove?: {
    playerId: string;
    pieceId: string;
    from: number;
    to: number;
    timestamp: Date;
  };
}

export interface ChatMessage {
  id: string;
  playerId: string;
  playerName: string;
  message: string;
  timestamp: Date;
}

export interface GameStore {
  // Estado de conexión
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'error';
  error: string | null;
  
  // Estado del juego
  gameState: GameState | null;
  currentPlayer: Player | null;
  
  // Chat
  chatMessages: ChatMessage[];
  
  // UI State
  selectedPiece: string | null;
  showDice: boolean;
  isRollingDice: boolean;
  
  // Acciones de conexión
  setConnectionStatus: (status: GameStore['connectionStatus']) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  
  // Acciones del juego
  setGameState: (gameState: GameState) => void;
  setCurrentPlayer: (player: Player | null) => void;
  updatePlayer: (playerId: string, updates: Partial<Player>) => void;
  
  // Acciones de chat
  addChatMessage: (message: ChatMessage) => void;
  clearChatMessages: () => void;
  
  // Acciones de UI
  setSelectedPiece: (pieceId: string | null) => void;
  setShowDice: (show: boolean) => void;
  setIsRollingDice: (rolling: boolean) => void;
  
  // Acciones de reset
  resetGame: () => void;
  resetAll: () => void;
}

export const useGameStore = create<GameStore>()(
  devtools(
    (set) => ({
      // Estado inicial
      connectionStatus: 'disconnected',
      error: null,
      gameState: null,
      currentPlayer: null,
      chatMessages: [],
      selectedPiece: null,
      showDice: false,
      isRollingDice: false,

      // Acciones de conexión
      setConnectionStatus: (status) =>
        set({ connectionStatus: status }, false, 'setConnectionStatus'),

      setError: (error) =>
        set({ error }, false, 'setError'),

      clearError: () =>
        set({ error: null }, false, 'clearError'),

      // Acciones del juego
      setGameState: (gameState) => {
        const currentPlayer = gameState.players.find(p => p.isCurrentTurn) || null;
        set({ 
          gameState, 
          currentPlayer,
          showDice: gameState.canRollDice && currentPlayer !== null
        }, false, 'setGameState');
      },

      setCurrentPlayer: (currentPlayer) =>
        set({ currentPlayer }, false, 'setCurrentPlayer'),

      updatePlayer: (playerId, updates) =>
        set((state) => {
          if (!state.gameState) return state;
          
          const updatedPlayers = state.gameState.players.map(player =>
            player.id === playerId ? { ...player, ...updates } : player
          );
          
          const updatedGameState = {
            ...state.gameState,
            players: updatedPlayers
          };
          
          const currentPlayer = updatedPlayers.find(p => p.isCurrentTurn) || null;
          
          return {
            gameState: updatedGameState,
            currentPlayer
          };
        }, false, 'updatePlayer'),

      // Acciones de chat
      addChatMessage: (message) =>
        set((state) => ({
          chatMessages: [...state.chatMessages, message]
        }), false, 'addChatMessage'),

      clearChatMessages: () =>
        set({ chatMessages: [] }, false, 'clearChatMessages'),

      // Acciones de UI
      setSelectedPiece: (pieceId) =>
        set({ selectedPiece: pieceId }, false, 'setSelectedPiece'),

      setShowDice: (show) =>
        set({ showDice: show }, false, 'setShowDice'),

      setIsRollingDice: (rolling) =>
        set({ isRollingDice: rolling }, false, 'setIsRollingDice'),

      // Acciones de reset
      resetGame: () =>
        set({
          gameState: null,
          currentPlayer: null,
          selectedPiece: null,
          showDice: false,
          isRollingDice: false
        }, false, 'resetGame'),

      resetAll: () =>
        set({
          connectionStatus: 'disconnected',
          error: null,
          gameState: null,
          currentPlayer: null,
          chatMessages: [],
          selectedPiece: null,
          showDice: false,
          isRollingDice: false
        }, false, 'resetAll'),
    }),
    {
      name: 'valdris-chronicles-game-store',
    }
  )
);