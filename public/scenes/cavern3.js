class Cavernhall extends Phaser.Scene {
    constructor() {
        super({ key: 'Cavernhall' });
    }

    preload() {
        // Preload assets
        this.load.image('background_c3', 'graphics/cavern.png');
        this.load.image('mirror', 'graphics/mirror.png');
        this.load.image('torch', 'graphics/torch.png');
        this.load.spritesheet('character', 'graphics/grahamprincesspng.png', { frameWidth: 28.5, frameHeight: 70 });
        this.load.spritesheet('goblingirl', 'graphics/goblingirl.png', { frameWidth: 28.5, frameHeight: 70 });
        this.load.spritesheet('goblinKing', 'graphics/goblin.png', { frameWidth: 28.5, frameHeight: 70 });
        this.load.image('parchment_bg', 'graphics/parchment_bg.png');
        this.load.image('amulet', 'graphics/graks_amulet.png');
        this.load.image('silversword', 'graphics/silver_sword.png');
        this.load.image('door', 'graphics/door.png');
        this.load.image('grak', 'graphics/grak.png');

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
        console.log('Creating C3 scene');
    
        // Initialize variables
        this.torchAddedToInventory = false;
        this.showHashmarks = false;  // Hashmarks toggle
        this.zoneActivated = false;  // Zone activation flag
    
        // Set the background
        const background = this.add.image(750, 450, 'background_c3');
        background.setDepth(0);
    
        // Load sprite position from localStorage or set default
        const savedX = localStorage.getItem('spriteX');
        const savedY = localStorage.getItem('spriteY');
        const startX = savedX ? parseFloat(savedX) : 100;
        const startY = savedY ? parseFloat(savedY) : 850;  // Character starts behind the rock
    
        // Retrieve transformation state from localStorage (or set to default if not available)
        const isGoblinForm = localStorage.getItem('isGoblinForm') === 'true'; // Boolean flag
    
        // Create the main sprite for the player character
        this.sprite = this.physics.add.sprite(startX, startY, isGoblinForm ? 'goblingirl' : 'character');
        this.sprite.setScale(3);
        this.sprite.setDepth(1);
        this.sprite.body.collideWorldBounds = true;
    
        // Create walking animations for both forms
        this.anims.create({
            key: 'walk',
            frames: this.anims.generateFrameNumbers('character', { start: 0, end: 5 }),
            frameRate: 10,
            repeat: -1
        });
    
        this.anims.create({
            key: 'goblinWalk',
            frames: this.anims.generateFrameNumbers('goblingirl', { start: 0, end: 5 }),
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
    
        // Show intro message when entering Cavernhall
        checkIntroMessage(this, "Cavernhall", "AAGH.", this);
    
        // Hashmark debugging graphics
        hashmarkGraphics = this.add.graphics();
        this.input.keyboard.on('keydown-H', toggleHashmarks.bind(this, this));
    
        // Set current scene
        localStorage.setItem('currentScene', 'Cavernhall');
    
        // Prevent multiple transitions
        this.hasTransitioned = false;
    
        // Ensure the correct animation plays depending on the form
        if (isGoblinForm) {
            this.sprite.anims.play('goblinWalk', true);
        }
    }
    
    update() {
        let moving = false;
    
        // Retrieve the current form from localStorage (in case it's updated dynamically)
        const isGoblinForm = localStorage.getItem('isGoblinForm') === 'true';
    
        // Character movement logic
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
    
        // Play the correct walking animation based on the current form
        if (moving) {
            if (isGoblinForm) {
                if (!this.sprite.anims.isPlaying || this.sprite.anims.currentAnim.key !== 'goblinWalk') {
                    this.sprite.anims.play('goblinWalk', true);  // Play Goblin Girl walking animation
                }
            } else {
                if (!this.sprite.anims.isPlaying || this.sprite.anims.currentAnim.key !== 'walk') {
                    this.sprite.anims.play('walk', true);  // Play Princess walking animation
                }
            }
        } else {
            this.sprite.setVelocity(0, 0);
            this.sprite.anims.stop();
            this.sprite.setFrame(1);  // Reset to idle frame
        }
    }
}    