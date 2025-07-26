import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-700 bg-slate-800/50 backdrop-blur-sm mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          <div className="text-center md:text-left">
            <p className="text-slate-400 text-sm">
              Valdris Chronicles - Fase 1.2: Componentes React
            </p>
            <p className="text-slate-500 text-xs mt-1">
              Desarrollado con React, TypeScript, Node.js y Socket.IO
            </p>
          </div>
          
          <div className="flex items-center space-x-4 text-xs text-slate-500">
            <span>v1.0.0</span>
            <span>•</span>
            <span>Beta</span>
            <span>•</span>
            <span>© 2024</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;