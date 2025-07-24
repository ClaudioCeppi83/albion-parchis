import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Gamepad2, Home, Users, Settings, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';

const Header: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Inicio', icon: Home },
    { path: '/lobby', label: 'Lobby', icon: Users },
    { path: '/settings', label: 'Configuración', icon: Settings }
  ];

  return (
    <header className="border-b border-slate-700 bg-slate-800/50 backdrop-blur-sm sticky top-0 z-30">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
            >
              <Gamepad2 className="w-8 h-8 text-blue-400" />
            </motion.div>
            <h1 className="text-xl font-game font-bold gradient-text group-hover:scale-105 transition-transform">
              Albion Parchís
            </h1>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Actions */}
          <div className="flex items-center space-x-2">
            <div className="hidden sm:flex items-center space-x-2 text-sm text-slate-400">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>Conectado</span>
            </div>
            <button className="p-2 text-slate-400 hover:text-white transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-slate-700">
          <nav className="flex items-center justify-around py-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'text-blue-400'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;