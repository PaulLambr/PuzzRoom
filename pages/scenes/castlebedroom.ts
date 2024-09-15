// castlebedroom.ts
import BaseScene from '../basescene';

export class CastleBedroomScene extends BaseScene {
  constructor() {
    super('CastleBedroomScene');
  }

  preload() {
    // Load the background image
    this.load.image('background', 'path/to/your/background_image.png');
  }

  create() {
    // Add the background image to the scene
    this.add.image(900, 650, 'background');
  }
}
