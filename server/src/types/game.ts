// Tipos básicos del juego
export type GuildType = 'steel' | 'arcane' | 'green' | 'golden';
export type ZoneType = 'safe' | 'yellow' | 'red' | 'black' | 'normal' | 'finish' | 'home' | 'start';
export type GameStatus = 'waiting' | 'playing' | 'finished' | 'active' | 'paused';
export type TurnPhase = 'roll' | 'move' | 'action';
export type PieceStatus = 'home' | 'board' | 'safe' | 'finished';

// Posición en el tablero
export interface BoardPosition {
  x: number;
  y: number;
  zone: ZoneType;
}

// Punto 2D para coordenadas
export interface Point2D {
  x: number;
  y: number;
}

// Punto 3D para renderizado isométrico
export interface Point3D extends Point2D {
  z: number;
}

// Recursos del juego
export type ResourceType = 'silver' | 'stone' | 'wood' | 'fiber' | 'ore';

export interface PlayerResources {
  silver: number;
  stone: number;
  wood: number;
  fiber: number;
  ore: number;
  [key: string]: number;
}

// Equipo
export interface Equipment {
  weapon?: boolean;
  armor?: boolean;
  accessory?: boolean;
}

// Ficha del jugador
export interface Piece {
  id: string;
  position: BoardPosition;
  level: number;
  experience: number;
  equipment: Equipment;
  status: PieceStatus;
}

// Jugador
export interface Player {
  id: string;
  name: string;
  guildType: GuildType;
  pieces: Piece[];
  resources: PlayerResources;
  level: number;
  experience: number;
  isConnected: boolean;
  territories?: string[];
}

// Turno actual
export interface CurrentTurn {
  playerId: string;
  phase: TurnPhase;
  timeRemaining: number;
  diceRoll?: number;
  availableMoves?: BoardPosition[];
}

// Territorio
export interface Territory {
  id: string;
  position: Point2D;
  ownerId: string;
  type: string;
  level: number;
  resources: any;
  defenseBonus: number;
}

// Oferta de intercambio
export interface TradeOffer {
  id: string;
  fromPlayerId: string;
  toPlayerId: string;
  offering: any;
  requesting: any;
  status: 'pending' | 'accepted' | 'rejected' | 'expired' | 'completed' | 'cancelled';
  createdAt: number;
  expiresAt: number;
}

// Evento del juego
export interface GameEvent {
  id: string;
  type: string;
  playerId: string;
  timestamp: Date;
  data: any;
}

// Estado del juego
export interface GameState {
  id: string;
  gameId: string;
  status: GameStatus;
  players: Player[];
  currentTurn: CurrentTurn;
  territories: Territory[];
  tradeOffers?: TradeOffer[];
  eventLog: GameEvent[];
  createdAt: Date;
  updatedAt: Date;
}

// Acciones del jugador
export interface PlayerAction {
  type: 'roll_dice' | 'move_piece' | 'trade_request' | 'territory_claim';
  playerId: string;
  data: any;
  timestamp: Date;
}

// Resultado de validación
export interface ValidationResult {
  isValid: boolean;
  error?: string;
  code?: string;
  data?: any;
}

// Resultado del juego
export interface GameResult {
  success: boolean;
  gameState?: GameState;
  error?: string;
  events?: GameEvent[];
  winnerId?: string;
  winnerName?: string;
  winCondition?: string;
  finalScores?: any[];
  gameStats?: any;
}

// Mensajes de red
export interface ClientMessage {
  type: string;
  gameId: string;
  playerId: string;
  data: any;
  timestamp: number;
}

export interface ServerMessage {
  type: string;
  gameId: string;
  data: any;
  timestamp: number;
}