import React from 'react';
import { motion } from 'framer-motion';
import { Wifi, WifiOff, RotateCcw, AlertCircle } from 'lucide-react';
import { useGameStore } from '../../stores/gameStore';
import { useGame } from '../../contexts/GameContext';

export const ConnectionStatus: React.FC = () => {
  const { connectionStatus, error } = useGameStore();
  const { connect } = useGame();

  const getStatusConfig = () => {
    switch (connectionStatus) {
      case 'connected':
        return {
          icon: Wifi,
          text: 'Conectado',
          color: 'text-green-400',
          bgColor: 'bg-green-400/10',
          borderColor: 'border-green-400/20',
        };
      case 'connecting':
        return {
          icon: RotateCcw,
          text: 'Conectando...',
          color: 'text-yellow-400',
          bgColor: 'bg-yellow-400/10',
          borderColor: 'border-yellow-400/20',
        };
      case 'reconnecting':
        return {
          icon: RotateCcw,
          text: 'Reconectando...',
          color: 'text-yellow-400',
          bgColor: 'bg-yellow-400/10',
          borderColor: 'border-yellow-400/20',
        };
      case 'error':
        return {
          icon: AlertCircle,
          text: 'Error de conexión',
          color: 'text-red-400',
          bgColor: 'bg-red-400/10',
          borderColor: 'border-red-400/20',
        };
      default:
        return {
          icon: WifiOff,
          text: 'Desconectado',
          color: 'text-gray-400',
          bgColor: 'bg-gray-400/10',
          borderColor: 'border-gray-400/20',
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        fixed top-4 right-4 z-50 
        flex items-center gap-2 px-3 py-2 
        rounded-lg border backdrop-blur-sm
        ${config.bgColor} ${config.borderColor}
      `}
    >
      <motion.div
        animate={
          connectionStatus === 'connecting' || connectionStatus === 'reconnecting'
            ? { rotate: 360 }
            : { rotate: 0 }
        }
        transition={{
          duration: 1,
          repeat: connectionStatus === 'connecting' || connectionStatus === 'reconnecting' ? Infinity : 0,
          ease: 'linear',
        }}
      >
        <Icon className={`w-4 h-4 ${config.color}`} />
      </motion.div>
      
      <span className={`text-sm font-medium ${config.color}`}>
        {config.text}
      </span>

      {connectionStatus === 'error' && (
        <button
          onClick={connect}
          className="ml-2 px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
        >
          Reintentar
        </button>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="absolute top-full right-0 mt-2 p-2 bg-red-900/90 border border-red-500/20 rounded text-xs text-red-200 max-w-xs"
        >
          {error}
        </motion.div>
      )}
    </motion.div>
  );
};