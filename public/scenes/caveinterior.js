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
       
            // Create interactive pool rectangle zone
            const poolRectangle = this.add.zone(1150, 720, 860, 220).setRectangleDropZone(860, 220).setInteractive();
    
            // Optionally, you can add a debug graphic to visualize the zone (for testing purposes)
            const debugGraphics = this.add.graphics();
            debugGraphics.lineStyle(2, 0x00ff00);
            debugGraphics.strokeRect(poolRectangle.x - poolRectangle.input.hitArea.width / 2, poolRectangle.y - poolRectangle.input.hitArea.height / 2, poolRectangle.input.hitArea.width, poolRectangle.input.hitArea.height);
    
            // Drag and drop for inventory items
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
            
                // Log the poolRectangle's boundaries for debugging
                const poolRectangleBounds = poolRectangle.getBounds();
                console.log('poolRectangle bounds:', poolRectangleBounds);
            
                // Check if the pointer is within the poolRectangle using Phaser.Geom.Rectangle.Contains()
                if (Phaser.Geom.Rectangle.Contains(poolRectangleBounds, pointer.x, pointer.y)) {
                    if (gameObject.texture.key === 'wineskin') {
                        showMessage("You fill up the wineskin with the slightly bitter-smelling waters.", this);
            
                        // Remove the original wineskin from inventory
                        inventory.removeItem({ name: 'wineskin', img: 'wineskin' });
            
                        // Add the wineskin filled with water (wineskinwater)
                        inventory.addItemnp({ name: 'wineskinwater', img: 'wineskinwater' });
                        console.log('Wineskin water added to inventory:', inventory.items);
                    } else {
                        showMessage("The item doesn't interact with the pool.", this);
                    }
                } else {
                    showMessage("You can't drop the item here!", this);
            
                    // Return the item to its original position
                    gameObject.x = gameObject.originalX;
                    gameObject.y = gameObject.originalY;
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

    
        // Transition to CaveInterior if sprite.x is greater than 1200 and sprite.y is between 300 and 500
if (this.sprite.x < 80 && !this.hasTransitioned) {
    localStorage.setItem('spriteX', this.sprite.x + 1000);
    localStorage.setItem('spriteY', this.sprite.y);
    this.hasTransitioned = true;
    this.scene.start('CaveEntrance');
}

        // Transition to CaveInterior if sprite.x is greater than 1200 and sprite.y is between 300 and 500
        if (this.sprite.y > 1380 && !this.hasTransitioned) {
            localStorage.setItem('spriteX', this.sprite.x);
            localStorage.setItem('spriteY', this.sprite.y - 1250);
            this.hasTransitioned = true;
            this.scene.start('CaveEntrance');
        }
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
