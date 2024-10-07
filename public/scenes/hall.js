class Hall extends Phaser.Scene {
    constructor() {
        super({ key: 'Hall' });  // Define the scene key for the Hall
    }

    preload() {
        // Preload assets for the Hall scene
        this.load.image('backgroundhall', 'graphics/hallway.png');
        this.load.image('parchment_bg', 'graphics/parchment_bg.png');
        this.load.spritesheet('character', 'graphics/grahamprincesspng.png', { frameWidth: 28.5, frameHeight: 70 });
        this.load.image('amulet', 'graphics/graks_amulet.png');
        this.load.image('torch', 'graphics/torch.png');
        this.load.image('mirror', 'graphics/mirror.png');

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
        console.log('Creating Hall Scene');

        // Declare torchAddedToInventory
        this.torchAddedToInventory = false; // Track if the torch has been added to the inventory

        // Set the background image for the Hall scene
        this.add.image(750, 450, 'backgroundhall'); // Adjust coordinates as necessary

        // Load sprite position from localStorage or set default
        const savedX = localStorage.getItem('spriteX');
        const savedY = localStorage.getItem('spriteY');
        const startX = savedX ? parseFloat(savedX) : 100;
        const startY = savedY ? parseFloat(savedY) : 525;

        // Create the main sprite for the player character
        this.sprite = this.physics.add.sprite(startX, startY, 'character');
        this.sprite.setScale(3);

        // Check if the walk animation exists before attempting to play it
    if (this.anims.exists('walk')) {
        this.sprite.anims.play('walk', true); // Play the walking animation
    } else {
        console.error("Animation 'walk' does not exist");
    }

        // Input cursor keys for controlling the character
        this.cursors = this.input.keyboard.createCursorKeys();

        // Create interactive zone for the torch
        // Create interactive zone for the torch
const rectangleZone = this.add.zone(650, 200, 135, 240).setRectangleDropZone(135, 240);
rectangleZone.setInteractive();
rectangleZone.on('pointerdown', () => {
    if (!torchAddedToInventory) {
        // Call addItem to handle proximity check and inventory addition
        inventory.addItem({ name: 'torch', img: 'torch', x: 650, y: 350 }, this.sprite);

        // Only proceed with the success logic if the torch is successfully added to the inventory
        if (inventory.items.find(item => item.name === 'torch')) {
            showMessage("The torch holder was a little loose. You wrench it free.", this);
            const brownBoxGraphics = this.add.graphics();
            brownBoxGraphics.fillStyle(0xba71d8, 1);
            brownBoxGraphics.fillRect(560, 73, 165, 240); // Draw the brown box
            rectangleZone.destroy(); // Remove the torch zone
            torchAddedToInventory = true;
        }
    }
});

        // Create another zone for interaction with a fixed torch
        const rectangleZone2 = this.add.zone(1360, 200, 135, 240).setRectangleDropZone(135, 240);
        rectangleZone2.setInteractive();
        rectangleZone2.on('pointerdown', () => {
            showMessage("This torch is firmly cemented in place.", this);
        });

        // Initialize the inventory
        createInventory(this);

        if (inventory.items.find(item => item.name === 'torch')) {
            const brownBoxGraphics = this.add.graphics();
            brownBoxGraphics.fillStyle(0xba71d8, 1);
            brownBoxGraphics.fillRect(560, 73, 165, 240); // Draw the brown box
            rectangleZone.destroy(); // Remove the mirror zone
            torchAddedToInventory = true;
        }
        // Hashmark debugging graphics
        this.hashmarkGraphics = this.add.graphics();

        // Toggle hashmarks with the 'H' key
        this.input.keyboard.on('keydown-H', toggleHashmarks, this);

        // Handle drag-and-drop for inventory items
this.input.on('dragstart', (pointer, gameObject) => {
    gameObject.setScale(0.28);
    gameObject.originalX = gameObject.x;
    gameObject.originalY = gameObject.y;
});

this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
    gameObject.x = dragX;
    gameObject.y = dragY;
});

this.input.on('dragend', (pointer, gameObject) => {
    gameObject.setScale(0.15);

    const itemBounds = gameObject.getBounds();
    const inventoryPanel = { x: 1500, y: 0, width: 300, height: 900 }; // Define inventory panel bounds
    const tolerance = 4; // Set the tolerance margin (in pixels)

    if (
        itemBounds.right <= inventoryPanel.x + inventoryPanel.width + tolerance && // Increase right boundary tolerance
        itemBounds.left >= inventoryPanel.x - tolerance && // Increase left boundary tolerance
        itemBounds.bottom <= inventoryPanel.y + inventoryPanel.height + tolerance && // Increase bottom boundary tolerance
        itemBounds.top >= inventoryPanel.y - tolerance // Increase top boundary tolerance
    ) {
        // Item was dropped inside inventory
        return;
    } else {
        // Invalid drop, reset item position
        showMessage("You can't drop the item here!", this);
        gameObject.x = gameObject.originalX;
        gameObject.y = gameObject.originalY;
    }
});

// Reset message panel if it exists
if (messagePanel) {
    messagePanel.destroy();
    messagePanel = null;
}
        // Show intro message when entering the hall
        checkIntroMessage(this, "Hall", "The sounds are very loud now, as if they are coming from the dining room straight ahead.", this);

        this.hasTransitioned = false;  // Initialize it here as well for safety

        localStorage.setItem('currentScene', 'Hall');
    }

    update() {
        let moving = false;

        // Left movement
        if (this.cursors.left.isDown) {
            this.sprite.setVelocityX(-200);
            this.sprite.setFlipX(true);
            moving = true;
        } 
        // Right movement
        else if (this.cursors.right.isDown) {
            this.sprite.setVelocityX(200);
            this.sprite.setFlipX(false);
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

        // Transition to dining room if sprite moves beyond 1500 pixels on the right
        if (this.sprite.x > 1500 && !this.hasTransitioned) {
            localStorage.setItem('spriteX', 200); // Adjust as needed
            localStorage.setItem('spriteY', 700);
            this.hasTransitioned = true;
            console.log("Transitioning to Dining Room");
            this.scene.start('DiningRoom');  // Replace 'DiningRoom' with the correct scene key
        }

        // Transition back to Tower2 if sprite moves beyond the left side (x < 0)
        if (this.sprite.x < 0 && !this.hasTransitioned) {
            localStorage.setItem('spriteX', 1350); // Adjust as needed
            localStorage.setItem('spriteY', 200);
            this.hasTransitioned = true;
            console.log("Transitioning to Tower2");
            this.scene.start('Tower2');
        }

        // Play walking animation if moving
        if (moving) {
            this.sprite.anims.play('walk', true);
        } else {
            this.sprite.setVelocity(0, 0);
            this.sprite.anims.stop();
            this.sprite.setFrame(1); // Idle frame when not moving
        }
    }
}
