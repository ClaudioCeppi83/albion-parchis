import { Socket } from 'socket.io-client';
import { toast } from 'react-hot-toast';

export interface GameActions {
  createGame: (playerName: string, gameConfig?: any) => void;
  joinGame: (gameId: string, playerName: string) => void;
  authenticate: (playerId: string, gameId: string) => void;
  rollDice: () => void;
  movePiece: (pieceId: string, targetPosition: number) => void;
  sendChatMessage: (message: string) => void;
  requestGameState: () => void;
  leaveGame: () => void;
}

export const createGameActions = (socket: Socket | null): GameActions => {
  const emitWithValidation = (event: string, data?: any) => {
    if (!socket || !socket.connected) {
      toast.error('No hay conexión con el servidor');
      return false;
    }
    socket.emit(event, data);
    return true;
  };

  return {
    createGame: (playerName: string, gameConfig?: any) => {
      console.log('Creando juego:', { playerName, gameConfig });
      if (emitWithValidation('create_game', { playerName, gameConfig })) {
        toast.loading('Creando juego...');
      }
    },

    joinGame: (gameId: string, playerName: string) => {
      console.log('Uniéndose al juego:', { gameId, playerName });
      if (emitWithValidation('join_game', { gameId, playerName })) {
        toast.loading('Uniéndose al juego...');
      }
    },

    authenticate: (playerId: string, gameId: string) => {
      console.log('Autenticando:', { playerId, gameId });
      emitWithValidation('authenticate', { playerId, gameId });
    },

    rollDice: () => {
      console.log('Lanzando dado');
      if (emitWithValidation('player_action', { 
        type: 'roll_dice',
        timestamp: new Date().toISOString()
      })) {
        toast.loading('Lanzando dado...');
      }
    },

    movePiece: (pieceId: string, targetPosition: number) => {
      console.log('Moviendo pieza:', { pieceId, targetPosition });
      if (emitWithValidation('player_action', {
        type: 'move_piece',
        pieceId,
        targetPosition,
        timestamp: new Date().toISOString()
      })) {
        toast.loading('Moviendo pieza...');
      }
    },

    sendChatMessage: (message: string) => {
      console.log('Enviando mensaje:', message);
      if (message.trim()) {
        emitWithValidation('chat_message', { 
          message: message.trim(),
          timestamp: new Date().toISOString()
        });
      }
    },

    requestGameState: () => {
      console.log('Solicitando estado del juego');
      emitWithValidation('request_game_state');
    },

    leaveGame: () => {
      console.log('Abandonando juego');
      if (emitWithValidation('leave_game')) {
        toast('Abandonando juego...', { icon: 'ℹ️' });
      }
    }
  };
};