class TreeInterior extends Phaser.Scene {
    constructor() {
        super({ key: 'TreeInterior' });
    }

    preload() {
        // Preload assets
        this.load.image('background_ti', 'graphics/Squirreltree.png');
        this.load.image('parchment_bg', 'graphics/parchment_bg.png');
        this.load.spritesheet('character', 'graphics/grahamprincesspng.png', { frameWidth: 28.5, frameHeight: 70 });
        this.load.image('amulet', 'graphics/graks_amulet.png');
        this.load.image('mirror', 'graphics/mirror.png');
        this.load.image('torch', 'graphics/torch.png');
        this.load.image('silversword', 'graphics/silversword.png');  // Load the silver sword
        this.load.image('redorb', 'graphics/redorb.png');            // Load the red orb

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
        console.log('Creating TreeInterior scene');

        // Initialize variables
        this.torchAddedToInventory = false;
        this.showHashmarks = false;  // Hashmarks toggle
        this.zoneActivated = false;  // Zone activation flag
        this.swordDragged = false;   // Track whether the sword was successfully dragged

        // Set the background
        const background = this.add.image(750, 450, 'background_ti');
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
        checkIntroMessage(this, "TreeInterior", "Truly the stuff of nightmares, it does not surprise you in the least that a squirrel is behind this web of deceit.", this);

        // Hashmark debugging graphics
        hashmarkGraphics = this.add.graphics();
        this.input.keyboard.on('keydown-H', toggleHashmarks.bind(this, this));

        // Set current scene
        localStorage.setItem('currentScene', 'TreeInterior');

        // Prevent multiple transitions
        this.hasTransitioned = false;

        // Add the interactive zone at (560, 360) with width 150 and height 280
        const zone = this.add.zone(285, 450, 150, 280).setOrigin(0);
        this.physics.world.enable(zone);
        zone.body.setAllowGravity(false);
        zone.setInteractive();

        // Add event listener for clicking the zone
        zone.on('pointerdown', () => {
            showMessage(
                "'Greetings human, I see you've conquered my spell. What remains of it is imprisoned in that red orb you carry, along with your father. If you wish to see him again, you will spare my life. Only I know the magick that will free him.' You get the sense this glorified rat is lying, or stalling somehow. Better find a way to get the truth out of him.",
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
                if (gameObject.texture.key === 'silversword') {
                    // Sword was successfully dragged into the zone
                    this.swordDragged = true;
                    showMessage(
                        "You brandish the silver sword in the squirrel's direction. His beady little eyes dilate with fear. 'All right,' he says. 'Give me the orb. I'll restore your father to his throne. It won't matter though, my goblin army will be there any second. You'll never reach him in time. Though it's your only chance.'",
                        this
                    );
                } else if (gameObject.texture.key === 'redorb') {
                    // Red orb logic based on whether the sword was dragged first
                    if (this.swordDragged) {
                        inventory.removeItem({ name: 'redorb', img: 'redorb' });
                        showMessage(
                            "You decide to trust the shifty rodent and hand him the pulsing red orb",
                            this
                        );
                        // If sword was dragged, fade out and start 'Poke' scene
                        this.cameras.main.fadeOut(3000, 0, 0, 0);
                        this.cameras.main.once('camerafadeoutcomplete', () => {
                            localStorage.setItem('spriteX', 1250); // Adjust as needed
                            localStorage.setItem('spriteY', 800); // Keep the same Y coordinate
                            this.scene.start('CastlePrairie2');
                        });
                    } else {
                        // If sword was not dragged, show failure message
                        inventory.removeItem({ name: 'redorb', img: 'redorb' });
                        showMessage(
                            "You hand the evil squirrel back the object of his shiny desire. He then sucks you inside of it where you are reunited with your father, but it's cold comfort considering you're entombed within a shiny bauble. GAME OVER!",
                            this
                        );
                    }
                } else {
                    showMessage("The item doesn't seem to have any effect here.", this);
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
    }
}
