class CastlePrairie extends Phaser.Scene {
    constructor() {
        super({ key: 'CastlePrairie' });
    }

    preload() {
        // Preload assets
        this.load.image('background_castleprairie', 'graphics/castleprairie.png');
        this.load.image('rockprairie', 'graphics/rock_prairie.png');
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
        console.log('Creating Castle Prairie Scene');

        // Initialize variables
        this.torchAddedToInventory = false;
        this.showHashmarks = false;  // Hashmarks toggle
        this.zoneActivated = false;  // Zone activation flag

        // Set the background
        const background = this.add.image(750, 450, 'background_castleprairie');
        background.setDepth(0);

        // Add the rock image and enable physics
        this.rock = this.physics.add.image(250, 750, 'rockprairie');
        this.rock.setDepth(2);
        this.rock.body.setImmovable(true);

        // Create rock bounds using Phaser Geom.Rectangle
        this.rockBounds = new Phaser.Geom.Rectangle(
            this.rock.x - this.rock.displayWidth / 2,
            this.rock.y - this.rock.displayHeight / 2,
            this.rock.displayWidth,
            this.rock.displayHeight
        );

        // Create the circular interactive zone (invisible)
        this.zoneBody = this.physics.add.staticImage(240, 770, null);
        this.zoneBody.setCircle(85);  // Set circular bounds
        this.zoneBody.visible = false;  // Make it invisible

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
        checkIntroMessage(this, "CastlePrairie", "That was a very long tunnel. Who knows how long the goblins were working on it and for what purpose?", this);

        // Hashmark debugging graphics
        this.hashmarkGraphics = this.add.graphics();

        // Toggle hashmarks with the 'H' key
        this.input.keyboard.on('keydown-H', () => toggleHashmarks(this));

        // Set current scene
        localStorage.setItem('currentScene', 'CastlePrairie');

        // Prevent multiple transitions
        this.hasTransitioned = false;
    }

    handleZoneOverlap() {
        if (!this.hasTransitioned && this.zoneActivated) {
            console.log("Overlapping with the interactive zone... transitioning to the Cellar");
            localStorage.setItem('spriteX', 1350);  // Set new position for the next scene
            localStorage.setItem('spriteY', 500);
            this.hasTransitioned = true;
            this.scene.start('Cellar');
        }
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
        if (this.sprite.x > 1500 && !this.hasTransitioned) {
            localStorage.setItem('spriteX', this.sprite.x - 1480);
            localStorage.setItem('spriteY', this.sprite.y);
            this.hasTransitioned = true;
            this.scene.start('DiningRoom');
        }

        // Transition to Tower2 if sprite moves beyond the left side (x < 0)
        if (this.sprite.x < 0 && !this.hasTransitioned) {
            localStorage.setItem('spriteX', 1350);
            localStorage.setItem('spriteY', 500);
            this.hasTransitioned = true;
            this.scene.start('Cellar');
        }

        // Check if the player leaves the rock's bounds
        if (!Phaser.Geom.Rectangle.Contains(this.rockBounds, this.sprite.x, this.sprite.y)) {
            if (!this.zoneActivated) {
                console.log("Player has exited the rock bounds. The zone is now active.");

                // Now activate the circular zone for overlap detection
                this.zoneActivated = true;
                this.zoneBody.visible = true;  // Make the zone visible (optional)
                this.physics.add.overlap(this.sprite, this.zoneBody, this.handleZoneOverlap, null, this);
            }
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
