import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useGameStore } from '../stores/gameStore';
import { toast } from 'react-hot-toast';

interface UseSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
}

export const useSocket = (serverUrl: string = 'http://localhost:3001'): UseSocketReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const { 
    setGameState, 
    setConnectionStatus, 
    addChatMessage,
    setError,
    clearError 
  } = useGameStore();

  const connect = () => {
    if (socketRef.current?.connected) {
      return;
    }

    const socket = io(serverUrl, {
      transports: ['websocket', 'polling'],
      timeout: 5000,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    // Eventos de conexión
    socket.on('connect', () => {
      setIsConnected(true);
      setConnectionStatus('connected');
      clearError();
      toast.success('Conectado al servidor');
      console.log('Socket conectado:', socket.id);
    });

    socket.on('disconnect', (reason) => {
      setIsConnected(false);
      setConnectionStatus('disconnected');
      toast.error('Desconectado del servidor');
      console.log('Socket desconectado:', reason);
    });

    socket.on('connect_error', (error) => {
      setIsConnected(false);
      setConnectionStatus('error');
      setError(`Error de conexión: ${error.message}`);
      toast.error('Error de conexión al servidor');
      console.error('Error de conexión:', error);
    });

    // Eventos del juego
    socket.on('server_message', (data) => {
      console.log('Mensaje del servidor:', data);
      if (data.type === 'connection_established') {
        toast.success('Conexión establecida');
      }
    });

    socket.on('game_created', (data) => {
      console.log('Juego creado:', data);
      setGameState(data.gameState);
      toast.success(`Juego creado: ${data.gameId}`);
    });

    socket.on('game_joined', (data) => {
      console.log('Unido al juego:', data);
      setGameState(data.gameState);
      toast.success('Te has unido al juego');
    });

    socket.on('game_state_update', (gameState) => {
      console.log('Estado del juego actualizado:', gameState);
      setGameState(gameState);
    });

    socket.on('player_joined', (data) => {
      console.log('Jugador se unió:', data);
      toast.success(`${data.playerName} se unió al juego`);
    });

    socket.on('player_left', (data) => {
      console.log('Jugador se fue:', data);
      toast(`${data.playerName} dejó el juego`, { icon: 'ℹ️' });
    });

    socket.on('chat_message', (data) => {
      console.log('Mensaje de chat:', data);
      addChatMessage({
        id: Date.now().toString(),
        playerId: data.playerId,
        playerName: data.playerName,
        message: data.message,
        timestamp: new Date(data.timestamp),
      });
    });

    socket.on('error', (error) => {
      console.error('Error del servidor:', error);
      setError(error.message || 'Error desconocido');
      toast.error(error.message || 'Error del servidor');
    });

    // Eventos de reconexión
    socket.on('reconnect', (attemptNumber) => {
      setIsConnected(true);
      setConnectionStatus('connected');
      toast.success(`Reconectado (intento ${attemptNumber})`);
    });

    socket.on('reconnect_attempt', (attemptNumber) => {
      setConnectionStatus('reconnecting');
      toast.loading(`Reintentando conexión... (${attemptNumber}/5)`);
    });

    socket.on('reconnect_failed', () => {
      setConnectionStatus('error');
      setError('No se pudo reconectar al servidor');
      toast.error('Falló la reconexión');
    });
  };

  const disconnect = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setIsConnected(false);
      setConnectionStatus('disconnected');
    }
  };

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, []);

  return {
    socket: socketRef.current,
    isConnected,
    connect,
    disconnect,
  };
};