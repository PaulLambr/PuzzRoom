class Cavernthrone2 extends Phaser.Scene {
    constructor() {
        super({ key: 'Cavernthrone2' });
    }

    preload() {
        // Preload assets
        this.load.image('background_ct2', 'graphics/goblin_throneroom_scepter.png');
        this.load.spritesheet('character', 'graphics/grahamprincesspng.png', { frameWidth: 28.5, frameHeight: 70 });
        this.load.spritesheet('goblingirl', 'graphics/goblingirl.png', { frameWidth: 28.5, frameHeight: 70 });
        this.load.image('grak', 'graphics/grak.png'); // Grak guard sprite
        this.load.image('door', 'graphics/door.png'); // Door for interactive zone
        this.load.image('amulet', 'graphics/graks_amulet.png'); // Amulet image
        this.load.image('orb', 'graphics/redorb.png'); // Orb image
    }

    create() {
        console.log('Creating Cavernthrone2 scene');
    
        // Set the background
        const background = this.add.image(750, 450, 'background_ct2');
        background.setDepth(0);
    
        // Initialize the inventory
        createInventory(this);
    
        // Reset message panel if it exists
        if (messagePanel) {
            messagePanel.destroy();
            messagePanel = null;
        }
    
        // Show intro message when entering Cavernthrone2
        checkIntroMessage(this, "Cavernthrone2", "Grak the Goblin King has disappeared.", this);
    
        // Load the sprite's previous coordinates from localStorage, if available
        const savedX = localStorage.getItem('spriteX');
        const savedY = localStorage.getItem('spriteY');
        const startX = savedX ? parseFloat(savedX) : 100;
        const startY = savedY ? parseFloat(savedY) : 525;
    
        // Retrieve isGoblinForm from local storage or set default to false (princess)
        this.isGoblinForm = localStorage.getItem('isGoblinForm') === 'true';
    
        // Create walking animations for both forms
        this.createAnimations();
    
        // Create the main sprite for the player character based on isGoblinForm
        this.sprite = this.physics.add.sprite(startX, startY, this.isGoblinForm ? 'goblingirl' : 'character');
        this.sprite.setScale(3);
        this.sprite.setDepth(1);
        this.sprite.body.collideWorldBounds = true;
    
        // Play the correct animation on creation
        this.sprite.anims.play(this.isGoblinForm ? 'goblinWalk4' : 'walk', true);
    
        // Input cursor keys for controlling the character
        this.cursors = this.input.keyboard.createCursorKeys();
    
        // Input keyboard for transitioning between forms
        this.input.keyboard.on('keydown-T', () => {
            this.toggleForm();
        });
    
        // Create interactive zone for Goblin King (Grak)
        this.goblinKingZone = this.add.zone(610, 15, 200, 250).setOrigin(0, 0);
        this.physics.world.enable(this.goblinKingZone);
        this.goblinKingZone.body.setAllowGravity(false).setImmovable(true);

        // Collision detection between sprite and Goblin King zone
        this.physics.add.overlap(this.sprite, this.goblinKingZone, () => {
            console.log('Collided with Goblin King Zone, transitioning to CastleBedroom scene');
            this.transitionToCastleBedroom();
        });

        // Draw debugging zone around Goblin King interactive zone
        const debugGraphics = this.add.graphics();
        debugGraphics.lineStyle(2, 0xff0000);  // Red outline
        debugGraphics.strokeRect(this.goblinKingZone.x, this.goblinKingZone.y, this.goblinKingZone.width, this.goblinKingZone.height);

        // Call the shard pickup creation function
        this.createShardPickup();
    }

    createShardPickup() {
        const orbX = 450;
        const orbY = 800;
        const pickupRadius = 90;  // Increase pickup radius for easier proximity detection
    
        // Draw the debugging circle where the player can pick up the shard
        const debugGraphics = this.add.graphics();
        debugGraphics.lineStyle(2, 0xff0000, 1);  // Red color with full opacity
        debugGraphics.strokeCircle(orbX, orbY, pickupRadius);  // Draw the circle at the shard's position
    
        // Add a listener for when the player clicks near the shard
        this.input.on('pointerdown', (pointer) => {
            // Log player and shard positions for debugging
            console.log('Player Position:', this.sprite.x, this.sprite.y);
            console.log('Shard Position:', orbX, orbY);
    
            const distance = Phaser.Math.Distance.Between(this.sprite.x, this.sprite.y, orbX, orbY);
    
            console.log('Distance between player and shard:', distance);
    
            if (distance <= pickupRadius) {
                // Log the shard pick up for debugging
                console.log('Player clicked within range of the shard.');
    
                // Add the shard to the inventory (proximity is already checked in the addItem method)
                inventory.addItem({ name: 'redorb', img: 'redorb', x: orbX, y: orbY }, this.sprite);
    
                // Show a message that the shard was picked up
                showMessage("You have picked up the orb at the tip of the Goblin King's scepter.", this);
    
                // Draw a little green box in the shard zone
                const whiteBox = this.add.graphics();
                whiteBox.fillStyle(0x00ff00, 1);  // Set the color to green with full opacity
                whiteBox.fillRect(orbX - 20, orbY - 20, 40, 40);  // Draw the 40x40 box centered at the shard's position
    
                // Optionally, you can stop further pointerdown listeners for this shard after it's picked up
                this.input.off('pointerdown');

                localStorage.setItem('has shard', true);

            } else {
                // If player clicks outside of range, display a too far message
                showMessage("You're too far away to pick up the shard.", this);
                console.log('Player clicked outside of shard pickup range.');
            }
        });
    }
    
    createAnimations() {
        // Remove 'walk' animation if it exists
        if (this.anims.exists('walk')) {
            this.anims.remove('walk');
        }
    
        // Create walking animations for both forms
        if (!this.anims.exists('walk')) {
            this.anims.create({
                key: 'walk',
                frames: this.anims.generateFrameNumbers('character', { start: 0, end: 5 }),
                frameRate: 10,
                repeat: -1
            });
        }
    
        if (this.anims.exists('goblinWalk4')) {
            this.anims.remove('goblinWalk4');
        }
    
        if (!this.anims.exists('goblinWalk4')) {
            this.anims.create({
                key: 'goblinWalk4',
                frames: this.anims.generateFrameNumbers('goblingirl', { start: 0, end: 5 }),
                frameRate: 10,
                repeat: -1
            });
        }
    }
    
    toggleForm() {
        // Toggle the form
        this.isGoblinForm = !this.isGoblinForm;
        
        // Save the updated form to local storage
        localStorage.setItem('isGoblinForm', this.isGoblinForm);
    
        // Stop any currently playing animations
        this.sprite.anims.stop();
    
        // Switch the sprite texture and play the appropriate animation
        if (this.isGoblinForm) {
            this.sprite.setTexture('goblingirl'); // Switch to goblin girl texture
            this.sprite.anims.play('goblinWalk4', true); // Play goblin girl walking animation
        } else {
            this.sprite.setTexture('character'); // Switch to princess texture
            this.sprite.anims.play('walk', true); // Play princess walking animation
        }
    }

    transitionToCastleBedroom() {
        // Save the sprite's position for the next scene
        localStorage.setItem('spriteX', 1000);
        localStorage.setItem('spriteY', 650);
        
        // Start the CastleBedroom scene
        this.scene.start('Grassriver2');
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
                if (!this.sprite.anims.isPlaying || this.sprite.anims.currentAnim.key !== 'goblinWalk4') {
                    this.sprite.anims.play('goblinWalk4', true);  // Play Goblin Girl walking animation
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
