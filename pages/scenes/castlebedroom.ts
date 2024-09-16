import Phaser from 'phaser';

export class CastleBedroomScene extends Phaser.Scene {
  private sprite: Phaser.Physics.Arcade.Sprite;
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private mirrorAddedToInventory = false;
  private rectangleZone: Phaser.GameObjects.Zone;
  private rectangleZone2: Phaser.GameObjects.Zone;
  private hasTransitioned = false;

  constructor() {
    super({ key: 'CastleBedroomScene' });
  }

  preload() {
    // Load background, character, and items
    this.load.image('background', '/graphics/bedroom_shadow.png');
    this.load.spritesheet('character', '/graphics/grahamprincesspng.png', { frameWidth: 28.5, frameHeight: 70 });
    this.load.image('mirror', '/graphics/mirror.png');
    this.load.image('amulet', '/graphics/graks_amulet.png');
    this.load.image('rope', '/graphics/rope.png');
  }

  create() {
    // Add background image
    this.add.image(750, 450, 'background');  // Center background

    // Add the sprite and its position (saved from localStorage or default)
    const savedX = localStorage.getItem('spriteX') ? parseFloat(localStorage.getItem('spriteX')!) : 100;
    const savedY = localStorage.getItem('spriteY') ? parseFloat(localStorage.getItem('spriteY')!) : 525;
    this.sprite = this.physics.add.sprite(savedX, savedY, 'character');
    this.sprite.setScale(3);  // Scale the sprite

    // Create walking animation
    this.anims.create({
      key: 'walk',
      frames: this.anims.generateFrameNumbers('character', { start: 0, end: 5 }),
      frameRate: 10,
      repeat: -1
    });

    // Enable keyboard input
    this.cursors = this.input.keyboard.createCursorKeys();

    // Interactive zone for mirror
    this.rectangleZone = this.add.zone(800, 310, 100, 60).setRectangleDropZone(100, 60).setInteractive();
    this.rectangleZone.on('pointerdown', () => {
      if (!this.mirrorAddedToInventory) {
        this.addMirrorToInventory();
      }
    });

    // Interactive zone for King Graham message
    this.rectangleZone2 = this.add.zone(1190, 150, 150, 200).setRectangleDropZone(150, 200).setInteractive();
    this.rectangleZone2.on('pointerdown', () => {
      this.showMessage("This is your dad, King Graham. Sadly he disappeared last summer hunting goblins...");
    });

    // If mirror was already added to inventory
    if (this.isMirrorInInventory()) {
      this.mirrorAddedToInventory = true;
      this.drawBrownBox();
    }

    // Toggle hashmark logic
    this.input.keyboard.on('keydown-H', this.toggleHashmarks, this);
  }

  update() {
    // Movement logic for the sprite
    let moving = false;
    
    if (this.cursors.left.isDown) {
      this.sprite.setVelocityX(-200);
      this.sprite.setFlipX(true);  // Flip sprite when moving left
      moving = true;
    } else if (this.cursors.right.isDown) {
      this.sprite.setVelocityX(200);
      this.sprite.setFlipX(false);  // No flip when moving right
      moving = true;
    } else {
      this.sprite.setVelocityX(0);
    }

    if (this.cursors.up.isDown) {
      this.sprite.setVelocityY(-200);
      moving = true;
    } else if (this.cursors.down.isDown) {
      this.sprite.setVelocityY(200);
      moving = true;
    } else {
      this.sprite.setVelocityY(0);
    }

    // Play animation while moving
    if (moving) {
      this.sprite.anims.play('walk', true);
    } else {
      this.sprite.anims.stop();
      this.sprite.setFrame(1);  // Idle frame
    }

    // Scene transition when reaching the right edge of the screen
    if (this.sprite.x > 1500 && !this.hasTransitioned) {
      this.transitionToNextScene();
    }
  }

  // Add mirror to inventory and remove from scene
  private addMirrorToInventory() {
    this.mirrorAddedToInventory = true;
    // Here, you'd add the mirror to the actual inventory (replace with your logic)
    console.log('Mirror added to inventory');  // Placeholder for inventory logic
    this.showMessage("You pick up your handy-dandy hand mirror.");
    this.drawBrownBox();
    this.rectangleZone.destroy();  // Remove the mirror zone after it's collected
  }

  // Check if the mirror is already in the inventory
  private isMirrorInInventory(): boolean {
    // Add your logic to check inventory, e.g., check localStorage or game state
    return false;  // Placeholder, return true if mirror is in inventory
  }

  // Draw a brown box where the mirror was
  private drawBrownBox() {
    const brownBoxGraphics = this.add.graphics();
    brownBoxGraphics.fillStyle(0x7f2100, 1);
    brownBoxGraphics.fillRect(750, 290, 100, 45);  // Draw brown box over the mirror
  }

  // Transition to the next scene
  private transitionToNextScene() {
    localStorage.setItem('spriteX', (this.sprite.x - 1480).toString());
    localStorage.setItem('spriteY', this.sprite.y.toString());
    this.hasTransitioned = true;
    window.location.href = 'tower.html';  // Transition to the tower scene
  }

  // Display a message
  private showMessage(message: string) {
    console.log(message);  // Replace with actual message display logic
  }

  // Toggle hashmarks (placeholder logic)
  private toggleHashmarks() {
    console.log('Hashmarks toggled');  // Replace with hashmark toggling logic
  }
}
