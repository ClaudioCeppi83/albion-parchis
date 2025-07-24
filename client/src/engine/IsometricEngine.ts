import * as PIXI from 'pixi.js';

/**
 * Motor Isométrico para Albion Parchís
 * Maneja el renderizado del tablero en vista isométrica
 */
export class IsometricEngine {
  private app: PIXI.Application;
  private container: PIXI.Container;
  private boardContainer: PIXI.Container;
  private pieceContainer: PIXI.Container;
  
  // Configuración isométrica
  private readonly TILE_WIDTH = 64;
  private readonly TILE_HEIGHT = 32;
  private readonly BOARD_SIZE = 15; // Tablero 15x15 para parchís
  
  constructor(canvas: HTMLCanvasElement) {
    // Inicializar aplicación PIXI
    this.app = new PIXI.Application({
      view: canvas,
      width: 800,
      height: 600,
      backgroundColor: 0x2c3e50,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
    });
    
    // Contenedores principales
    this.container = new PIXI.Container();
    this.boardContainer = new PIXI.Container();
    this.pieceContainer = new PIXI.Container();
    
    // Jerarquía de contenedores
    this.container.addChild(this.boardContainer);
    this.container.addChild(this.pieceContainer);
    this.app.stage.addChild(this.container);
    
    // Centrar el contenedor
    this.centerContainer();
    
    // Configurar interactividad
    this.setupInteractivity();
  }
  
  /**
   * Convierte coordenadas cartesianas a isométricas
   */
  public cartesianToIsometric(x: number, y: number): { x: number; y: number } {
    return {
      x: (x - y) * (this.TILE_WIDTH / 2),
      y: (x + y) * (this.TILE_HEIGHT / 2)
    };
  }
  
  /**
   * Convierte coordenadas isométricas a cartesianas
   */
  public isometricToCartesian(x: number, y: number): { x: number; y: number } {
    return {
      x: (x / (this.TILE_WIDTH / 2) + y / (this.TILE_HEIGHT / 2)) / 2,
      y: (y / (this.TILE_HEIGHT / 2) - x / (this.TILE_WIDTH / 2)) / 2
    };
  }
  
  /**
   * Renderiza el tablero base
   */
  public renderBoard(): void {
    this.boardContainer.removeChildren();
    
    // Crear tiles del tablero
    for (let x = 0; x < this.BOARD_SIZE; x++) {
      for (let y = 0; y < this.BOARD_SIZE; y++) {
        const tile = this.createTile(x, y);
        this.boardContainer.addChild(tile);
      }
    }
    
    // Renderizar caminos del parchís
    this.renderParchisPath();
  }
  
  /**
   * Crea un tile individual del tablero
   */
  private createTile(gridX: number, gridY: number): PIXI.Graphics {
    const tile = new PIXI.Graphics();
    const isoPos = this.cartesianToIsometric(gridX, gridY);
    
    // Determinar color del tile
    const isPath = this.isPathTile(gridX, gridY);
    const color = isPath ? 0x8B4513 : 0x228B22; // Marrón para camino, verde para césped
    
    // Dibujar rombo isométrico
    tile.beginFill(color);
    tile.lineStyle(1, 0x000000, 0.3);
    
    // Puntos del rombo
    const points = [
      0, -this.TILE_HEIGHT / 2,                    // Top
      this.TILE_WIDTH / 2, 0,                      // Right
      0, this.TILE_HEIGHT / 2,                     // Bottom
      -this.TILE_WIDTH / 2, 0                      // Left
    ];
    
    tile.drawPolygon(points);
    tile.endFill();
    
    // Posicionar tile
    tile.x = isoPos.x;
    tile.y = isoPos.y;
    
    // Hacer interactivo
    tile.interactive = true;
    tile.buttonMode = true;
    
    // Eventos de hover
    tile.on('pointerover', () => {
      tile.tint = 0xFFFFFF;
    });
    
    tile.on('pointerout', () => {
      tile.tint = 0xFFFFFF;
    });
    
    tile.on('pointerdown', () => {
      console.log(`Tile clicked: (${gridX}, ${gridY})`);
    });
    
    return tile;
  }
  
  /**
   * Determina si un tile es parte del camino del parchís
   */
  private isPathTile(x: number, y: number): boolean {
    const center = Math.floor(this.BOARD_SIZE / 2);
    
    // Caminos principales (cruz)
    if (x === center || y === center) return true;
    
    // Caminos de las esquinas hacia el centro
    if ((x === 1 || x === this.BOARD_SIZE - 2) && (y >= 1 && y <= this.BOARD_SIZE - 2)) return true;
    if ((y === 1 || y === this.BOARD_SIZE - 2) && (x >= 1 && x <= this.BOARD_SIZE - 2)) return true;
    
    return false;
  }
  
  /**
   * Renderiza el camino específico del parchís
   */
  private renderParchisPath(): void {
    // Aquí se implementará la lógica específica del camino del parchís
    // Por ahora, el camino se define en isPathTile()
  }
  
  /**
   * Centra el contenedor en la pantalla
   */
  private centerContainer(): void {
    const bounds = this.boardContainer.getBounds();
    this.container.x = (this.app.screen.width - bounds.width) / 2;
    this.container.y = (this.app.screen.height - bounds.height) / 2;
  }
  
  /**
   * Configura la interactividad (zoom, pan)
   */
  private setupInteractivity(): void {
    // Habilitar interactividad del stage
    this.app.stage.interactive = true;
    
    // Variables para pan
    let isDragging = false;
    let dragStart = { x: 0, y: 0 };
    let containerStart = { x: 0, y: 0 };
    
    // Eventos de mouse/touch para pan
    this.app.stage.on('pointerdown', (event) => {
      isDragging = true;
      dragStart.x = event.data.global.x;
      dragStart.y = event.data.global.y;
      containerStart.x = this.container.x;
      containerStart.y = this.container.y;
    });
    
    this.app.stage.on('pointermove', (event) => {
      if (isDragging) {
        const dx = event.data.global.x - dragStart.x;
        const dy = event.data.global.y - dragStart.y;
        this.container.x = containerStart.x + dx;
        this.container.y = containerStart.y + dy;
      }
    });
    
    this.app.stage.on('pointerup', () => {
      isDragging = false;
    });
    
    this.app.stage.on('pointerupoutside', () => {
      isDragging = false;
    });
    
    // Zoom con rueda del mouse
    this.app.view.addEventListener('wheel', (event) => {
      event.preventDefault();
      
      const scaleFactor = event.deltaY > 0 ? 0.9 : 1.1;
      const newScale = this.container.scale.x * scaleFactor;
      
      // Limitar zoom
      if (newScale >= 0.5 && newScale <= 2) {
        this.container.scale.set(newScale);
      }
    });
  }
  
  /**
   * Redimensiona el canvas
   */
  public resize(width: number, height: number): void {
    this.app.renderer.resize(width, height);
    this.centerContainer();
  }
  
  /**
   * Limpia recursos
   */
  public destroy(): void {
    this.app.destroy(true, true);
  }
  
  /**
   * Obtiene la aplicación PIXI
   */
  public getApp(): PIXI.Application {
    return this.app;
  }
}