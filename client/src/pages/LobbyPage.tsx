import React from 'react';
import { motion } from 'framer-motion';
import { GameLobby } from '../components/game/GameLobby';

const LobbyPage: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen py-8"
    >
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-game font-bold text-white mb-4">
            Lobby de Juegos
          </h1>
          <p className="text-slate-300 text-lg">
            Únete a la batalla entre gremios de Albion
          </p>
        </motion.div>

        <GameLobby />
      </div>
    </motion.div>
  );
};

export default LobbyPage;