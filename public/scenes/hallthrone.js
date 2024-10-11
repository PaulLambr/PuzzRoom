class HallThrone extends Phaser.Scene {
    constructor() {
        super({ key: 'HallThrone' });  // Define the scene key for the Hall Throne
    }

    preload() {
        // Preload assets for the Hall Throne scene
        this.load.image('backgroundht', 'graphics/hallway_throne.png');  // Unique ID for background
        this.load.image('parchment_bg', 'graphics/parchment_bg.png');
        this.load.spritesheet('character', 'graphics/grahamprincesspng.png', { frameWidth: 28.5, frameHeight: 70 });
        this.load.image('amulet', 'graphics/graks_amulet.png');
        this.load.image('mirror', 'graphics/mirror.png');
        this.load.spritesheet('guard', 'graphics/guard_spritesheet1.png', { frameWidth: 100, frameHeight: 70 });
        this.load.image('keys', 'graphics/keys.png');  // Explicitly load the keys image

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
        console.log('Creating Hall Throne Scene');
        this.hasTransitioned = false;
        this.guard = null;

        // Set background image for Hall Throne
        this.add.image(750, 450, 'backgroundht'); // Unique ID for background

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
        if (!this.anims.exists('crawl')) {
            this.anims.create({
                key: 'crawl',
                frames: this.anims.generateFrameNumbers('guard', { start: 0, end: 2 }),
                frameRate: 10,
                repeat: -1
            });
        }
        

        // Input cursor keys for controlling the character
        this.cursors = this.input.keyboard.createCursorKeys();

        // Create guard and animate if necessary based on key state
        this.checkForKeysAndCreateGuard();

        // Initialize the inventory
        createInventory(this);

        // Reset message panel if it exists
        if (messagePanel) {
            messagePanel.destroy();
            messagePanel = null;
        }

        // Show intro message when entering the Hall Throne
        checkIntroMessage(this, "hall_throne", "It's now eerily quiet in the great hall before the entrance to the Throne Room.", this);
        this.hasTransitioned = false;  // Initialize it here as well for safety

        localStorage.setItem('currentScene', 'HallThrone');
        // Initialize hashmark graphics
        this.hashmarkGraphics = this.add.graphics();
        this.input.keyboard.on('keydown-H', (event) => toggleHashmarks(this, event));


        // Create another zone for interaction with a fixed torch
        const rectangleZone2 = this.add.zone(710, 300, 350, 500).setRectangleDropZone(350, 500);
        rectangleZone2.setInteractive();
        rectangleZone2.on('pointerdown', () => {
            showMessage("You don't go in the throne room out of respect for your missing father, the King.", this);
        });


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
            const inventoryPanel = { x: 1500, y: 0, width: 300, height: 900 };
            const tolerance = 4; // Set tolerance for drop bounds

            if (
                itemBounds.right <= inventoryPanel.x + inventoryPanel.width + tolerance &&
                itemBounds.left >= inventoryPanel.x - tolerance &&
                itemBounds.bottom <= inventoryPanel.y + inventoryPanel.height + tolerance &&
                itemBounds.top >= inventoryPanel.y - tolerance
            ) {
                return; // If the item is dropped inside the inventory, do nothing
            } else {
                showMessage("You can't drop the item here!", this);
                gameObject.x = gameObject.originalX;
                gameObject.y = gameObject.originalY;
            }
        });
    }

    checkForKeysAndCreateGuard() {
        const hasKeys = inventory.items.find(item => item.name === 'keys');
        const guardState = localStorage.getItem('guardState');  // Track guard state

        // Check if the player has keys, if yes, the guard should not be created
        if (!hasKeys && !guardState) {
            // First time entering the room without keys, guard animation starts
            this.guard = this.physics.add.sprite(750, 875, 'guard');
            this.guard.setScale(3);
            this.guard.anims.play('crawl', true);

            this.tweens.add({
                targets: this.guard,
                x: 350,
                y: 650,
                duration: 3000,
                onComplete: () => {
                    this.guard.setVelocity(0);
                    this.guard.anims.stop();
                    this.guard.setFrame(1);  // Guard dies and freezes in position
                    showMessage("The goblins were in the castle, Princess. I tried to stop them. They said they were looking for a wuzzard and a magick booke. I fought 'em off and locked 'em back in the cellar, but they got me on the way out.", this);
                    localStorage.setItem('guardState', 'expired');  // Mark the guard as dead

                    // Make guard interactive for searching
                    this.guard.setInteractive();
                    this.guard.on('pointerdown', () => {
                        showMessage("You rummage through the brave guard's pockets and take possession of his ring of keys.", this);
                        inventory.addItem({ name: 'keys', img: 'keys', x:350, y:650 }, this.sprite);
                    });
                }
            });
        } else if (!hasKeys && guardState === 'expired') {
            // Guard is already dead and the player does not have the keys
            this.guard = this.physics.add.sprite(350, 650, 'guard');
            this.guard.setScale(3);
            this.guard.setFrame(1);  // Guard is already in its final resting position

            this.guard.setInteractive();
            this.guard.on('pointerdown', () => {
                showMessage("You rummage through the brave guard's pockets and take possession of his ring of keys.", this);
                inventory.addItem({ name: 'keys', img: 'keys', x:350, y:650 }, this.sprite);
            });
        }
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

        // Prevent character from walking upwards beyond 450 pixels
        if (this.sprite.y < 450) {
            this.sprite.y = 450;
        }

        // Prevent character from walking out of bounds on the right
        if (this.sprite.x > 1500) {
            this.sprite.x = 1500;
        }

        // Handle room transition to Dining Room
        if (this.sprite.x < 0 && !this.hasTransitioned) {
            localStorage.setItem('spriteX', this.sprite.x + 1400);
            localStorage.setItem('spriteY', this.sprite.y);
            this.hasTransitioned = true;
            this.scene.start('DiningRoom');  // Perform the transition to Dining Room
        }

        if (moving) {
            this.sprite.anims.play('walk', true);
        } else {
            this.sprite.setVelocity(0, 0);
            this.sprite.anims.stop();
            this.sprite.setFrame(1);  // Idle frame when not moving
        }
    }
}
