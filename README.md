# Albion Parchís

Una reimaginación estratégica del clásico juego de mesa parchís ambientado en el universo de Albion Online.

## 🎮 Características

- **Multijugador en tiempo real** - Hasta 4 jugadores simultáneos
- **Gráficos isométricos pixel art** - Estética nostálgica de los 90
- **Mecánicas estratégicas avanzadas** - Sistema de recursos, territorios y comercio
- **4 Gremios únicos** - Cada uno con habilidades y estilos de juego diferentes
- **Múltiples modos de victoria** - Tradicional, dominación, económica y maestría

## 🚀 Inicio Rápido

### Prerrequisitos
- Node.js 18+
- npm o yarn

### Instalación Rápida (Windows)
```bash
# Ejecutar el script de instalación
./install-deps.bat

# Iniciar en modo desarrollo
./start-dev.bat
```

### Instalación Manual
```bash
# Clonar el repositorio
git clone <repository-url>
cd albion-parchis

# Instalar dependencias del workspace
npm install

# Instalar dependencias del servidor
cd server && npm install && cd ..

# Instalar dependencias del cliente
cd client && npm install && cd ..

# Iniciar en modo desarrollo
npm run dev
```

### Scripts Disponibles
- `npm run dev` - Inicia servidor y cliente simultáneamente
- `npm run dev:server` - Solo servidor (puerto 3001)
- `npm run dev:client` - Solo cliente (puerto 5173)
- `npm run build` - Construye ambos proyectos
- `npm run test` - Ejecuta tests

## 🏗️ Arquitectura

### Backend (Puerto 3001)
- **Node.js + TypeScript** - Servidor principal
- **Socket.io** - Comunicación en tiempo real
- **Express.js** - API REST
- **Winston** - Logging avanzado

### Frontend (Puerto 5173)
- **React + TypeScript** - Interfaz de usuario
- **Tailwind CSS** - Estilos con tema Albion
- **Vite** - Build system y dev server
- **Lucide React** - Iconografía

## 📁 Estructura del Proyecto

```
albion-parchis/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── App.tsx        # Componente principal
│   │   ├── main.tsx       # Punto de entrada
│   │   └── index.css      # Estilos globales
│   ├── package.json
│   └── vite.config.ts
├── server/                 # Backend Node.js
│   ├── src/
│   │   ├── core/          # Lógica del juego
│   │   │   ├── GameEngine.ts
│   │   │   ├── BoardManager.ts
│   │   │   ├── ResourceManager.ts
│   │   │   └── ValidationSystem.ts
│   │   ├── networking/    # Comunicación
│   │   │   └── SocketHandler.ts
│   │   ├── types/         # Definiciones TypeScript
│   │   │   └── game.ts
│   │   ├── utils/         # Utilidades
│   │   │   └── logger.ts
│   │   ├── tests/         # Tests unitarios
│   │   ├── index.ts       # Punto de entrada
│   │   └── server.ts      # Configuración del servidor
│   └── package.json
├── context/               # Documentación de diseño
├── install-deps.bat       # Script de instalación (Windows)
├── start-dev.bat         # Script de desarrollo (Windows)
└── package.json          # Workspace configuration
```

## 🎯 Estado Actual - Fase 1.1

### ✅ Completado
- [x] Estructura base del proyecto (monorepo)
- [x] Configuración TypeScript para servidor y cliente
- [x] Sistema de logging con Winston
- [x] Motor de juego básico (GameEngine)
- [x] Gestor del tablero (BoardManager)
- [x] Sistema de validación (ValidationSystem)
- [x] Gestor de recursos (ResourceManager)
- [x] Comunicación Socket.IO (SocketHandler)
- [x] Interfaz básica con tema Albion
- [x] Tests unitarios básicos
- [x] Scripts de desarrollo

### 🚧 En Progreso
- [ ] Integración completa cliente-servidor
- [ ] Interfaz de juego interactiva
- [ ] Sistema de salas multijugador

### 📋 Próximos Pasos
- [ ] Componentes React para el tablero
- [ ] Estados de juego en el cliente
- [ ] Sincronización en tiempo real
- [ ] Sistema de autenticación básico

## 🧪 Testing

```bash
# Tests del servidor
cd server && npm test

# Tests del cliente
cd client && npm test

# Tests con coverage
npm run test:coverage
```

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 🎨 Créditos

- Inspirado en el universo de Albion Online
- Arte pixel isométrico original
- Mecánicas de juego innovadoras

---

**Estado del Desarrollo**: Fase 1.1 - Fundamentos Técnicos Completados  
**Versión**: 0.1.0-alpha  
**Última Actualización**: Diciembre 2024