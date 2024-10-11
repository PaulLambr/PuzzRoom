class GFinalSwamp extends Phaser.Scene {
    constructor() {
        super({ key: 'GFinalSwamp' });
    }

    preload() {
        // Preload assets
        this.load.image('background_gfs', 'graphics/gfinalswamp.png');
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
        console.log('Creating GFinalSwamp scene');

        // Initialize variables
        this.torchAddedToInventory = false;
        this.showHashmarks = false;  // Hashmarks toggle
        this.zoneActivated = false;  // Zone activation flag

        // Set the background
        const background = this.add.image(750, 450, 'background_gfs');
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
        checkIntroMessage(this, "GFinalSwamp", "A corn field begins in the southwest corner. It looks like an impenetrable swamp to the east.", this);

        // Hashmark debugging graphics
        this.hashmarkGraphics = this.add.graphics();

        // Toggle hashmarks with the 'H' key
        this.input.keyboard.on('keydown-H', () => toggleHashmarks(this));

        // Set current scene
        localStorage.setItem('currentScene', 'GFinalSwamp');

        // Prevent multiple transitions
        this.hasTransitioned = false;

        // Create a no-go zone (1 pixel high, 850 pixels wide, from x: 650 to x: 1500)
const noGoZone = this.add.zone(1300, 450, 1, 900).setOrigin(0.5, 0.5);  // Positioned at the center of the zone
this.physics.add.existing(noGoZone, true);  // Add physics to the zone (static)

// Add collision between the sprite and the no-go zone
this.physics.add.collider(this.sprite, noGoZone);

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
        if (this.sprite.x < 70 && !this.hasTransitioned) {
            localStorage.setItem('spriteX', this.sprite.x + 1300);
            localStorage.setItem('spriteY', this.sprite.y);
            this.hasTransitioned = true;
            this.scene.start('G3grasslandcorn');
        }
        
        // Transition to dining room if sprite moves beyond 1500 pixels on the right
        if (this.sprite.y > 775 && !this.hasTransitioned) {
            localStorage.setItem('spriteX', this.sprite.x);
            localStorage.setItem('spriteY', this.sprite.y-600);
            this.hasTransitioned = true;
            this.scene.start('Poke');
        }

         // Transition to dining room if sprite moves beyond 1500 pixels on the right
         if (this.sprite.y < 106 && !this.hasTransitioned) {
            localStorage.setItem('spriteX', this.sprite.x);
            localStorage.setItem('spriteY', this.sprite.y+650);
            this.hasTransitioned = true;
            this.scene.start('G1grasslandswamp');
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
