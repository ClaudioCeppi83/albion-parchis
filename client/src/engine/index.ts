// Isometric Engine
export { IsometricEngine } from './IsometricEngine';

// Types
export interface EngineConfig {
  width: number;
  height: number;
  backgroundColor?: number;
  antialias?: boolean;
  resolution?: number;
}

export interface IsometricPosition {
  x: number;
  y: number;
}

export interface CartesianPosition {
  x: number;
  y: number;
}

export interface TileData {
  gridX: number;
  gridY: number;
  type: 'path' | 'grass' | 'home' | 'safe';
  color?: number;
  interactive?: boolean;
}