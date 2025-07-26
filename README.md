# 🎮 Albion Parchís

Una reimaginación estratégica del clásico juego de mesa parchís ambientado en el universo de Albion Online.

## ✨ Características Implementadas

- **✅ Multijugador en tiempo real** - Hasta 4 jugadores simultáneos con Socket.IO
- **✅ Gráficos isométricos** - Motor PixiJS con renderizado isométrico fluido
- **✅ Sistema de turnos robusto** - Rotación automática y validaciones completas
- **✅ Mecánicas de Parchís completas** - Reglas tradicionales implementadas
- **✅ 4 Gremios únicos** - Steel, Arcane, Green y Golden con temas visuales
- **✅ Interfaz moderna** - React + Tailwind CSS con animaciones Framer Motion
- **✅ Estado global reactivo** - Zustand para sincronización cliente-servidor
- **✅ Testing completo** - 44 tests pasando con cobertura integral

## 🚀 Inicio Rápido

### Prerrequisitos
- Node.js 18+
- npm o yarn

### Instalación y Ejecución
```bash
# Clonar el repositorio
git clone <repository-url>
cd albion-parchis

# Instalar dependencias
npm install

# Iniciar en modo desarrollo
npm run dev
```

### URLs de Desarrollo
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:3001
- **Motor Isométrico**: http://localhost:3000/isometric

### Scripts Disponibles
```bash
npm run dev          # Servidor + Cliente simultáneamente
npm run dev:server   # Solo servidor (puerto 3001)
npm run dev:client   # Solo cliente (puerto 3000)
npm run build        # Construye ambos proyectos
npm run test         # Ejecuta todos los tests
npm run test:server  # Tests del servidor
npm run test:client  # Tests del cliente
```

## 🏗️ Arquitectura Técnica

### Backend (Node.js + TypeScript)
- **Express.js** - API REST y servidor HTTP
- **Socket.IO** - Comunicación bidireccional en tiempo real
- **GameEngine** - Motor principal del juego
- **TurnSystem** - Gestión de turnos y validaciones
- **BoardManager** - Lógica del tablero y movimientos
- **Winston** - Logging estructurado

### Frontend (React + TypeScript)
- **React 18** - Interfaz de usuario moderna
- **Vite** - Build system y dev server optimizado
- **Tailwind CSS** - Estilos con tema Albion personalizado
- **PixiJS** - Motor gráfico isométrico
- **Zustand** - Estado global reactivo
- **Framer Motion** - Animaciones fluidas

## 📁 Estructura del Proyecto

```
albion-parchis/
├── client/                    # Frontend React
│   ├── src/
│   │   ├── components/        # Componentes reutilizables
│   │   │   ├── ui/           # Componentes base (Button, Card, Input)
│   │   │   ├── layout/       # Layout y navegación
│   │   │   └── game/         # Componentes de juego
│   │   ├── contexts/         # React Context (GameContext)
│   │   ├── hooks/            # Custom hooks (useSocket)
│   │   ├── stores/           # Zustand stores (gameStore)
│   │   ├── services/         # Servicios (gameActions)
│   │   ├── engine/           # Motor isométrico PixiJS
│   │   ├── pages/            # Páginas de la aplicación
│   │   └── App.tsx
├── server/                    # Backend Node.js
│   ├── src/
│   │   ├── game/             # Lógica del juego
│   │   │   ├── GameEngine.ts        # Motor principal
│   │   │   ├── TurnSystem.ts        # Sistema de turnos
│   │   │   ├── GameStateManager.ts  # Estados de juego
│   │   │   ├── GameValidationSystem.ts # Validaciones
│   │   │   ├── BoardManager.ts      # Gestión del tablero
│   │   │   └── ResourceManager.ts   # Recursos Albion
│   │   ├── networking/       # Comunicación
│   │   │   └── SocketHandler.ts
│   │   ├── types/            # Tipos TypeScript
│   │   ├── utils/            # Utilidades
│   │   ├── tests/            # Tests unitarios e integración
│   │   └── server.ts
└── PROJECT_STATUS.md         # Documentación detallada
```

## 🎯 Estado Actual - ¡TODAS LAS FASES COMPLETADAS!

### ✅ Fase 1.1: Fundamentos Técnicos (100%)
- [x] Monorepo con workspaces configurado
- [x] TypeScript setup completo
- [x] Sistema de logging con Winston
- [x] Arquitectura base sólida

### ✅ Fase 1.2: Componentes React (100%)
- [x] Sistema de componentes UI completo
- [x] Tema visual Albion implementado
- [x] Navegación con React Router
- [x] Animaciones con Framer Motion

### ✅ Fase 1.3: Conexión Cliente-Servidor (100%)
- [x] Socket.IO configurado y funcional
- [x] Estado global con Zustand
- [x] Comunicación bidireccional
- [x] Manejo de errores y reconexión

### ✅ Fase 1.4: Motor Isométrico (100%)
- [x] PixiJS integrado completamente
- [x] Sistema de coordenadas isométricas
- [x] Renderizado del tablero 15x15
- [x] Interactividad (pan, zoom, hover)

### ✅ Fase 1.5: Mecánicas Básicas (100%)
- [x] Sistema de turnos completo
- [x] Lógica de movimiento de fichas
- [x] Validaciones de juego robustas
- [x] Estados de juego consistentes
- [x] Gestión completa de jugadores

## 🎮 Funcionalidades Operativas

### Gestión de Juegos
- ✅ Crear juego con 1 jugador
- ✅ Unirse a juegos (hasta 4 jugadores)
- ✅ Inicio automático con 4 jugadores
- ✅ Inicio manual con 2+ jugadores
- ✅ Validación de límites y estados

### Mecánicas de Juego
- ✅ Sistema de turnos rotativo
- ✅ Lanzamiento de dados (1-6)
- ✅ Movimiento de fichas validado
- ✅ Reglas de Parchís implementadas
- ✅ Estados de juego (waiting/playing/finished)

### Interfaz y UX
- ✅ Lobby interactivo
- ✅ Estado de conexión visual
- ✅ Notificaciones en tiempo real
- ✅ Motor gráfico isométrico
- ✅ Interactividad del tablero

## 🧪 Testing y Calidad

### Cobertura de Tests
```bash
# Resultados actuales
✅ 4 test suites
✅ 44 tests pasando (100%)
✅ 0 errores de TypeScript
✅ Linting sin warnings
```

### Suites de Prueba
- **GameEngine.test.ts** - 14 tests (creación, jugadores, estados)
- **GameEngineIntegration.test.ts** - 8 tests (flujo completo)
- **SimpleIntegration.test.ts** - 12 tests (integración básica)
- **BoardManager.test.ts** - 10 tests (tablero y movimientos)

## 🔧 Desarrollo

### Comandos de Testing
```bash
npm test                    # Todos los tests
npm run test:server        # Solo servidor
npm run test:client        # Solo cliente
npm run test:watch         # Modo watch
```

### Comandos de Build
```bash
npm run build              # Build completo
npm run build:server       # Solo servidor
npm run build:client       # Solo cliente
npm run lint               # Linting
```

## 🌟 Próximos Pasos (Fase 2.1)

- [ ] Integración motor isométrico con mecánicas
- [ ] Renderizado de fichas en el tablero
- [ ] Animaciones de movimiento
- [ ] Interfaz de juego completa
- [ ] Sistema de chat mejorado
- [ ] Efectos visuales y sonoros

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
- Motor gráfico PixiJS
- Mecánicas de Parchís tradicionales
- Tema visual Albion personalizado

---

**🎉 Estado del Desarrollo**: ¡FASES 1.1-1.5 COMPLETADAS AL 100%!  
**📊 Tests**: 44/44 pasando (100% success rate)  
**🚀 Versión**: 1.0.0-beta  
**📅 Última Actualización**: Enero 2025

**🔗 Enlaces Rápidos:**
- [📋 Estado Detallado](PROJECT_STATUS.md)
- [🎮 Demo en Vivo](http://localhost:3000)
- [🎨 Motor Isométrico](http://localhost:3000/isometric)