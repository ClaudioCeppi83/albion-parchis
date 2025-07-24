import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Sparkles, Leaf, Crown, Play, Users, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, Button } from '../components/ui';

const HomePage: React.FC = () => {
  const guildCards = [
    {
      name: 'Steel Guild',
      description: 'Maestros del metal y la forja. Especialistas en defensa y resistencia.',
      icon: Shield,
      color: 'steel',
      bonus: '+20% Recursos de Piedra'
    },
    {
      name: 'Arcane Guild',
      description: 'Magos y alquimistas. Dominan las artes arcanas y la transmutación.',
      icon: Sparkles,
      color: 'arcane',
      bonus: '+50% Recursos de Plata'
    },
    {
      name: 'Green Guild',
      description: 'Guardianes de la naturaleza. Expertos en recursos naturales.',
      icon: Leaf,
      color: 'green',
      bonus: '+20% Madera y Fibra'
    },
    {
      name: 'Golden Guild',
      description: 'Comerciantes y nobles. Maestros del comercio y la riqueza.',
      icon: Crown,
      color: 'golden',
      bonus: '+30% Recursos de Mineral'
    }
  ];

  const features = [
    {
      icon: Play,
      title: 'Juego Rápido',
      description: 'Partidas de 15-30 minutos con mecánicas dinámicas'
    },
    {
      icon: Users,
      title: 'Multijugador',
      description: 'Hasta 4 jugadores en tiempo real'
    },
    {
      icon: TrendingUp,
      title: 'Progresión',
      description: 'Sistema de recursos y comercio de Albion'
    }
  ];

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-6"
      >
        <h1 className="text-4xl md:text-6xl font-game font-bold text-white">
          Bienvenido a{' '}
          <span className="gradient-text">Albion Parchís</span>
        </h1>
        <p className="text-xl text-slate-300 max-w-2xl mx-auto">
          Parchís reimaginado con elementos de Albion Online. 
          Elige tu gremio, gestiona recursos y domina el tablero.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/lobby">
            <Button size="lg" className="w-full sm:w-auto">
              <Play className="w-5 h-5 mr-2" />
              Jugar Ahora
            </Button>
          </Link>
          <Button variant="outline" size="lg" className="w-full sm:w-auto">
            Ver Tutorial
          </Button>
        </div>

        <div className="inline-flex items-center space-x-2 bg-green-900/20 border border-green-500 rounded-lg px-4 py-2">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-green-400 font-medium">Sistema Activo</span>
        </div>
      </motion.div>

      {/* Features */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <Card key={index} className="p-6 text-center" hover>
              <Icon className="w-12 h-12 text-blue-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-slate-400">
                {feature.description}
              </p>
            </Card>
          );
        })}
      </motion.div>

      {/* Guild Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-6"
      >
        <div className="text-center">
          <h2 className="text-3xl font-game font-bold text-white mb-4">
            Elige tu Gremio
          </h2>
          <p className="text-slate-300">
            Cada gremio tiene bonificaciones únicas y estilos de juego diferentes
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {guildCards.map((guild, index) => {
            const Icon = guild.icon;
            return (
              <motion.div
                key={guild.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <Card 
                  variant={guild.color as any} 
                  className="p-6 h-full" 
                  hover
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <Icon className={`w-8 h-8 text-${guild.color}-400`} />
                    <h3 className={`text-lg font-game font-semibold text-${guild.color}-300`}>
                      {guild.name}
                    </h3>
                  </div>
                  <p className="text-sm text-slate-400 mb-4">
                    {guild.description}
                  </p>
                  <div className="flex items-center space-x-2">
                    <div className={`w-4 h-4 bg-${guild.color}-500 rounded-full`}></div>
                    <span className={`text-xs text-${guild.color}-400`}>
                      {guild.bonus}
                    </span>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* System Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="p-6">
          <h3 className="text-xl font-game font-semibold text-white mb-6">
            Estado del Sistema
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-slate-300 mb-3">Backend (Servidor)</h4>
              <div className="space-y-2">
                {[
                  'GameEngine',
                  'BoardManager', 
                  'ValidationSystem',
                  'ResourceManager'
                ].map((system) => (
                  <div key={system} className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">{system}</span>
                    <span className="text-green-400 text-sm">✓ Activo</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-slate-300 mb-3">Frontend (Cliente)</h4>
              <div className="space-y-2">
                {[
                  'React + TypeScript',
                  'Tailwind CSS',
                  'Componentes UI',
                  'Navegación'
                ].map((system) => (
                  <div key={system} className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">{system}</span>
                    <span className="text-green-400 text-sm">✓ Activo</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default HomePage;