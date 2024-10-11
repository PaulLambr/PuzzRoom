class Cavernbedroom2 extends Phaser.Scene {
    constructor() {
        super({ key: 'Cavernbedroom2' });
    }

    preload() {
        // Preload assets
        this.load.image('background_cbr2', 'graphics/bedroom_goblin_shard.png');
        this.load.spritesheet('character', 'graphics/grahamprincesspng.png', { frameWidth: 28.5, frameHeight: 70 });
        this.load.spritesheet('goblingirl', 'graphics/goblingirl.png', { frameWidth: 28.5, frameHeight: 70 });
        this.load.image('grak', 'graphics/grak.png'); // Grak guard sprite
        this.load.image('door', 'graphics/door.png'); // Door for interactive zone
        this.load.image('amulet', 'graphics/graks_amulet.png'); // Amulet image
        this.load.image('mirrorshard', 'graphics/shard.png'); // Mirror shard image
    }

    create() {
        console.log('Creating Cavernbedroom2 scene');
    
        // Set the background
        const background = this.add.image(750, 450, 'background_cbr2');
        background.setDepth(0);
    
        // Initialize the inventory
        createInventory(this);
    
        // Reset message panel if it exists
        if (messagePanel) {
            messagePanel.destroy();
            messagePanel = null;
        }
    
        // Show intro message when entering Cavernhall
        checkIntroMessage(this, "Cavernbedroom2", "You have regained your true self, and yet another magic mirror broken. How many years of bad luck is this now? 50?", this);

        // Debugging graphics for hashmarks
        hashmarkGraphics = this.add.graphics();
        this.input.keyboard.on('keydown-H', toggleHashmarks.bind(this, this));

        // Load the sprite's previous coordinates from localStorage, if available
        const savedX = localStorage.getItem('spriteX');
        const savedY = localStorage.getItem('spriteY');
        const startX = savedX ? parseFloat(savedX) : 100;
        const startY = savedY ? parseFloat(savedY) : 525;

        // Force the sprite to default to princess (character) on load
        this.isGoblinForm = false;
        localStorage.setItem('isGoblinForm', false);

        // Create the main sprite as princess
        this.sprite = this.physics.add.sprite(startX, startY, 'character');
        this.sprite.setScale(3);
        this.sprite.setDepth(1);
        this.sprite.body.collideWorldBounds = true;
    
        // Play the princess animation on creation
        this.sprite.anims.play('walk', true);
    
        // Input cursor keys for controlling the character
        this.cursors = this.input.keyboard.createCursorKeys();
         // Check if the shard has already been collected
    const hasShard = localStorage.getItem('has shard') === 'true';

    if (hasShard) {
        // If shard has already been collected, display the green box only
        this.showGreenBox(670, 470);  // Show the green box where the shard was
    } else {
        // Otherwise, create the shard object for pickup
        this.createShardPickup();
    }
}

    createShardPickup() {
        const shardX = 670;
        const shardY = 470;
        const pickupRadius = 90;  // Increase pickup radius for easier proximity detection
    
       /* // Draw the debugging circle where the player can pick up the shard
        const debugGraphics = this.add.graphics();
        debugGraphics.lineStyle(2, 0xff0000, 1);  // Red color with full opacity
        debugGraphics.strokeCircle(shardX, shardY, pickupRadius);  // Draw the circle at the shard's position */
    
        // Add a listener for when the player clicks near the shard
        this.input.on('pointerdown', (pointer) => {
            // Log player and shard positions for debugging
            console.log('Player Position:', this.sprite.x, this.sprite.y);
            console.log('Shard Position:', shardX, shardY);
    
            const distance = Phaser.Math.Distance.Between(this.sprite.x, this.sprite.y, shardX, shardY);
    
            console.log('Distance between player and shard:', distance);
    
            if (distance <= pickupRadius) {
                // Log the shard pick up for debugging
                console.log('Player clicked within range of the shard.');
    
                // Add the shard to the inventory (proximity is already checked in the addItem method)
                inventory.addItem({ name: 'mirrorshard', img: 'mirrorshard', x: shardX, y: shardY }, this.sprite);
    
                // Show a message that the shard was picked up
                showMessage("You have picked up a shard of the broken mirror.", this);
    
                // Draw a little green box in the shard zone
                const greenBox = this.add.graphics();
                greenBox.fillStyle(0x019051, 1);  // Set the color to green with full opacity
                greenBox.fillRect(shardX - 20, shardY - 10, 40, 65);  // Draw the 25x25 box centered at the shard's position
    
                // Optionally, you can stop further pointerdown listeners for this shard after it's picked up
                this.input.off('pointerdown');

                localStorage.setItem('has shard', true)

            } else {
                // If player clicks outside of range, display a too far message
                showMessage("You're too far away to pick up the shard.", this);
                console.log('Player clicked outside of shard pickup range.');
            }
        });
    }
    
    // Function to display the green box
    showGreenBox(x, y) {
        const greenBox = this.add.graphics();
        greenBox.fillStyle(0x019051, 1);  // Set the color to green with full opacity
        greenBox.fillRect(x - 20, y - 10, 40, 65);  // Draw the 40x40 box centered at the specified position
    }

    
    

    update() {
        console.log(this.sprite.anims.currentAnim ? this.sprite.anims.currentAnim.key : 'No animation playing');
    
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
    
        // Play the correct walking animation if moving
        if (moving && !this.sprite.anims.isPlaying) {
            this.sprite.anims.play('walk', true);
        } else if (!moving) {
            this.sprite.anims.stop();
            this.sprite.setFrame(1);  // Reset to idle frame
        }
    
        // Scene transition logic (example)
        if (this.sprite.x < 150) {
            console.log('Transitioning to Cavernhall2 scene');
            localStorage.setItem('spriteX', 1300);  // Save the sprite's position for the next scene
            localStorage.setItem('spriteY', 250);
            this.scene.start('Caverntower2');
        }
    }
}
