import * as ex from 'excalibur';
import { Images } from '../resources';

/**
 * Player actor class
 */
export class Player extends ex.Actor {
  private speed: number = 100;
  private idleAnimations: { [key: string]: ex.Animation } = {};
  private runAnimations: { [key: string]: ex.Animation } = {};
  private lastFacingDirection: string = 'down'; // Track last facing direction for idle

  constructor(x: number, y: number) {
    super({
      pos: new ex.Vector(x, y),
      width: 16,  // Set explicit size for collision
      height: 16,
      collisionType: ex.CollisionType.Active,
    });
  }

  onInitialize(engine: ex.Engine): void {
    // Wait for both images to be loaded before creating sprite sheets
    const loadIdle = Images.playerIdle.isLoaded() 
      ? Promise.resolve() 
      : Images.playerIdle.load();
    const loadRun = Images.playerRun.isLoaded() 
      ? Promise.resolve() 
      : Images.playerRun.load();
    
    Promise.all([loadIdle, loadRun]).then(() => {
      this.setupSpriteSheet();
    });

    // Set up keyboard input
    engine.input.keyboard.on('press', (evt) => {
      this.handleInput(evt.key);
    });
    
    // Debug: Log collision info (safely)
    console.log('Player initialized - Collision Type:', this.body?.collisionType);
    if (this.bounds) {
      console.log('Player bounds:', this.bounds.width, 'x', this.bounds.height);
    }
  }

  private setupSpriteSheet(): void {
    // Setup idle sprite sheet
    const idleImage = Images.playerIdle;
    const idleRows = 3;
    const idleColumns = 4;
    
    // Try to get dimensions from a test sprite
    let spriteWidth = 32;  // Default - common sprite size
    let spriteHeight = 32;
    
    try {
      const testSprite = idleImage.toSprite();
      if (testSprite) {
        spriteWidth = testSprite.width / idleColumns;
        spriteHeight = testSprite.height / idleRows;
        console.log('Idle image dimensions:', testSprite.width, 'x', testSprite.height);
        console.log('Calculated sprite dimensions:', spriteWidth, 'x', spriteHeight);
      }
    } catch (e) {
      console.log('Could not get idle image dimensions, using default 32x32');
    }
    
    const idleSpriteSheet = ex.SpriteSheet.fromImageSource({
      image: idleImage,
      grid: {
        rows: idleRows,
        columns: idleColumns,
        spriteWidth: spriteWidth,
        spriteHeight: spriteHeight,
      },
    });

    // Create idle animations for each direction
    // Row 1 (frames 0-3): Facing down
    this.idleAnimations['down'] = ex.Animation.fromSpriteSheet(
      idleSpriteSheet,
      [0, 1, 2, 3],
      200
    );

    // Row 2 (frames 4-7): Facing up
    this.idleAnimations['up'] = ex.Animation.fromSpriteSheet(
      idleSpriteSheet,
      [4, 5, 6, 7],
      200
    );

    // Row 3 (frames 8-11): Facing right (mirror for left)
    this.idleAnimations['right'] = ex.Animation.fromSpriteSheet(
      idleSpriteSheet,
      [8, 9, 10, 11],
      200
    );

    // Left: same as right but flipped
    this.idleAnimations['left'] = ex.Animation.fromSpriteSheet(
      idleSpriteSheet,
      [8, 9, 10, 11],
      200
    );
    this.idleAnimations['left'].flipHorizontal = true;

    // Setup run sprite sheet
    const runImage = Images.playerRun;
    const runRows = 3;
    const runColumns = 8;
    
    // Use same sprite dimensions as idle
    const runSpriteSheet = ex.SpriteSheet.fromImageSource({
      image: runImage,
      grid: {
        rows: runRows,
        columns: runColumns,
        spriteWidth: spriteWidth,
        spriteHeight: spriteHeight,
      },
    });

    // Create run animations for each direction
    // Row 1 (frames 0-7): Running down
    this.runAnimations['down'] = ex.Animation.fromSpriteSheet(
      runSpriteSheet,
      [0, 1, 2, 3, 4, 5, 6, 7],
      100  // Faster animation speed for running
    );

    // Row 2 (frames 8-15): Running up
    this.runAnimations['up'] = ex.Animation.fromSpriteSheet(
      runSpriteSheet,
      [8, 9, 10, 11, 12, 13, 14, 15],
      100
    );

    // Row 3 (frames 16-23): Running right (mirror for left)
    this.runAnimations['right'] = ex.Animation.fromSpriteSheet(
      runSpriteSheet,
      [16, 17, 18, 19, 20, 21, 22, 23],
      100
    );

    // Left: same as right but flipped
    this.runAnimations['left'] = ex.Animation.fromSpriteSheet(
      runSpriteSheet,
      [16, 17, 18, 19, 20, 21, 22, 23],
      100
    );
    this.runAnimations['left'].flipHorizontal = true;

    // Start with down-facing idle animation
    this.graphics.use(this.idleAnimations['down']);
  }

  onPreUpdate(engine: ex.Engine, delta: number): void {
    const leftRight = engine.input.keyboard.isHeld(ex.Keys.A) || engine.input.keyboard.isHeld(ex.Keys.ArrowLeft)
      ? -1
      : engine.input.keyboard.isHeld(ex.Keys.D) || engine.input.keyboard.isHeld(ex.Keys.ArrowRight)
      ? 1
      : 0;

    const upDown = engine.input.keyboard.isHeld(ex.Keys.W) || engine.input.keyboard.isHeld(ex.Keys.ArrowUp)
      ? -1
      : engine.input.keyboard.isHeld(ex.Keys.S) || engine.input.keyboard.isHeld(ex.Keys.ArrowDown)
      ? 1
      : 0;

    // Determine facing direction for animation
    let facingDirection = '';
    if (upDown > 0) {
      facingDirection = 'down';
    } else if (upDown < 0) {
      facingDirection = 'up';
    } else if (leftRight > 0) {
      facingDirection = 'right';
    } else if (leftRight < 0) {
      facingDirection = 'left';
    }

    // Update last facing direction if we have a new one
    if (facingDirection) {
      this.lastFacingDirection = facingDirection;
    } else {
      // Use last facing direction when no keys are pressed
      facingDirection = this.lastFacingDirection;
    }

    // Check if player is moving
    const isMoving = leftRight !== 0 || upDown !== 0;

    // Update animation based on direction and movement state
    if (isMoving && this.runAnimations[facingDirection]) {
      // Use run animation when moving
      this.graphics.use(this.runAnimations[facingDirection]);
    } else if (!isMoving && this.idleAnimations[facingDirection]) {
      // Use idle animation when not moving
      this.graphics.use(this.idleAnimations[facingDirection]);
    }

    // Normalize diagonal movement
    const direction = new ex.Vector(leftRight, upDown);
    if (direction.size > 0) {
      direction.normalize();
    }

    this.vel = direction.scale(this.speed);
  }

  private handleInput(key: ex.Input.Keys): void {
    // Handle key press events here if needed
    // For example, interactions, abilities, etc.
  }
}
