class Cavernhall extends Phaser.Scene {
    constructor() {
        super({ key: 'Cavernhall' });
    }

    preload() {
        // Preload assets
        this.load.image('background_c3', 'graphics/cavern.png');
        this.load.spritesheet('character', 'graphics/grahamprincesspng.png', { frameWidth: 28.5, frameHeight: 70 });
        this.load.spritesheet('goblingirl', 'graphics/goblingirl.png', { frameWidth: 28.5, frameHeight: 70 });
        this.load.image('grak', 'graphics/grak.png'); // Grak guard sprite
        this.load.image('door', 'graphics/door.png'); // Door for interactive zone
        this.load.image('amulet', 'graphics/amulet.png'); // Amulet image
    }

    create() {
        console.log('Creating Cavernhall scene');

        // Set the background
        const background = this.add.image(750, 450, 'background_c3');
        background.setDepth(0);

        // Initialize the inventory
        createInventory(this);

        // Reset message panel if it exists
        if (messagePanel) {
            messagePanel.destroy();
            messagePanel = null;
        }

        // Show intro message when entering Cavernhall
        checkIntroMessage(this, "Cavernhall", "The swamp continues to run eastward.", this);

        // Set the sprite to appear in the middle of the canvas
        const startX = 750; // Center X of the canvas
        const startY = 450; // Center Y of the canvas

        // Retrieve isGoblinForm from local storage or set default to false (princess)
        this.isGoblinForm = localStorage.getItem('isGoblinForm') === 'true';

        // Create the main sprite for the player character based on isGoblinForm
        if (this.isGoblinForm) {
            this.sprite = this.physics.add.sprite(startX, startY, 'goblingirl');
            this.sprite.anims.play('goblinWalk', true); // Play goblin girl walking animation
        } else {
            this.sprite = this.physics.add.sprite(startX, startY, 'character');
            this.sprite.anims.play('walk', true); // Play princess walking animation
        }
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

        // Input keyboard for transitioning between forms
        this.input.keyboard.on('keydown-T', () => {
            this.toggleForm();
        });

        // Add Grak the guard sprite at the defined position
        this.grak = this.add.sprite(550, 260, 'grak').setScale(1.5);
        
        // Convert Grak to an interactive zone with radius 100
        this.grakZone = this.add.zone(550, 260, 200, 200).setCircleDropZone(100);
        this.physics.add.existing(this.grakZone, true);

        // Enable interaction with Grak
        this.grakZone.setInteractive();
        
        // Create an interactive zone near the door
        this.createInteractiveZones();

        // Create amulet object for dragging
        this.createAmulet();
    }

    toggleForm() {
        // Toggle the form
        this.isGoblinForm = !this.isGoblinForm;

        // Save the updated form to local storage
        localStorage.setItem('isGoblinForm', this.isGoblinForm);

        // Switch the sprite to either goblin girl or princess
        if (this.isGoblinForm) {
            this.sprite.setTexture('goblingirl'); // Switch to goblin girl texture
            this.sprite.anims.play('goblinWalk', true); // Play goblin girl walking animation
        } else {
            this.sprite.setTexture('character'); // Switch back to princess texture
            this.sprite.anims.play('walk', true); // Play princess walking animation
        }
    }

    createInteractiveZones() {
        // Create door interactive zone
        const doorZone = this.add.zone(350, 175, 220, 250).setRectangleDropZone(175, 250);
        this.physics.add.existing(doorZone, true);
        const doorImage = this.add.image(350, 175, 'door').setScale(1);
        doorZone.setInteractive();
        doorZone.on('pointerdown', () => {
            showMessage("You hear goblin revelry.", this);
        });
    }

    createAmulet() {
        // Create the amulet sprite and make it draggable
        const amulet = this.add.sprite(100, 100, 'amulet').setScale(1.5);
        amulet.setInteractive({ draggable: true });

        this.input.setDraggable(amulet);

        this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
            gameObject.x = dragX;
            gameObject.y = dragY;
        });

        // Check for drag drop over Grak zone
        this.input.on('dragend', (pointer, gameObject) => {
            if (Phaser.Geom.Intersects.CircleToRectangle(this.grakZone.input.hitArea, gameObject.getBounds())) {
                this.sprite.setTexture('goblingirl'); // Change to goblin girl when amulet is dropped on Grak
                this.sprite.anims.play('goblinWalk', true); // Play goblin girl walking animation
                showMessage("Grak acknowledges your transformation.", this);
            }
        });
    }

    update() {
        let moving = false;

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
            if (this.isGoblinForm) {
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

//this needs work
