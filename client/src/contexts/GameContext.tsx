import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useSocket } from '../hooks/useSocket';
import { createGameActions, GameActions } from '../services/gameActions';
import { useGameStore } from '../stores/gameStore';
import { Socket } from 'socket.io-client';

interface GameContextType {
  socket: Socket | null;
  isConnected: boolean;
  actions: GameActions;
  connect: () => void;
  disconnect: () => void;
}

const GameContext = createContext<GameContextType | null>(null);

interface GameProviderProps {
  children: ReactNode;
  serverUrl?: string;
}

export const GameProvider: React.FC<GameProviderProps> = ({ 
  children, 
  serverUrl = 'http://localhost:3001' 
}) => {
  const { socket, isConnected, connect, disconnect } = useSocket(serverUrl);
  const actions = createGameActions(socket);
  const { setConnectionStatus } = useGameStore();

  // Auto-conectar al montar el componente
  useEffect(() => {
    connect();
    
    return () => {
      disconnect();
    };
  }, []);

  // Actualizar estado de conexión
  useEffect(() => {
    if (isConnected) {
      setConnectionStatus('connected');
    } else {
      setConnectionStatus('disconnected');
    }
  }, [isConnected, setConnectionStatus]);

  const contextValue: GameContextType = {
    socket,
    isConnected,
    actions,
    connect,
    disconnect,
  };

  return (
    <GameContext.Provider value={contextValue}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = (): GameContextType => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame debe ser usado dentro de un GameProvider');
  }
  return context;
};