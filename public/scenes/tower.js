class Tower extends Phaser.Scene {
    constructor() {
        super({ key: 'Tower' });
    }

    preload() {
        this.load.image('backgroundTower', 'graphics/tower.png');
        this.load.image('parchment_bg', 'graphics/parchment_bg.png');
        this.load.spritesheet('character', 'graphics/grahamprincesspng.png', { frameWidth: 28.5, frameHeight: 70 });
        this.load.image('amulet', 'graphics/graks_amulet.png');
        this.load.image('rope', 'graphics/rope.png');
        this.load.image('mirror', 'graphics/mirror.png');

        // Load additional inventory items from inventory-library.json
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

        // Use animationManager to create animations globally
animationManager.createAnimations(this);

        console.log('Creating Tower Scene');  
        this.add.image(750, 450, 'backgroundTower'); // Set tower background

        // Load saved sprite position, or default to initial position
        const savedX = localStorage.getItem('spriteX');
        const savedY = localStorage.getItem('spriteY');
        const startX = savedX ? parseFloat(savedX) : 100;
        const startY = savedY ? parseFloat(savedY) : 525;

        // Initialize sprite with saved or default position
        this.sprite = this.physics.add.sprite(startX, startY, 'character');
        this.sprite.setScale(3);

        this.sprite.anims.play('walk', true);

        // Input cursor keys for controlling the character
        this.cursors = this.input.keyboard.createCursorKeys();

        // Create interactive torch zone
        const torchZone = this.add.zone(680, 150, 100, 200).setRectangleDropZone(100, 200);
        torchZone.setInteractive();
        torchZone.on('pointerdown', () => {
            showMessage("This torch is firmly cemented in place.", this);
        });

        // Create transition zone to another area
        const rectangleZone2 = this.add.zone(1350, 50, 200, 50);
        this.physics.world.enable(rectangleZone2);
        rectangleZone2.body.setAllowGravity(false);
        rectangleZone2.body.moves = false;

        // Overlap logic for transitioning between zones
        this.physics.add.overlap(this.sprite, rectangleZone2, this.transitionToTower2, null, this);

        // Create the inventory for the Tower scene
        console.log("Initializing Inventory in Tower");
        createInventory(this);  // Initialize inventory panel and items
        inventory.updateInventoryDisplay();  // This will make items draggable and interactive

        // Debugging to check if drag-and-drop is working
        console.log("Items in Inventory:", inventory.items);
        inventory.items.forEach((item, index) => {
            console.log("Item:", item.name);
        });

        // Hashmark debugging graphics
        this.hashmarkGraphics = this.add.graphics();

        // Toggle hashmarks with the 'H' key
        this.input.keyboard.on('keydown-H', toggleHashmarks, this);

        // Clear any existing message panel if it exists
        if (messagePanel) {
            messagePanel.destroy();
            messagePanel = null;
        }

        // Show intro message when entering the Tower
        checkIntroMessage(this, "Tower", "The sounds are louder out here in the tower stairwell. They seem to be coming from below where the throne room and other royal apartments are.");

        // Reset transition state
        this.hasTransitioned = false;
        localStorage.setItem('currentScene', 'Tower');
    }

    update() {
        let moving = false;

        // Left movement
        if (this.cursors.left.isDown) {
            this.sprite.setVelocityX(-200);
            this.sprite.setFlipX(true); // Flip the sprite when moving left
            moving = true;
        } 
        // Right movement
        else if (this.cursors.right.isDown) {
            this.sprite.setVelocityX(200);
            this.sprite.setFlipX(false); // Face right when moving right
            moving = true;
        } else {
            this.sprite.setVelocityX(0); // Stop horizontal movement
        }

        // Up movement
        if (this.cursors.up.isDown) {
            this.sprite.setVelocityY(-200);
            moving = true;
        } 
        // Down movement
        else if (this.cursors.down.isDown) {
            this.sprite.setVelocityY(200);
            moving = true;
        } else {
            this.sprite.setVelocityY(0); // Stop vertical movement
        }

        // Check for transition to the CastleBedroom scene
        if (this.sprite.x < 0 && !this.hasTransitioned) {
            this.transitionToCastleBedroom();
        }

        // Play walking animation if moving
        if (moving) {
            this.sprite.anims.play('walk', true);
        } else {
            this.sprite.setVelocity(0, 0);
            this.sprite.anims.stop();
            this.sprite.setFrame(1); // Stand still when not moving
        }
    }

    // Transition to CastleBedroom
    transitionToCastleBedroom() {
        if (!this.hasTransitioned) {
            localStorage.setItem('spriteX', this.sprite.x + 1480); // Adjust sprite position for transition
            localStorage.setItem('spriteY', this.sprite.y);
            this.hasTransitioned = true;
            this.scene.start('CastleBedroom'); // Start CastleBedroom scene
        }
        
    }
    transitionToTower2() {
        console.log('Transitioning to Tower2');
        this.hasTransitioned = true; // Set the transition flag to prevent multiple transitions
    
        // Optionally save the player's position if needed for Tower2
        localStorage.setItem('spriteX', 100); // Set new position for Tower2
        localStorage.setItem('spriteY', 525); // Set new position for Tower2
    
        // Start the Tower2 scene
        this.scene.stop('Tower');  // Stop the current scene
        this.scene.start('Tower2');
    }
}
