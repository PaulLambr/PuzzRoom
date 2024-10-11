class Drawbridge extends Phaser.Scene {
    constructor() {
        super({ key: 'Drawbridge' });
    }

    preload() {
        // Preload assets
        this.load.image('background_db', 'graphics/Drawbridge.png');
        
        this.load.image('parchment_bg', 'graphics/parchment_bg.png');
        this.load.spritesheet('character', 'graphics/grahamprincesspng.png', { frameWidth: 28.5, frameHeight: 70 });
        this.load.image('amulet', 'graphics/graks_amulet.png');
        this.load.image('mirror', 'graphics/mirror.png');
        this.load.image('torch', 'graphics/torch.png');
        this.load.image('silversword', 'graphics/silversword.png');  // Load the silver sword
        this.load.image('redorb', 'graphics/redorb.png');            // Load the red orb
        this.load.image('debris_cloud', 'graphics/debris.png'); 
        this.load.image('powderkeg2', 'graphics/powderkeg2.png'); 
        this.load.image('background_db2', 'graphics/Drawbridge_explode.png');

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
        console.log('Creating Drawbridge scene');

        // Initialize variables
        this.torchAddedToInventory = false;
        this.showHashmarks = false;  // Hashmarks toggle
        this.zoneActivated = false;  // Zone activation flag
        this.swordDragged = false;   // Track whether the sword was successfully dragged

        // Set the background
        const background = this.add.image(750, 450, 'background_db');
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

        // Show intro message when entering TreeInterior
        checkIntroMessage(this, "Drawbridge", "You hear the sounds of goblins coming through the grate which drains into the moat.", this);

        // Hashmark debugging graphics
        hashmarkGraphics = this.add.graphics();
        this.input.keyboard.on('keydown-H', toggleHashmarks.bind(this, this));

        // Set current scene
        localStorage.setItem('currentScene', 'Drawbridge');

        // Prevent multiple transitions
        this.hasTransitioned = false;

        // Add the interactive zone at (560, 360) with width 150 and height 280
        const zone = this.add.zone(330, 570, 200, 130).setOrigin(0);
        this.physics.world.enable(zone);
        zone.body.setAllowGravity(false);
        zone.setInteractive();

        // Add event listener for clicking the zone
        zone.on('pointerdown', () => {
            showMessage(
                "This grate drains water from the castle latrines into the moat. It is directly above the cellar.",
                this
            );
        });

        // Define the bounds of the inventory panel
        const inventoryBounds = new Phaser.Geom.Rectangle(1500, 0, 300, 900);
        const tolerance = 15;  // Tolerance for dropping near edges

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
        
            // Check if the pointer is within the inventory panel with tolerance
            const itemBounds = gameObject.getBounds();
            if (
                itemBounds.right > inventoryBounds.x + inventoryBounds.width ||
                itemBounds.left < inventoryBounds.x - tolerance ||
                itemBounds.bottom > inventoryBounds.y + inventoryBounds.height ||
                itemBounds.top < inventoryBounds.y
            ) {
                showMessage("You can't drop the item here!", this);
                gameObject.x = gameObject.originalX;
                gameObject.y = gameObject.originalY;
                return; // Exit here if dropped inside inventory panel
            }
        
            // Check if the item was dropped into the interactive zone
            const zoneBounds = zone.getBounds();
            if (Phaser.Geom.Rectangle.Contains(zoneBounds, pointer.x, pointer.y)) {
                if (gameObject.texture.key === 'powderkeg') {
                    // Sword was successfully dragged into the zone
                    this.swordDragged = true;
            
                    // Instead of drawing a black box, overlay the image
                    const powderkegImage = this.add.image(410, 680, 'powderkeg2'); // Adjusted to match the center of the black box
            
                    // Optionally, adjust the scale or size of the image if needed
                    powderkegImage.setDisplaySize(180, 150); // Matching the dimensions of the original box
            
                    // Show the message
                    showMessage(
                        "You wedge the powder keg up against the grate. Now you just have to light it to blow the moat and drown the goblins in their tunnel.",
                        this
                    );
           
            
                } else if (gameObject.texture.key === 'torch') {
                    // Red orb logic based on whether the sword was dragged first
                    if (this.swordDragged) {
                        showMessage(
                            "You light the fuse of the powder keg.",
                            this
                        );
                        // If sword was dragged, fade out and start 'Poke' scene
                        this.cameras.main.shake(4000, 0.01);
                        const debrisCloud = this.add.image(360, 560, 'debris_cloud').setScale(3);
                        this.time.delayedCall(500, () => {
                            debrisCloud.destroy();
                            /* const graphics = this.add.graphics();
                            graphics.fillStyle(0x000000, 1);
                            graphics.fillRect(300, 590, 300, 300); */
                            showMessage("You blow the grate and the moat starts flowing into the cellar. You hear the sounds of goblins screeching in agony as the rushing fetid water submerges them in their unauthorized underground tunnel.", this); 
                            localStorage.setItem('moatblown', 'True');
                           inventory.removeItem({ name: 'powderkeg', img: 'powderkeg' });
                            this.add.image(750, 450, 'background_db2')
                        });
                    } else {
                        showMessage("You need to set the powder keg first.", this); // Add this to handle the case where swordDragged is false
                    }
                }
            } else {
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

        // Play walking animation if moving
        if (moving) {
            this.sprite.anims.play('walk', true);
        } else {
            this.sprite.setVelocity(0, 0);
            this.sprite.anims.stop();
            this.sprite.setFrame(1);
        }

        // Transition to the next scene (ThroneHall2) if sprite's y < 550 and x is between 550 and 950
if (this.sprite.y < 500 && this.sprite.x > 550 && this.sprite.x < 950 && !this.hasTransitioned) {
    localStorage.setItem('spriteX', this.sprite.x);
    localStorage.setItem('spriteY', this.sprite.y + 150);
    this.hasTransitioned = true;
    this.scene.start('HallThrone2');
}
// Transition to the next scene (ThroneHall2) if sprite's y < 550 and x is between 550 and 950
if (this.sprite.x < 560 && !this.hasTransitioned) {
    this.sprite.x=560
    
}

// Transition to the next scene (ThroneHall2) if sprite's y < 550 and x is between 550 and 950
if (this.sprite.x > 940 && !this.hasTransitioned) {
    this.sprite.x=940
    
}
    }
}
