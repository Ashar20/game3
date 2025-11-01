import * as ex from 'excalibur';
import { Images } from '../resources';

/**
 * Player actor class
 */
export class Player extends ex.Actor {
  private speed: number = 100;
  private idleAnimations: { [key: string]: ex.Animation } = {};

  constructor(x: number, y: number) {
    super({
      pos: new ex.Vector(x, y),
      width: 16,
      height: 16,
      collisionType: ex.CollisionType.Active,
    });
  }

  onInitialize(engine: ex.Engine): void {
    // Wait for the image to be loaded before creating sprite sheet
    if (!Images.playerIdle.isLoaded()) {
      Images.playerIdle.load().then(() => {
        this.setupSpriteSheet();
      });
    } else {
      this.setupSpriteSheet();
    }

    // Set up keyboard input
    engine.input.keyboard.on('press', (evt) => {
      this.handleInput(evt.key);
    });
  }

  private setupSpriteSheet(): void {
    // Load player sprite sheet
    const spriteSheet = ex.SpriteSheet.fromImageSource({
      image: Images.playerIdle,
      grid: {
        rows: 3,
        columns: 4,
        spriteWidth: 16,
        spriteHeight: 16,
      },
    });

    // Create idle animations for each direction
    // Row 1 (frames 0-3): Facing down
    this.idleAnimations['down'] = ex.Animation.fromSpriteSheet(
      spriteSheet,
      [0, 1, 2, 3],
      200
    );

    // Row 2 (frames 4-7): Facing up
    this.idleAnimations['up'] = ex.Animation.fromSpriteSheet(
      spriteSheet,
      [4, 5, 6, 7],
      200
    );

    // Row 3 (frames 8-11): Facing right (mirror for left)
    this.idleAnimations['right'] = ex.Animation.fromSpriteSheet(
      spriteSheet,
      [8, 9, 10, 11],
      200
    );

    // Left: same as right but flipped
    this.idleAnimations['left'] = ex.Animation.fromSpriteSheet(
      spriteSheet,
      [8, 9, 10, 11],
      200
    );
    this.idleAnimations['left'].flipHorizontal = true;

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

    // Update animation based on direction
    if (facingDirection && this.idleAnimations[facingDirection]) {
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
