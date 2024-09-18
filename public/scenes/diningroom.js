class DiningRoom extends Phaser.Scene {
    constructor() {
        super({ key: 'DiningRoom' });  // Define the scene key for the Dining Room
    }

    preload() {
        // Preload assets for the Dining Room scene
        this.load.image('backgrounddr', 'graphics/diningroom.png');
        this.load.image('parchment_bg', 'graphics/parchment_bg.png');
        this.load.spritesheet('character', 'graphics/grahamprincesspng.png', { frameWidth: 28.5, frameHeight: 70 });
        this.load.image('amulet', 'graphics/graks_amulet.png');
        this.load.image('mirror', 'graphics/mirror.png');
        this.load.image('wineskin', 'graphics/wineskin.png');
        this.load.image('dooropen', 'graphics/dooropen.png');  // Preload door open image

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
        console.log('Creating Dining Room Scene');

        // Initialize key variables
        this.wineskinAddedToInventory = false; // Track wineskin status
        this.doorUnlocked = false; // Track if the door has been unlocked
        this.hasTransitioned = false; // Track transition state
        this.doorOpenImage = null; // Store door open image for overlap check

        // Set background image for Dining Room
        this.add.image(750, 450, 'backgrounddr');

        // Load saved sprite position or set default
        const savedX = localStorage.getItem('spriteX');
        const savedY = localStorage.getItem('spriteY');
        const startX = savedX ? parseFloat(savedX) : 100;
        const startY = savedY ? parseFloat(savedY) : 525;

        // Create the main sprite for the player character
        this.sprite = this.physics.add.sprite(startX, startY, 'character');
        this.sprite.setScale(3);

        // Create walking animation
        if (!this.anims.exists('walk')) {
            this.anims.create({
                key: 'walk',
                frames: this.anims.generateFrameNumbers('character', { start: 0, end: 5 }),
                frameRate: 10,
                repeat: -1
            });
        }

        // Input cursor keys for controlling the character
        this.cursors = this.input.keyboard.createCursorKeys();

        // Create an interactive zone for unlocking the door
        this.rectangleZone2 = this.add.zone(1130, 125, 190, 190).setRectangleDropZone(190, 190);
        this.graphics = this.add.graphics();
        this.graphics.lineStyle(2, 0xff0000); // Red outline for debugging
        this.graphics.strokeRect(1130-95, 125-95, 190, 190);

        this.rectangleZone2.setInteractive();
        this.rectangleZone2.on('pointerdown', () => {
            if (!this.doorUnlocked) {
                showMessage("The cellar door is locked.", this);
            }
        });

        // Initialize the inventory
        createInventory(this);

        // Check if wineskin is already in the inventory
if (inventory.items.find(item => item.name === 'wineskin')) {
    // Wineskin already in inventory, show a brown box instead
    const brownBoxGraphics = this.add.graphics();
    brownBoxGraphics.fillStyle(0x742c0c, 1);
    brownBoxGraphics.fillRect(715, 260, 200, 200); // Brown box where the wineskin was
    this.wineskinAddedToInventory = true;
} else {
    // Wineskin is not in inventory, create a zone for picking it up
    this.rectangleZone = this.add.zone(815, 360, 200, 200).setRectangleDropZone(200, 200);
    this.rectangleZone.setInteractive();
    this.rectangleZone.on('pointerdown', () => {
        if (!this.wineskinAddedToInventory) {
            // Call addItem to handle proximity check and inventory addition
            inventory.addItem({ name: 'wineskin', img: 'wineskin', x: 815, y: 350}, this.sprite);

            // Only proceed with the success logic if the wineskin is successfully added to the inventory
            if (inventory.items.find(item => item.name === 'wineskin')) {
                showMessage("You pick up the distinctively green goblin wineskin. It reeks of mold.", this);

                const brownBoxGraphics = this.add.graphics();
                brownBoxGraphics.fillStyle(0x742c0c, 1);
                brownBoxGraphics.fillRect(715, 260, 200, 200); // Brown box where the wineskin was
                this.rectangleZone.destroy(); // Remove wineskin zone after it's picked up
                this.wineskinAddedToInventory = true; // Mark wineskin as collected
            }
        }
    });
}


        // Reset message panel if it exists
        if (messagePanel) {
            messagePanel.destroy();
            messagePanel = null;
        }

        // Initialize hashmark graphics
        this.hashmarkGraphics = this.add.graphics();
        this.input.keyboard.on('keydown-H', toggleHashmarks, this);

        // Show intro message when entering the Dining Room
        checkIntroMessage(this, "DiningRoom", "Your footsteps in the corridor must have spooked whoever was making all that racket.", this);
        
        this.hasTransitioned = false;  // Initialize it here as well for safety

        localStorage.setItem('currentScene', 'DiningRoom');

        // Enable drag and drop for inventory items
        this.input.on('dragstart', (pointer, gameObject) => {
            gameObject.setScale(0.15); // Scale up slightly when dragging starts
            gameObject.originalX = gameObject.x; // Store the original X position
            gameObject.originalY = gameObject.y; // Store the original Y position
        });

        this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
            gameObject.x = dragX;
            gameObject.y = dragY;
        });

        // When the drag ends, log the pointer position and compare with the zone
this.input.on('dragend', (pointer, gameObject) => {
    // Log the item being dragged
    console.log('Dragged item key:', gameObject.texture.key);
    console.log('Pointer dropped at:', pointer.x, pointer.y);
    console.log('Zone bounds:', this.rectangleZone2.getBounds());

    const zoneBounds = this.rectangleZone2.getBounds(); // The bounds of the drop zone
    const tolerance = 30;

    // Log the actual pointer position during dragend
    console.log(`Dropping ${gameObject.texture.key} at pointer position: (${pointer.x}, ${pointer.y})`);
    console.log(`Door zone coordinates: (${zoneBounds.x}, ${zoneBounds.y})`);

    // Check if the pointer position is within the door zone bounds
    if (
        pointer.x >= zoneBounds.x - tolerance && 
        pointer.x <= zoneBounds.x + zoneBounds.width + tolerance && 
        pointer.y >= zoneBounds.y - tolerance && 
        pointer.y <= zoneBounds.y + zoneBounds.height + tolerance &&
        gameObject.texture.key === 'keys'  // Only trigger if keys are dropped
    ) {
        showMessage("The cellar door is now unlocked.", this);

        // Unlock the door
        this.doorUnlocked = true;
        this.rectangleZone2.destroy(); // Remove the original zone

        // Replace with the open door image
        this.doorOpenImage = this.add.image(1130, 125, 'dooropen').setScale(0.75);

        // Create a new interactive zone for the open door
        this.doorOpenZone = this.add.zone(1130, 125, 190, 190);
        this.physics.add.existing(this.doorOpenZone);
        this.doorOpenZone.body.setAllowGravity(false); 
        this.doorOpenZone.body.setImmovable(true);
        this.doorOpenZone.setInteractive();

        // Save door state to local storage
        localStorage.setItem('doorState', 'open');
    } else if (
        pointer.x >= inventoryPanel.x - tolerance && 
        pointer.x <= inventoryPanel.x + inventoryPanel.width + tolerance && 
        pointer.y >= inventoryPanel.y - tolerance && 
        pointer.y <= inventoryPanel.y + inventoryPanel.height + tolerance
    ) {
        // If dropped back in inventory, do nothing
        return;
    } else {
        // Return item to original position
        showMessage(`You can't drop the ${gameObject.texture.key} here!`, this);
        gameObject.x = gameObject.originalX;
        gameObject.y = gameObject.originalY;
    }
});

    }

    update() {
        let moving = false;

        // Handle movement
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

        if (moving) {
            this.sprite.anims.play('walk', true);
        } else {
            this.sprite.setVelocity(0, 0);
            this.sprite.anims.stop();
            this.sprite.setFrame(1);
        }

        // Check if the door is unlocked and overlap with the open door zone
        if (this.doorUnlocked && this.doorOpenZone && this.physics.overlap(this.sprite, this.doorOpenZone)) {
            showMessage("You enter the cellar.", this);
            localStorage.setItem('spriteX', 5);
            localStorage.setItem('spriteY', 580);
            this.scene.start('Cellar'); // Transition to the Cellar scene
        }

        // Transition to other scenes
        if (this.sprite.x > 1500 && !this.hasTransitioned) {
            localStorage.setItem('spriteX', this.sprite.x - 1480);
            localStorage.setItem('spriteY', this.sprite.y);
            this.hasTransitioned = true;
            this.scene.start('HallThrone');
        }

        if (this.sprite.x < 0 && !this.hasTransitioned) {
            localStorage.setItem('spriteX', this.sprite.x + 1480);
            localStorage.setItem('spriteY', this.sprite.y);
            this.hasTransitioned = true;
            this.scene.start('Hall');
        }
    }
}
