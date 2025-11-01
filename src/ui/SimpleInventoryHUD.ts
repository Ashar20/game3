import * as ex from 'excalibur';
import { Images } from '../resources';

/**
 * Simple Inventory HUD using the inventory bar image
 */
export class SimpleInventoryHUD {
  private engine!: ex.Engine;
  private scene!: ex.Scene;
  private inventorySprite!: ex.Sprite;
  private selectedSlot: number = 0;
  private numSlots: number = 8;
  private scale: number = 3; // Scale up the inventory bar

  initialize(scene: ex.Scene, engine: ex.Engine): void {
    this.scene = scene;
    this.engine = engine;

    // Create sprite from the inventory bar image
    this.inventorySprite = ex.Sprite.from(Images.inventoryBar);

    // Set up keyboard input for slot selection (1-8)
    this.engine.input.keyboard.on('press', (evt: ex.Input.KeyEvent) => {
      if (evt.key >= ex.Keys.Digit1 && evt.key <= ex.Keys.Digit8) {
        const slotIndex = evt.key - ex.Keys.Digit1;
        this.selectSlot(slotIndex);
      }
    });
  }

  selectSlot(slotIndex: number): void {
    if (slotIndex >= 0 && slotIndex < this.numSlots) {
      this.selectedSlot = slotIndex;
      console.log(`Selected inventory slot ${slotIndex + 1}`);
    }
  }

  draw(ctx: ex.ExcaliburGraphicsContext): void {
    const screenWidth = this.engine.drawWidth;
    const screenHeight = this.engine.drawHeight;

    // Calculate scaled dimensions
    const inventoryWidth = this.inventorySprite.width * this.scale;
    const inventoryHeight = this.inventorySprite.height * this.scale;

    // Position at bottom center
    const x = (screenWidth - inventoryWidth) / 2;
    const y = screenHeight - inventoryHeight - 10;

    // Draw the inventory bar sprite with scaling
    ctx.save();
    ctx.scale(this.scale, this.scale);
    this.inventorySprite.draw(ctx, x / this.scale, y / this.scale);
    ctx.restore();

    // Draw selection highlight on the selected slot
    if (this.selectedSlot >= 0 && this.selectedSlot < this.numSlots) {
      const slotWidth = inventoryWidth / this.numSlots;
      const slotX = x + (this.selectedSlot * slotWidth);
      const slotY = y;

      ctx.save();
      ctx.drawRectangle(
        new ex.Vector(slotX, slotY),
        slotWidth,
        inventoryHeight,
        ex.Color.Transparent,
        ex.Color.Yellow,
        3
      );
      ctx.restore();
    }
  }
}
