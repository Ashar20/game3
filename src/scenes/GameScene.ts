import * as ex from 'excalibur';
import { Player } from '../actors/Player';
import { Maps } from '../resources';

/**
 * Main game scene with player and game logic
 */
export class GameScene extends ex.Scene {
  private player!: Player;

  onInitialize(engine: ex.Engine): void {
    // Load and add the map
    const mapResource = Maps.mineMap;
    
    // Map should be loaded since we wait for resources in game.start()
    if (mapResource.isLoaded()) {
      mapResource.addToScene(this);
      
      // Calculate map bounds (40 tiles wide x 20 tiles tall, 16px per tile)
      const mapWidth = 40 * 16; // 640 pixels
      const mapHeight = 20 * 16; // 320 pixels
      
      // Set up camera bounds based on map size
      this.camera.strategy.limitCameraBounds(
        new ex.BoundingBox(0, 0, mapWidth, mapHeight)
      );
    }

    // Create and add player in a clear soil area (left of top-left mine entrance)
    // Position: ~3 tiles from left (48px), ~5 tiles from top (80px)
    this.player = new Player(48, 80);
    
    // Ensure player renders on top of map layers
    this.add(this.player);
    this.player.z = 100; // High z-index to render above map

    // Set up camera to follow player
    this.camera.strategy.lockToActor(this.player);
  }

  onActivate(): void {
    console.log('GameScene activated');
  }

  onDeactivate(): void {
    console.log('GameScene deactivated');
  }
}
