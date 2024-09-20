class CaveInterior extends Phaser.Scene {
    constructor() {
        super({ key: 'CaveInterior' });
    }

    preload() {
        // Preload assets
        this.load.image('background_cw', 'graphics/cavewinds.png');
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
        const background = this.add.image(750, 450, 'background_cw');
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
        checkIntroMessage(this, "CaveInterior", "A magical little pool weeps out of the rock, and is filtered by beards of moss.", this);

          // Hashmark debugging graphics
          hashmarkGraphics = this.add.graphics();
          this.input.keyboard.on('keydown-H', toggleHashmarks.bind(this, this));

        // Set current scene
        localStorage.setItem('currentScene', 'CaveInterior');

        // Prevent multiple transitions
        this.hasTransitioned = false;
        
       // Create the interactive rectangle zone for the pool
const rectangleZone = this.add.zone(1150, 720, 860, 220).setRectangleDropZone(860, 220);

// Initialize the poolRectangle to match the exact dimensions and position of the rectangleZone
const poolRectangle = new Phaser.Geom.Rectangle(rectangleZone.x - rectangleZone.width / 2, rectangleZone.y - rectangleZone.height / 2, rectangleZone.width, rectangleZone.height);


        
          // Enable drag and drop for inventory items
        this.input.on('dragstart', (pointer, gameObject) => {
            gameObject.setScale(0.28);
            gameObject.originalX = gameObject.x;
            gameObject.originalY = gameObject.y;
        });

        this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
            gameObject.x = dragX;
            gameObject.y = dragY;
        });

        this.input.on('dragend', (pointer, gameObject) => {
            gameObject.setScale(0.15); // Restore the original scale
            console.log('Dragged item texture key:', gameObject.texture.key);
            console.log('Pointer dropped at:', pointer.x, pointer.y);
        
            // Log the center of the rectangle based on the poolRectangle
            const centerX = poolRectangle.x + poolRectangle.width / 2;
            const centerY = poolRectangle.y + poolRectangle.height / 2;
            console.log('poolRectangle center:', centerX, centerY);
        
            // Depending on the dragged item, pass the correct zone
            if (gameObject.texture.key === 'wineskin') {
                handleItemInteraction(pointer, gameObject, { rectangle: poolRectangle }, this, inventory);
            }
        });
        
        

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

        /*
        // Transition to CaveInterior if sprite.x is greater than 1200 and sprite.y is between 300 and 500
if (this.sprite.x > 1200 && this.sprite.y > 450 && this.sprite.y < 600 && !this.hasTransitioned) {
    localStorage.setItem('spriteX', 500);
    localStorage.setItem('spriteY', 500);
    this.hasTransitioned = true;
    this.scene.start('CaveInterior');
}
*/
        // Play walking animation if moving
        if (moving) {
            this.sprite.anims.play('walk', true);
        } else {
            this.sprite.setVelocity(0, 0);
            this.sprite.anims.stop();
            this.sprite.setFrame(1);
        }
    }
}
