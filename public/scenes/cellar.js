class Cellar extends Phaser.Scene {
    constructor() {
        super({ key: 'Cellar' });  // Define the scene key for the Cellar
    }

    preload() {
        // Preload assets for the Cellar scene
        this.load.image('backgroundc', 'graphics/cellar.png'); // Unique background for Cellar
        this.load.image('parchment_bg', 'graphics/parchment_bg.png');
        this.load.spritesheet('character', 'graphics/grahamprincesspng.png', { frameWidth: 28.5, frameHeight: 70 });
        this.load.spritesheet('goblinKing', 'graphics/goblin.png', { frameWidth: 28.5, frameHeight: 70 });
        this.load.image('torch', 'graphics/torch.png');
        this.load.image('amulet', 'graphics/graks_amulet.png');
        this.load.image('mirror', 'graphics/mirror.png');

        // Fetch and load inventory items from the JSON file
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
        console.log('Creating Cellar Scene');
        

        // Initialize key variables
        this.torchUsed = false;
        this.goblinKing = null;
        this.darkOverlay = null;
        this.noGoZones = null;
        this.hasTransitioned = false;

        // Set background image for Cellar
        this.add.image(750, 450, 'backgroundc');

        // Load saved sprite position or set default
        const savedX = localStorage.getItem('spriteX');
        const savedY = localStorage.getItem('spriteY');
        const startX = savedX ? parseFloat(savedX) : 100;
        const startY = savedY ? parseFloat(savedY) : 525;

        // Create the main sprite for the player character
        this.sprite = this.physics.add.sprite(startX, startY, 'character');
        this.sprite.setScale(3);

        // Create walking animation
        if (!this.anims.exists('walk')) {
            this.anims.create({
                key: 'walk',
                frames: this.anims.generateFrameNumbers('character', { start: 0, end: 5 }),
                frameRate: 10,
                repeat: -1
            });
        }

        // Create Goblin King animation
        this.anims.create({
            key: 'goblinKingWalk',
            frames: this.anims.generateFrameNumbers('goblinKing', { start: 0, end: 5 }),
            frameRate: 10,
            repeat: -1
        });

        // Input cursor keys for controlling the character
        this.cursors = this.input.keyboard.createCursorKeys();

        // Add dark overlay for the room
        this.darkOverlay = this.add.graphics();
        this.darkOverlay.fillStyle(0x000000, 1);
        this.darkOverlay.fillRect(0, 0, 1800, 1300); // Fill the whole scene with black

        // Create no-go zones
        this.noGoZones = this.physics.add.staticGroup();
        this.noGoZones.create(290, 295, null).setSize(165, 95).setVisible(false); // No-go zone 1
        this.noGoZones.create(600, 600, null).setSize(165, 195).setVisible(false); // No-go zone 2
        this.noGoZones.create(950, 295, null).setSize(165, 195).setVisible(false); // No-go zone 3
        this.noGoZones.create(1220, 600, null).setSize(165, 195).setVisible(false); // No-go zone 4

        this.physics.add.collider(this.sprite, this.noGoZones, this.handleNoGoZoneCollision, null, this);

        // Initialize the inventory
        createInventory(this);

        // Add the transition zone to another scene (Castle Prairie)
        this.transitionZone = this.add.zone(1240, 200, 180, 1).setOrigin(0.5); // Transition area
        this.physics.add.existing(this.transitionZone);
        this.transitionZone.body.setAllowGravity(false);
        this.transitionZone.body.setImmovable(true);
        this.physics.add.overlap(this.sprite, this.transitionZone, this.transitionToCastlePrairie, null, this);

        // Enable drag and drop for inventory items
        this.input.on('dragstart', (pointer, gameObject) => {
            gameObject.setScale(0.28); // Scale up slightly when dragging starts
            gameObject.originalX = gameObject.x; // Store the original X position
            gameObject.originalY = gameObject.y; // Store the original Y position
        });

        this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
            gameObject.x = dragX;
            gameObject.y = dragY;
        });

        this.input.on('dragend', (pointer, gameObject) => {
            gameObject.setScale(0.15); // Restore the original scale

            const itemBounds = gameObject.getBounds();

            if (gameObject.texture.key === 'torch' && !this.torchUsed) {
                this.darkOverlay.clear();
                this.torchUsed = true;

                showMessage("The room is now illuminated by the torch.", this);

                this.goblinKing = this.physics.add.sprite(1150, 450, 'goblinKing').setScale(3);
                this.goblinKing.anims.play('goblinKingWalk', true);

                // Make the Goblin King flee after a brief appearance
                this.tweens.add({
                    targets: this.goblinKing,
                    x: 1250,
                    y: 200,
                    duration: 3000,
                    onComplete: () => {
                        this.goblinKing.destroy();
                        showMessage("The Goblin King has fled!", this);
                    }
                });

                // Return the torch to its original position
                gameObject.x = gameObject.originalX;
                gameObject.y = gameObject.originalY;
            } else {
                if (
                    itemBounds.right <= inventoryPanel.x + inventoryPanel.width &&
                    itemBounds.left >= inventoryPanel.x &&
                    itemBounds.bottom <= inventoryPanel.y + inventoryPanel.height &&
                    itemBounds.top >= inventoryPanel.y
                ) {
                    return;
                } else {
                    showMessage("You can't drop the item here!", this);
                    gameObject.x = gameObject.originalX;
                    gameObject.y = gameObject.originalY;
                }
            }
        });

        // Reset message panel if it exists
        if (messagePanel) {
            messagePanel.destroy();
            messagePanel = null;
        }

        // Show intro message when entering the Cellar
        checkIntroMessage(this, "cellar", "It's darker than a raven's tuckus on a moonless prairie night.", this);

        localStorage.setItem('currentScene', 'Cellar');
    }

    // Handle movement restrictions (No-go zones)
    handleNoGoZoneCollision(sprite, zone) {
        if (sprite.body.touching.left || sprite.body.touching.right) {
            sprite.setVelocityX(0);
        }
        if (sprite.body.touching.up || sprite.body.touching.down) {
            sprite.setVelocityY(0);
        }
    }

    // Transition to Castle Prairie scene
    transitionToCastlePrairie() {
        localStorage.setItem('spriteX', 220); // Set the starting position for the next scene
        localStorage.setItem('spriteY', 800);
        this.hasTransitioned = true;
        this.scene.start('CastlePrairie');
    }

    update() {
        let moving = false;

        // Handle movement and walking animation
        if (this.cursors.left.isDown) {
            this.sprite.setVelocityX(-200);
            this.sprite.setFlipX(true);
            moving = true;
        } else if (this.cursors.right.isDown) {
            this.sprite.setVelocityX(200);
            this.sprite.setFlipX(false);
            moving = true;
        } else {
            this.sprite.setVelocityX(0); // Stop horizontal movement
        }

        if (this.cursors.up.isDown) {
            this.sprite.setVelocityY(-200);
            moving = true;
        } else if (this.cursors.down.isDown) {
            this.sprite.setVelocityY(200);
            moving = true;
        } else {
            this.sprite.setVelocityY(0); // Stop vertical movement
        }

        // Play the walking animation when the character moves
        if (moving) {
            this.sprite.anims.play('walk', true);
        } else {
            this.sprite.setVelocity(0, 0);
            this.sprite.anims.stop();
            this.sprite.setFrame(1); // Idle frame when not moving
        }

        // Prevent the sprite from going out of bounds
        if (this.sprite.y < 160) {
            this.sprite.y = 160;
        }
        if (this.sprite.x > 1350) {
            this.sprite.x = 1350;
        }

        // Transition back to Tower2 if sprite moves beyond the left side (x < 0)
        if (this.sprite.x < 0 && !this.hasTransitioned) {
            localStorage.setItem('spriteX', 1050);  // Adjust as needed
            localStorage.setItem('spriteY', 300);
            this.hasTransitioned = true;
            console.log("Transitioning to Tower2");
            this.scene.start('DiningRoom');  // Replace with the correct scene key
        }
    }
}
