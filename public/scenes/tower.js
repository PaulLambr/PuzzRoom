class Tower extends Phaser.Scene {
    constructor() {
        super({ key: 'Tower' });
    }

        preload() {
            this.load.image('background', 'graphics/tower.png'); // Ensure the path is correct
            
            // Add logging to verify preload
            this.load.on('filecomplete-image-background', () => {
                console.log('Background image loaded');
            });
        this.load.image('parchment_bg', 'graphics/parchment_bg.png');
        this.load.spritesheet('character', 'graphics/grahamprincesspng.png', { frameWidth: 28.5, frameHeight: 70 });
        this.load.image('amulet', 'graphics/graks_amulet.png');
        this.load.image('rope', 'graphics/rope.png');
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
       
        this.add.image(750, 450, 'background'); // Center the background in the game window
     

        // Load the sprite's previous coordinates from localStorage, if available
        const savedX = localStorage.getItem('spriteX');
        const savedY = localStorage.getItem('spriteY');
        const startX = savedX ? parseFloat(savedX) : 100;
        const startY = savedY ? parseFloat(savedY) : 525;

        this.sprite = this.physics.add.sprite(startX, startY, 'character');
        this.sprite.setScale(3); // Scale up the sprite

        this.anims.create({
            key: 'walk',
            frames: this.anims.generateFrameNumbers('character', { start: 0, end: 5 }),
            frameRate: 10,
            repeat: -1
        });

        this.cursors = this.input.keyboard.createCursorKeys();

        // Interactive torch zone
        const torchZone = this.add.zone(680, 150, 100, 200).setRectangleDropZone(100, 200);
        torchZone.setInteractive();
        torchZone.on('pointerdown', () => {
            showMessage("This torch is firmly cemented in place.", this);
        });

        // Create the rectangle zone as a physics object for collision
        const rectangleZone2 = this.add.zone(1350, 50, 200, 50);
        this.physics.world.enable(rectangleZone2);
        rectangleZone2.body.setAllowGravity(false);
        rectangleZone2.body.moves = false;

        // Check for overlap between sprite and zone to transition
        this.physics.add.overlap(this.sprite, rectangleZone2, this.transitionToTower2, null, this);

        // Initialize the inventory system
        createInventory(this);

        // Initialize hashmark functionality
        this.hashmarkGraphics = this.add.graphics();

        // Add a key listener to toggle hashmarks with the 'H' key
        this.input.keyboard.on('keydown-H', toggleHashmarks, this);

    

        // Display a test message in the message panel
        checkIntroMessage(this, "tower1", "The sounds are louder out here in the tower stairwell. They seem to be coming from below where the throne room and other royal apartments are.", this);
    }

    update() {
        let moving = false;

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

        // Transition to another scene when reaching certain coordinates
        if (this.sprite.x < 0 && !this.hasTransitioned) {
            this.transitionToCastleBedroom();
        }

        if (moving) {
            this.sprite.anims.play('walk', true);
        } else {
            this.sprite.setVelocity(0, 0);
            this.sprite.anims.stop();
            this.sprite.setFrame(1);
        }
    }

    transitionToTower2() {
        if (!this.hasTransitioned) {
            // Save the sprite's current coordinates before transitioning
            localStorage.setItem('spriteX', this.sprite.x - 1200);
            localStorage.setItem('spriteY', this.sprite.y);
            this.hasTransitioned = true;
            this.scene.start('Tower2'); // Transition to Tower2 scene
        }
    }

    transitionToCastleBedroom() {
        if (!this.hasTransitioned) {
            // Save the sprite's current coordinates before transitioning
            localStorage.setItem('spriteX', this.sprite.x + 1480);
            localStorage.setItem('spriteY', this.sprite.y);
            this.hasTransitioned = true;
            this.scene.start('CastleBedroom'); // Transition to CastleBedroom scene
        }
    }
}
localStorage.setItem('currentScene', '/tower1');
