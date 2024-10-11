class CaveEntrance extends Phaser.Scene {
    constructor() {
        super({ key: 'CaveEntrance' });

        this.transitionZone = {
            x: 950,  // x-coordinate of the top-left corner
            y: 350,   // y-coordinate of the top-left corner
            width: 200,  // width of the rectangle
            height: 350  // height of the rectangle
        };
    }

    preload() {
        // Preload assets
        this.load.image('background_ce', 'graphics/caveentrance.png');
        this.load.image('parchment_bg', 'graphics/parchment_bg.png');
        this.load.spritesheet('character', 'graphics/grahamprincesspng.png', { frameWidth: 28.5, frameHeight: 70 });
        this.load.image('amulet', 'graphics/graks_amulet.png');
        this.load.image('mirror', 'graphics/mirror.png');
        this.load.image('torch', 'graphics/torch.png');

        // Fetch and load inventory items from inventory-library.json
        fetch('components/inventory-library.json')
            .then(response => response.json())
            .then(data => {
                data.items.forEach(item => {
                    this.load.image(item.name, item.img);
                });
            })
            .catch(error => console.error('Error loading inventory library:', error));
    }

    create() {
        console.log('Creating CE scene');

        // Initialize variables
        this.torchAddedToInventory = false;
        this.showHashmarks = false;  // Hashmarks toggle
        this.zoneActivated = false;  // Zone activation flag

        // Set the background
        const background = this.add.image(750, 450, 'background_ce');
        background.setDepth(0);

        // Load sprite position from localStorage or set default
        const savedX = localStorage.getItem('spriteX');
        const savedY = localStorage.getItem('spriteY');
        const startX = savedX ? parseFloat(savedX) : 100;
        const startY = savedY ? parseFloat(savedY) : 850;  // Character starts behind the rock

        // Create the main sprite for the player character
        this.sprite = this.physics.add.sprite(startX, startY, 'character');
        this.sprite.setScale(3);
        this.sprite.setDepth(1);
        this.sprite.body.collideWorldBounds = true;

        // Walking animation
        this.anims.create({
            key: 'walk',
            frames: this.anims.generateFrameNumbers('character', { start: 0, end: 5 }),
            frameRate: 10,
            repeat: -1
        });

        // Input cursor keys for controlling the character
        this.cursors = this.input.keyboard.createCursorKeys();

        // Initialize the inventory
        createInventory(this);

        // Reset message panel if it exists
        if (messagePanel) {
            messagePanel.destroy();
            messagePanel = null;
        }

        // Show intro message when entering Castle Prairie
        checkIntroMessage(this, "CaveEntrance", "Tucked away in the crannies of this rocky outcropping is a distinctly cave-like opening.", this);

          // Hashmark debugging graphics
          hashmarkGraphics = this.add.graphics();
          this.input.keyboard.on('keydown-H', toggleHashmarks.bind(this, this));

        // Set current scene
        localStorage.setItem('currentScene', 'CaveEntrance');

        // Prevent multiple transitions
        this.hasTransitioned = false;

        
        
    }
    

    update() {
        let moving = false;

        // Character movement
        if (this.cursors.left.isDown) {
            this.sprite.setVelocityX(-200);
            this.sprite.setFlipX(true);
            moving = true;
        } else if (this.cursors.right.isDown) {
            this.sprite.setVelocityX(200);
            this.sprite.setFlipX(false);
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

        
       /* // Transition to CaveInterior if sprite.x is greater than 1200 and sprite.y is between 300 and 500
if (this.sprite.x > 1200 && this.sprite.y > 450 && this.sprite.y < 600 && !this.hasTransitioned) {
    localStorage.setItem('spriteX', 100);
    localStorage.setItem('spriteY', 520);
    this.hasTransitioned = true;
    this.scene.start('CaveInterior');
} */

        // Transition to CaveInterior if sprite.x is greater than 1200 and sprite.y is between 300 and 500
if (this.sprite.y > 840 && !this.hasTransitioned) {
    localStorage.setItem('spriteX', this.sprite.x);
    localStorage.setItem('spriteY', this.sprite.y - 700);
    this.hasTransitioned = true;
    this.scene.start('Grassrivermount');
}
        // Transition to CaveInterior if sprite.x is greater than 1200 and sprite.y is between 300 and 500
        if (this.sprite.y < 106 && !this.hasTransitioned) {
            localStorage.setItem('spriteX', this.sprite.x);
            localStorage.setItem('spriteY', this.sprite.y + 700);
            this.hasTransitioned = true;
            this.scene.start('GFCM');
        }
        // Transition to CaveInterior if sprite.x is greater than 1200 and sprite.y is between 300 and 500
        if (this.sprite.x < 106 && !this.hasTransitioned) {
            localStorage.setItem('spriteX', this.sprite.x + 1330);
            localStorage.setItem('spriteY', this.sprite.y);
            this.hasTransitioned = true;
            this.scene.start('Swampmaze');

            
        }

        // Play walking animation if moving
        if (moving) {
            this.sprite.anims.play('walk', true);
        } else {
            this.sprite.setVelocity(0, 0);
            this.sprite.anims.stop();
            this.sprite.setFrame(1);
        }

        // Check if the sprite is colliding with the transition zone and start the new scene
    if (isColliding(this.sprite, this.transitionZone) && !this.hasTransitioned) {
        localStorage.setItem('spriteX', 115);  // Set next scene's starting position
        localStorage.setItem('spriteY', 520);  // Set next scene's starting position
        this.hasTransitioned = true;  // Prevent multiple transitions
        this.scene.start('CaveInterior');  // Start the new scene
    }
    }
}
function isColliding(sprite, zone) {
    return (
        sprite.x > zone.x &&
        sprite.x < zone.x + zone.width &&
        sprite.y > zone.y &&
        sprite.y < zone.y + zone.height
    );
}
