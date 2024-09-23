class Bridge extends Phaser.Scene {
    constructor() {
        super({ key: 'Bridge' });
    }

    preload() {
        // Preload assets
        this.load.image('background_bridge', 'graphics/bridge_done.png');
        this.load.image('parchment_bg', 'graphics/parchment_bg.png');
        this.load.spritesheet('character', 'graphics/grahamprincesspng.png', { frameWidth: 28.5, frameHeight: 70 });
        this.load.image('amulet', 'graphics/graks_amulet.png');
        this.load.image('mirror', 'graphics/mirror.png');
        this.load.image('torch', 'graphics/torch.png');
        this.load.image('cerberus_singleframe', 'graphics/cerberus_singleframe.png');

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
        console.log('Creating Bridge scene');

        // Initialize variables
        this.torchAddedToInventory = false;
        this.showHashmarks = false;  // Hashmarks toggle
        this.zoneActivated = false;  // Zone activation flag

        // Set the background
        const background = this.add.image(750, 450, 'background_bridge');
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

        // Show intro message
        checkIntroMessage(this, "Bridge", "A gnarly-looking beast watches you approach with 6 hungry eyes fixed upon you.", this);

        // Hashmark debugging graphics
        hashmarkGraphics = this.add.graphics();
        this.input.keyboard.on('keydown-H', toggleHashmarks.bind(this, this));

        // Set current scene
        localStorage.setItem('currentScene', 'Bridge');

        // Prevent multiple transitions
        this.hasTransitioned = false;

        // Create Cerberus image
        this.cerberus = this.add.image(650, 550, 'cerberus_singleframe');
        this.cerberus.setDepth(1);
        this.cerberus.setScale(1.5); // Adjust size if needed

        // Create a no-go zone physics body that prevents the player from passing through
        this.noGoZone = this.physics.add.staticGroup();
        this.noGoZone.create(650, 550, 'cerberus_singleframe').setScale(1.5).refreshBody();  // Position it with the cerberus

        // Set collision between the player sprite and the no-go zone
        this.physics.add.collider(this.sprite, this.noGoZone);

        // Drag and drop for inventory items
        this.input.on('dragstart', (pointer, gameObject) => {
            // Scale the item when dragging starts
            gameObject.setScale(0.28);
            gameObject.originalX = gameObject.x;
            gameObject.originalY = gameObject.y;
        });

        this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
            // Update item position as it is being dragged
            gameObject.x = dragX;
            gameObject.y = dragY;
        });

        this.input.on('dragend', (pointer, gameObject) => {
            gameObject.setScale(0.15);  // Restore original size

            const noGoZoneBounds = new Phaser.Geom.Circle(650, 550, 120);
            const pointerInNoGoZone = Phaser.Geom.Circle.Contains(noGoZoneBounds, pointer.x, pointer.y);

            if (pointerInNoGoZone && gameObject.texture.key === 'poppysoakedbone') {
                showMessage("Cerberus accepts the bone, allowing you to proceed!", this);

                // Call the moveNoGoZone function from within the scene's context
                this.moveNoGoZone();
            } else {
                showMessage("You can't drop the item here!", this);
                gameObject.x = gameObject.originalX;
                gameObject.y = gameObject.originalY;
            }
        });
    }

    // Define the moveNoGoZone method here
    moveNoGoZone() {
        const newX = 650 - 200;
        const newY = 550 - 200;

        // Move the Cerberus image to the new position
        this.cerberus.setPosition(newX, newY);

        // Move the no-go zone physics body to the new position
        this.noGoZone.getChildren()[0].setPosition(newX, newY).refreshBody();  // Refresh the static body's position

        console.log("Moved Cerberus and the no-go zone.");
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

        // Transition to dining room if sprite moves beyond 1500 pixels on the right
        if (this.sprite.x > 1390 && !this.hasTransitioned) {
            localStorage.setItem('spriteX', this.sprite.x - 1250);
            localStorage.setItem('spriteY', this.sprite.y);
            this.hasTransitioned = true;
            this.scene.start('CastlePrairie');
        }

        // Transition to dining room if sprite moves beyond 900 pixels on the bottom
        if (this.sprite.y > 900 && !this.hasTransitioned) {
            localStorage.setItem('spriteX', this.sprite.x);
            localStorage.setItem('spriteY', this.sprite.y - 750);
            this.hasTransitioned = true;
            this.scene.start('GFCM');
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
