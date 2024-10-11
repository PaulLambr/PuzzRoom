class G3grasslandcorn extends Phaser.Scene {
    constructor() {
        super({ key: 'G3grasslandcorn' });
    }

    preload() {
        // Preload assets
        this.load.image('background_g3', 'graphics/g3.png');
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
        console.log('Creating G1 scene');

        // Initialize variables
        this.torchAddedToInventory = false;
        this.showHashmarks = false;  // Hashmarks toggle
        this.zoneActivated = false;  // Zone activation flag

        // Set the background
        const background = this.add.image(750, 450, 'background_g3');
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

       // Before defining the animation, check if it already exists
if (!this.anims.exists('walk')) {
    this.anims.create({
        key: 'walk',
        frames: this.anims.generateFrameNumbers('character', { start: 0, end: 5 }),
        frameRate: 10,
        repeat: -1
    });
}
;

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
        checkIntroMessage(this, "G3grasslandcorn", "Hm. Some more prairie and the beginnings of a corn field in the southeast corner", this);

        // Hashmark debugging graphics
        this.hashmarkGraphics = this.add.graphics();

        // Toggle hashmarks with the 'H' key
        this.input.keyboard.on('keydown-H', () => toggleHashmarks(this));

        // Set current scene
        localStorage.setItem('currentScene', 'G3grasslandcorn');

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

        // Transition to dining room if sprite moves beyond 1500 pixels on the right
        if (this.sprite.y < 106 && !this.hasTransitioned) {
            localStorage.setItem('spriteX', this.sprite.x);
            localStorage.setItem('spriteY', this.sprite.y + 700);
            this.hasTransitioned = true;
            this.scene.start('CastlePrairie');
        }

        // Transition to another scene if sprite moves beyond 1550 pixels on the Y axis
        if (this.sprite.y > 900 && !this.hasTransitioned) {
            console.log('Transitioning to G3grasslandcorn scene');
            localStorage.setItem('spriteX', this.sprite.x);
            localStorage.setItem('spriteY', this.sprite.y - 775);
            this.hasTransitioned = true;
            this.scene.start('ShoreRiver1');
        }

// Transition to another scene if sprite moves beyond 1550 pixels on the Y axis
if (this.sprite.x > 1390 && !this.hasTransitioned) {
    console.log('Transitioning to G3grasslandcorn scene');
    localStorage.setItem('spriteX', this.sprite.x - 1200);
    localStorage.setItem('spriteY', this.sprite.y);
    this.hasTransitioned = true;
    this.scene.start('GFinalSwamp');
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
