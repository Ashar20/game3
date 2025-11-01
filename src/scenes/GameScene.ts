import * as ex from 'excalibur';
import { Player } from '../actors/Player';
import { Maps, Images } from '../resources';
import { SimpleInventoryHUD } from '../ui/SimpleInventoryHUD';

/**
 * Main game scene with player and game logic
 */
export class GameScene extends ex.Scene {
  private player!: Player;
  private inventoryHUD!: SimpleInventoryHUD;

  onInitialize(_engine: ex.Engine): void {
    console.log('GameScene initializing...');
    
    // Load and add the mine map
    const mapResource = Maps.mineMap;
    
    // Map should be loaded since we wait for resources in game.start()
    if (mapResource.isLoaded()) {
      console.log('Mine map is loaded, adding to scene');
      mapResource.addToScene(this);
      
      // Calculate map bounds (40 tiles wide x 20 tiles tall, 16px per tile)
      const mapWidth = 40 * 16; // 640 pixels
      const mapHeight = 20 * 16; // 320 pixels
      
      // Set up camera bounds based on map size
      this.camera.strategy.limitCameraBounds(
        new ex.BoundingBox(0, 0, mapWidth, mapHeight)
      );
      
      // Add collision physics to walls and objects layers
      // Use a small delay to ensure map is fully added to scene
      setTimeout(() => {
        this.setupMapCollisions(mapResource);
      }, 50);
    } else {
      console.warn('Mine map is not loaded yet! Trying fallback...');
      // Try to load it if not ready
      mapResource.load().then(() => {
        console.log('Mine map loaded in fallback, adding to scene');
        mapResource.addToScene(this);
        this.setupMapCollisions(mapResource);
      }).catch((error) => {
        console.error('Error loading mine map:', error);
      });
    }


    // Create and add player in a clear soil area (left of top-left mine entrance)
    // Position: ~3 tiles from left (48px), ~5 tiles from top (80px)
    this.player = new Player(48, 80);
    
    // Ensure player renders on top of map layers
    this.add(this.player);
    this.player.z = Number.MAX_SAFE_INTEGER; // Topmost layer to render above everything

    // Set up camera to follow player
    this.camera.strategy.lockToActor(this.player);

    // Set camera zoom to 500% (5x)
    this.camera.zoom = 5;

    // Initialize inventory HUD
    this.inventoryHUD = new SimpleInventoryHUD();
    this.inventoryHUD.initialize(this, _engine);
  }

  onPostDraw(ctx: ex.ExcaliburGraphicsContext, _delta: number): void {
    // Draw inventory HUD on top of everything
    if (this.inventoryHUD) {
      this.inventoryHUD.draw(ctx);
    }
  }


  

  private setupMapCollisions(mapResource: any): void {
    // Use the fallback method which fetches the map JSON directly
    // This is more reliable since TiledResource doesn't expose .data directly
    console.log('Setting up map collisions using fallback method');
    this.setupMapCollisionsFallback(mapResource);
  }

  private setupMapCollisionsFallback(_mapResource: any): void {
    // Fallback approach: parse from the map JSON file directly
    // This ensures wall collisions are properly set up with layer offsets
    const tileWidth = 16;
    const tileHeight = 16;
    const mapWidth = 40;

    // Parse wall and object layer data from the map
    fetch('/src/assets/mine.tmj')
      .then(response => response.json())
      .then(mapData => {
        const wallLayer = mapData.layers.find((layer: any) => layer.name === 'wall');
        const objectsLayer = mapData.layers.find((layer: any) => layer.name === 'objects');

        // Add collisions to wall layer with proper offset handling
        if (wallLayer && wallLayer.data) {
          const offsetX = wallLayer.offsetx || 0;
          const offsetY = wallLayer.offsety || 0;
          this.addCollisionsFromData(
            wallLayer.data, 
            'wall', 
            tileWidth, 
            tileHeight, 
            wallLayer.width || mapWidth,
            offsetX,
            offsetY
          );
        }

        // Add collisions to objects layer
        if (objectsLayer && objectsLayer.data) {
          const offsetX = objectsLayer.offsetx || 0;
          const offsetY = objectsLayer.offsety || 0;
          this.addCollisionsFromData(
            objectsLayer.data, 
            'objects', 
            tileWidth, 
            tileHeight, 
            objectsLayer.width || mapWidth,
            offsetX,
            offsetY
          );
        }
      })
      .catch(error => {
        console.warn('Could not load map data for collisions:', error);
      });
  }

  private addCollisionsFromData(
    tileData: number[],
    layerName: string,
    tileWidth: number,
    tileHeight: number,
    mapWidth: number,
    offsetX: number = 0,
    offsetY: number = 0
  ): void {
    let collisionCount = 0;

    tileData.forEach((tileId: number, index: number) => {
      if (tileId !== 0) {
        // Calculate position based on tile index
        const col = index % mapWidth;
        const row = Math.floor(index / mapWidth);
        
        // Calculate world position, accounting for layer offset
        const x = col * tileWidth + tileWidth / 2 + offsetX;
        const y = row * tileHeight + tileHeight / 2 + offsetY;

        // Create a collision body actor
        // Actors with width/height automatically get box colliders in Excalibur
        const collider = new ex.Actor({
          pos: new ex.Vector(x, y),
          width: tileWidth,
          height: tileHeight,
          collisionType: ex.CollisionType.Fixed, // Walls and objects are fixed (immovable)
          color: ex.Color.Transparent, // Invisible collision bodies
        });
        
        // Make sure it doesn't render
        collider.graphics.visible = false;
        collider.z = -1; // Behind everything
        
        this.add(collider);
        collisionCount++;
      }
    });
    
    console.log(`Added ${collisionCount} collision bodies to ${layerName} layer (offset: ${offsetX}, ${offsetY})`);
  }

  onActivate(): void {
    console.log('GameScene activated');
  }

  onDeactivate(): void {
    console.log('GameScene deactivated');
  }
  
}
