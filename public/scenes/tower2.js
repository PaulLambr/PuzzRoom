class Tower2 extends Phaser.Scene {
    constructor() {
        super({ key: 'Tower2' });
    }

    preload() {
        // Preload assets
        this.load.image('backgroundTower2', 'graphics/tower.png'); // Unique background for Tower2
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
        console.log('Creating Tower2 Scene');
        this.add.image(750, 450, 'backgroundTower2'); // Set unique background for Tower2

        // Load saved sprite position or set a default position
        const savedX = localStorage.getItem('spriteX');
        const savedY = localStorage.getItem('spriteY');
        const startX = savedX ? parseFloat(savedX) : 100;
        const startY = savedY ? parseFloat(savedY) : 525;

        // Initialize sprite with saved or default position
        this.sprite = this.physics.add.sprite(startX, startY, 'character');
        this.sprite.setScale(3);

        // Animation for walking
        this.anims.create({
            key: 'walk',
            frames: this.anims.generateFrameNumbers('character', { start: 0, end: 5 }),
            frameRate: 10,
            repeat: -1
        });

        // Input cursor keys for controlling the character
        this.cursors = this.input.keyboard.createCursorKeys();

        // Create interactive torch zone
        const torchZone = this.add.zone(680, 150, 100, 200).setRectangleDropZone(100, 200);
        torchZone.setInteractive();
        torchZone.on('pointerdown', () => {
            showMessage("This torch is firmly cemented in place.", this);
        });

        // Create interactive zone for transition to a new scene
        const rectangleZone2 = this.add.zone(1350, 50, 200, 50);
        this.physics.world.enable(rectangleZone2);
        rectangleZone2.body.setAllowGravity(false);
        rectangleZone2.body.moves = false;

        // Overlap logic for transitioning to the next scene
        this.physics.add.overlap(this.sprite, rectangleZone2, this.transitionToHall, null, this);

        // Create the inventory for Tower2
        console.log("Initializing Inventory in Tower2");
        createInventory(this);  // Initialize inventory panel and items
        inventory.updateInventoryDisplay();  // This will make items draggable and interactive

        // Debugging to check if drag-and-drop is working
        console.log("Items in Inventory:", inventory.items);
        inventory.items.forEach((item) => {
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

        // Show intro message when entering Tower2
        checkIntroMessage(this, "tower2", "You've reached another level in the tower. The atmosphere feels ominous.");

        // Reset transition state
        this.hasTransitioned = false;
        localStorage.setItem('currentScene', 'Tower2');
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

        // Play walking animation if moving
        if (moving) {
            this.sprite.anims.play('walk', true);
        } else {
            this.sprite.setVelocity(0, 0);
            this.sprite.anims.stop();
            this.sprite.setFrame(1); // Stand still when not moving
        }
        
    // Transition back to Tower1 when moving beyond the left side of the screen
    if (this.sprite.x < 0 && !this.hasTransitioned) {
        console.log('Transitioning to Tower1 Scene');
        // Save the sprite's position for Tower1
        localStorage.setItem('spriteX', 1350); // Adjust as needed
        localStorage.setItem('spriteY', this.sprite.y); // Keep the same Y coordinate
        this.hasTransitioned = true;
        this.scene.stop('Tower2');  // Stop the current scene
        this.scene.start('Tower'); // Transition to Tower1
    }
}

// Transition to the Hall scene (optional)
transitionToHall() {
    if (!this.hasTransitioned) {
        console.log('Transitioning to Hall Scene');
        localStorage.setItem('spriteX', 100); // Set new position for Hall
        localStorage.setItem('spriteY', 550); // Set new position for Hall
        this.hasTransitioned = true;
        this.scene.stop('Tower2');  // Stop the current scene
        this.scene.start('Hall'); // Replace 'Hall' with the next scene's key
    }
}
}