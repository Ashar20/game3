import * as ex from 'excalibur';

/**
 * Main menu/loading scene
 */
export class MainScene extends ex.Scene {
  private loadingText!: ex.Text;

  onInitialize(engine: ex.Engine): void {
    console.log('MainScene onInitialize called');
    
    // Add a loading text or background
    try {
      this.loadingText = new ex.Text({
        text: 'Loading Game...',
        font: new ex.Font({ size: 32, family: 'Arial', color: ex.Color.White }),
      });

      const loadingActor = new ex.Actor({
        pos: new ex.Vector(engine.drawWidth / 2, engine.drawHeight / 2),
        anchor: ex.Vector.Half,
      });
      loadingActor.graphics.add(this.loadingText);
      this.add(loadingActor);
      
      console.log('MainScene: Loading text added');
    } catch (error) {
      console.error('Error initializing MainScene:', error);
    }
  }

  onActivate(): void {
    // Called when scene becomes active
    console.log('MainScene activated');
  }

  onDeactivate(): void {
    // Called when scene is deactivated
    console.log('MainScene deactivated');
  }
}
