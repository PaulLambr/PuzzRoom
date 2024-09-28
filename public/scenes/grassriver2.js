class Grassriver2 extends Phaser.Scene {
    constructor() {
        super({ key: 'Grassriver2' });
    }

    preload() {
        // Preload assets
        this.load.image('background_gr2', 'graphics/gplusrwindowsnight.png');
        this.load.image('background_gr2b', 'graphics/gplusrwindowsnightb.png');
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
        console.log('Creating GR2 scene');

        // Initialize variables
        this.torchAddedToInventory = false;
        this.showHashmarks = false;  // Hashmarks toggle
        this.zoneActivated = false;  // Zone activation flag

        // Set the background
        const background = this.add.image(750, 450, 'background_gr2');
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
        checkIntroMessage(this, "Grassriver2", "Night has apparently fallen since your time in the Goblin dungeons. The only light on this lazy river bend appears to emanate from the nearby elm tree.", this);

         // Hashmark debugging graphics
         hashmarkGraphics = this.add.graphics();
         this.input.keyboard.on('keydown-H', toggleHashmarks.bind(this, this));

        // Set current scene
        localStorage.setItem('currentScene', 'Grassriver1');

        // Prevent multiple transitions
        this.hasTransitioned = false;

        // Create an interactive zone at (360, 550, 120, 15)
    const doorZone = this.add.zone(300, 475, 120, 150).setOrigin(0);
    this.physics.world.enable(doorZone);  // Enable physics on the zone
    doorZone.body.setAllowGravity(false);  // Prevent the zone from being affected by gravity
    doorZone.body.setImmovable(true);  // Make the zone immovable

    // Overlap check between sprite and zone
    this.physics.add.overlap(this.sprite, doorZone, () => {
        this.scene.start('Poke');  // Start TreeInterior scene on collision
    }, null, this);

    // Listen for zone click event (if still needed)
    doorZone.setInteractive();
    doorZone.on('pointerdown', () => {
        showMessage("You knock on the door and this time it opens.", this);
        this.add.image(750, 450, 'background_gr2b')
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

        // Transition to dining room if sprite moves beyond 1500 pixels on the right
        if (this.sprite.x < 80 && !this.hasTransitioned) {
            this.sprite.x=80;
            showMessage("You hear wolves howling and decide against venturing further.", this);
        }

         // Transition to dining room if sprite moves beyond 1500 pixels on the right
        if (this.sprite.x > 1400 && !this.hasTransitioned) {
            this.sprite.x=1400;
            showMessage("You hear wolves howling and decide against venturing further.", this);
}
           // Transition to dining room if sprite moves beyond 1500 pixels on the right
           if (this.sprite.y < 106 && !this.hasTransitioned) {
            this.sprite.y=106;
            showMessage("You hear wolves howling and decide against venturing further.", this);
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
