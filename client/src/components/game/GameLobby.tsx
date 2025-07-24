import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Users, Play, Copy, Check } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import { useGame } from '../../contexts/GameContext';
import { useGameStore } from '../../stores/gameStore';
import { toast } from 'react-hot-toast';

export const GameLobby: React.FC = () => {
  const [playerName, setPlayerName] = useState('');
  const [gameIdToJoin, setGameIdToJoin] = useState('');
  const [copiedGameId, setCopiedGameId] = useState(false);
  const { actions, isConnected } = useGame();
  const { gameState, connectionStatus } = useGameStore();

  const handleCreateGame = () => {
    if (!playerName.trim()) {
      toast.error('Por favor ingresa tu nombre');
      return;
    }
    actions.createGame(playerName.trim());
  };

  const handleJoinGame = () => {
    if (!playerName.trim()) {
      toast.error('Por favor ingresa tu nombre');
      return;
    }
    if (!gameIdToJoin.trim()) {
      toast.error('Por favor ingresa el ID del juego');
      return;
    }
    actions.joinGame(gameIdToJoin.trim(), playerName.trim());
  };

  const copyGameId = async () => {
    if (gameState?.id) {
      try {
        await navigator.clipboard.writeText(gameState.id);
        setCopiedGameId(true);
        toast.success('ID del juego copiado');
        setTimeout(() => setCopiedGameId(false), 2000);
      } catch (error) {
        toast.error('Error al copiar el ID');
      }
    }
  };

  const isDisabled = !isConnected || connectionStatus !== 'connected';

  if (gameState) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto p-6"
      >
        <Card variant="steel" className="p-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">
              Sala de Juego
            </h2>
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="text-gray-300">ID del juego:</span>
              <code className="bg-gray-800 px-2 py-1 rounded text-blue-400 font-mono">
                {gameState.id}
              </code>
              <Button
                variant="steel"
                size="sm"
                onClick={copyGameId}
                className="p-1"
              >
                {copiedGameId ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-gray-300">
              <Users className="w-5 h-5" />
              <span>Jugadores ({gameState.players.length}/4):</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {gameState.players.map((player, index) => (
                <motion.div
                  key={player.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`
                    p-3 rounded-lg border
                    ${player.isConnected 
                      ? 'bg-green-900/20 border-green-500/30' 
                      : 'bg-red-900/20 border-red-500/30'
                    }
                  `}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-white">
                      {player.name}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className={`
                        w-2 h-2 rounded-full
                        ${player.isConnected ? 'bg-green-400' : 'bg-red-400'}
                      `} />
                      <span className={`
                        text-xs px-2 py-1 rounded
                        ${getGuildStyles(player.guild)}
                      `}>
                        {getGuildName(player.guild)}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {gameState.status === 'waiting' && gameState.players.length >= 2 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center pt-4"
              >
                <Button
                  variant="green"
                  size="lg"
                  onClick={() => toast('El juego comenzará automáticamente', { icon: 'ℹ️' })}
                  className="gap-2"
                >
                  <Play className="w-5 h-5" />
                  Listo para jugar
                </Button>
              </motion.div>
            )}

            {gameState.status === 'waiting' && gameState.players.length < 2 && (
              <div className="text-center text-gray-400 py-4">
                Esperando más jugadores...
              </div>
            )}
          </div>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto p-6"
    >
      <Card variant="steel" className="p-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">
            Albion Parchís
          </h2>
          <p className="text-gray-400">
            Únete a la batalla entre gremios
          </p>
        </div>

        <div className="space-y-4">
          <Input
            label="Tu nombre"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Ingresa tu nombre"
            disabled={isDisabled}
          />

          <Button
            variant="green"
            size="lg"
            onClick={handleCreateGame}
            disabled={isDisabled || !playerName.trim()}
            className="w-full gap-2"
          >
            <Plus className="w-5 h-5" />
            Crear Nuevo Juego
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-600" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-900 text-gray-400">o</span>
            </div>
          </div>

          <Input
            label="ID del juego"
            value={gameIdToJoin}
            onChange={(e) => setGameIdToJoin(e.target.value)}
            placeholder="Ingresa el ID del juego"
            disabled={isDisabled}
          />

          <Button
            variant="arcane"
            size="lg"
            onClick={handleJoinGame}
            disabled={isDisabled || !playerName.trim() || !gameIdToJoin.trim()}
            className="w-full gap-2"
          >
            <Users className="w-5 h-5" />
            Unirse al Juego
          </Button>

          {isDisabled && (
            <p className="text-center text-red-400 text-sm">
              {connectionStatus === 'connecting' 
                ? 'Conectando al servidor...' 
                : 'Sin conexión al servidor'
              }
            </p>
          )}
        </div>
      </Card>
    </motion.div>
  );
};

const getGuildStyles = (guild: string) => {
  switch (guild) {
    case 'steel':
      return 'bg-gray-600 text-gray-100';
    case 'arcane':
      return 'bg-purple-600 text-purple-100';
    case 'green':
      return 'bg-green-600 text-green-100';
    case 'golden':
      return 'bg-yellow-600 text-yellow-100';
    default:
      return 'bg-gray-600 text-gray-100';
  }
};

const getGuildName = (guild: string) => {
  switch (guild) {
    case 'steel':
      return 'Acero';
    case 'arcane':
      return 'Arcano';
    case 'green':
      return 'Verde';
    case 'golden':
      return 'Dorado';
    default:
      return 'Desconocido';
  }
};