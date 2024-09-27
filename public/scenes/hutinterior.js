class HutInterior extends Phaser.Scene {
    constructor() {
        super({ key: 'HutInterior' });
    }

    preload() {
        // Preload assets
        this.load.image('background_hi', 'graphics/hutinterior_cauldronbefore.png');
        this.load.image('parchment_bg', 'graphics/parchment_bg.png');
        this.load.spritesheet('character', 'graphics/grahamprincesspng.png', { frameWidth: 28.5, frameHeight: 70 });
        this.load.image('amulet', 'graphics/graks_amulet.png');
        this.load.image('mirror', 'graphics/mirror.png');
        this.load.image('torch', 'graphics/torch.png');
        this.load.image('rope', 'graphics/rope.png');

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
        console.log('Creating Hut Interior scene');

        // Initialize variables
        this.torchAddedToInventory = false;
        this.showHashmarks = false;  // Hashmarks toggle
        this.zoneActivated = false;  // Zone activation flag

        // Set the background
        const background = this.add.image(750, 450, 'background_hi');
        background.setDepth(0);

        checkPigWearingAmulet(this);
        localStorage.setItem('lastVisitedHutInteriorScene', 'HutInterior');

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

        // Remove 'walk' animation if it exists
        if (this.anims.exists('walk')) {
            this.anims.remove('walk');
        }

        // Recreate 'walk' animation
        this.anims.create({
            key: 'walk',
            frames: this.anims.generateFrameNumbers('character', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });

        // Input cursor keys for controlling the character
        this.cursors = this.input.keyboard.createCursorKeys();

        // Reset message panel if it exists
        if (messagePanel) {
            messagePanel.destroy();
            messagePanel = null;
        }

        // Show intro message when entering Castle Prairie
        checkIntroMessage(this, "HutInterior", "Hm. The interior of this humble hut reeks of sulfur, dust, and swine. From the looks of the spell books and the empty cauldron, this could very well be the abode of a magick practitioner.", this);

         // Hashmark debugging graphics
         hashmarkGraphics = this.add.graphics();
         this.input.keyboard.on('keydown-H', toggleHashmarks.bind(this, this));

        // Set current scene
        localStorage.setItem('currentScene', 'HutInterior');

        // Prevent multiple transitions
        this.hasTransitioned = false;

        // Create the circular zone for the pig
        const cauldronCircle = new Phaser.Geom.Circle(750, 600, 150); // Circle centered at (290, 310) with a radius of 140
        circularZone = this.add.zone(750, 600).setSize(300, 300); // Add a zone for interactive purposes

        // Create the circular zone for the pig
        const pigCircle = new Phaser.Geom.Circle(290, 310, 140); // Circle centered at (290, 310) with a radius of 140
        circularZone = this.add.zone(290, 310).setSize(280, 280); // Add a zone for interactive purposes

        // Debugging: Draw the circle representing the interactive zone
        const debugGraphics = this.add.graphics();
        debugGraphics.lineStyle(2, 0xff0000, 1); // Red color with full opacity
        debugGraphics.strokeCircle(pigCircle.x, pigCircle.y, pigCircle.radius);

        // Log the circle's bounds for debugging
        console.log('Pig (circular zone) center:', pigCircle.x, pigCircle.y, 'radius:', pigCircle.radius);

        // Create an interactive rectangular zone at (1300, 300) with size 150x270
        const rectangleZone = this.add.zone(1325, 300, 125, 250).setRectangleDropZone(125, 250);
        rectangleZone.setInteractive();

        // Add event listener for pointerdown (click) on the rectangular zone
        rectangleZone.on('pointerdown', () => {
            const previousItemCount = inventory.items.length;
            inventory.addItem({ name: 'amulet', img: 'amulet', x: 1325, y: 300 }, this.sprite);
            console.log('Current Inventory Items:', inventory.items);
            
            if (inventory.items.length > previousItemCount) {
                this.amuletCollected = true;
                localStorage.setItem('amuletCollected', 'true');

                const brownBoxGraphics = this.add.graphics();
                brownBoxGraphics.fillStyle(0x8B4513, 1);
                brownBoxGraphics.fillRect(1325 - 75, 300 - 135, 125, 250);

                rectangleZone.destroy();
            } else {
                console.log('Amulet was not added to inventory.');
            }
        });

        // Debugging: Draw the rectangle representing the interactive zone
        debugGraphics.lineStyle(2, 0x00ff00, 1);
        debugGraphics.strokeRect(1325 - 75, 300 - 135, 125, 250);

        // Create the new interactive rectangular zone at (650, 60) with size 300x110
        const bookZone = this.add.zone(650, 60, 300, 110).setRectangleDropZone(300, 110);
        bookZone.setInteractive();

        // Add event listener for pointerdown (click) on the book zone
        bookZone.on('pointerdown', () => {
            localStorage.setItem('spriteX', this.sprite.x + 1400);
            localStorage.setItem('spriteY', this.sprite.y);
            this.hasTransitioned = true;
            this.scene.start('Spellbooks');
        });

        debugGraphics.lineStyle(2, 0x0000ff, 1);
        debugGraphics.strokeRect(650, 60, 300, 110);

        // Initialize the inventory
        createInventory(this);

        // Enable drag and drop for inventory items
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
            gameObject.setScale(0.15); // Restore the original scale
            console.log('Dragged item texture key:', gameObject.texture.key);
        
            // Log the pointer's position
            console.log('Pointer position:', pointer.x, pointer.y);
        
            // Check if the pointer is within the pig's circular zone
            if (Phaser.Geom.Circle.Contains(pigCircle, pointer.x, pointer.y)) {
                if (gameObject.texture.key === 'amulet') {
                    console.log('The amulet is within the pig zone.');
                    showMessage("You slip the amulet around the pig's neck. It pulses intensely.", this);
        
                    // Display rope on OINK zone
                    this.add.image(315, 310, 'amulet').setScale(0.15);
        
                    // Remove the amulet from the inventory
                    inventory.removeItem({ name: 'amulet', img: 'amulet' });
                    console.log('Amulet removed from inventory:', inventory.items);
                    localStorage.setItem('Pig Wearing Amulet?', 'True');
                } else {
                    showMessage("Error: The pig doesn't seem interested in this item.", this);
                }
            } else {
                showMessage("Error: You can't drop the item here!", this);
        
                // Return the item to its original position within the inventory panel
                gameObject.x = gameObject.originalX;
                gameObject.y = gameObject.originalY;
            }

            if (Phaser.Geom.Circle.Contains(cauldronCircle, pointer.x, pointer.y)) {
                if (gameObject.texture.key === 'wineskinwater') {
                    console.log('The wineskinwater is within the pig zone.');
                    showMessage("You fill up the cauldron with the contents of the wineskin. The waters sparkle green and purple.", this);

                  /* Remove the magic mirror from the inventory
                    inventory.removeItem({ name: 'magicmirror', img: 'mirror' });
                    console.log('Magic Mirror removed from inventory:', inventory.items); */
            
                    this.scene.start('HutInterior2');
                } else {
                    showMessage("Error: The pig doesn't seem interested in this item.", this);
                }
            } else {
                showMessage("Error: You can't drop the item here!", this);
        
                // Return the item to its original position within the inventory panel
                gameObject.x = gameObject.originalX;
                gameObject.y = gameObject.originalY;
            }
            
        });
        
        

        // Check if the amulet was already collected
        this.amuletCollected = localStorage.getItem('amuletCollected') === 'true';

        if (this.amuletCollected) {
            const brownBoxGraphics = this.add.graphics();
            brownBoxGraphics.fillStyle(0x8B4513, 1);
            brownBoxGraphics.fillRect(1325 - 75, 300 - 135, 125, 250);
            rectangleZone.destroy();
        }
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
        if (this.sprite.y > 850 && !this.hasTransitioned) {
            localStorage.setItem('spriteX', 250);
            localStorage.setItem('spriteY', 250);
            this.hasTransitioned = true;
            this.scene.start('Cavern1');
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
