class HutInterior2 extends Phaser.Scene {
    constructor() {
        super({ key: 'HutInterior2' });
    }

    preload() {
        // Preload assets
        this.load.image('background_hi2', 'graphics/hutinterior_cauldronwater.png');
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
        console.log('Creating Hut Interior 2 scene');

        // Initialize variables
        this.torchAddedToInventory = false;
        this.showHashmarks = false;  // Hashmarks toggle
        this.zoneActivated = false;  // Zone activation flag

        // Set the background
        const background = this.add.image(750, 450, 'background_hi2');
        background.setDepth(0);

        checkPigWearingAmulet(this);
        localStorage.setItem('lastVisitedHutInteriorScene', 'HutInterior2');

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

        // Reset message panel if it exists
        if (messagePanel) {
            messagePanel.destroy();
            messagePanel = null;
        }

        // Show intro message when entering Castle Prairie
        checkIntroMessage(this, "HutInterior2", "You fill up the cauldron with the contents of the wineskin. The waters sparkle green and purple.", this);

         // Hashmark debugging graphics
         hashmarkGraphics = this.add.graphics();
         this.input.keyboard.on('keydown-H', toggleHashmarks.bind(this, this));

        // Set current scene
        localStorage.setItem('currentScene', 'HutInterior2');

        // Prevent multiple transitions
        this.hasTransitioned = false;

        // Create the circular zone for the pig
        const cauldronCircle = new Phaser.Geom.Circle(750, 600, 150); // Circle centered at (290, 310) with a radius of 140
        circularZone = this.add.zone(750, 600).setSize(300, 300); // Add a zone for interactive purposes

         // Create the circular zone for the pig
         const pigCircle = new Phaser.Geom.Circle(290, 310, 140); // Circle centered at (290, 310) with a radius of 140
         circularZone = this.add.zone(290, 310).setSize(280, 280); // Add a zone for interactive purposes
         circularZone.setInteractive();
         circularZone.on('pointerdown', () => {
             showMessage("OINK?", this);
         })

        // Create an interactive rectangular zone at (1300, 300) with size 150x270
        const rectangleZone = this.add.zone(1260, 300, 125, 250).setRectangleDropZone(125, 250);
        rectangleZone.setInteractive();

        // Add event listener for pointerdown (click) on the rectangular zone
        rectangleZone.on('pointerdown', () => {
            const previousItemCount = inventory.items.length;
            inventory.addItem({ name: 'amulet', img: 'amulet', x: 1260, y: 300 }, this.sprite);
            console.log('Current Inventory Items:', inventory.items);
            
            if (inventory.items.length > previousItemCount) {
                this.amuletCollected = true;
                localStorage.setItem('amuletCollected', 'true');

                const brownBoxGraphics = this.add.graphics();
                brownBoxGraphics.fillStyle(0xb97a57, 1);
                brownBoxGraphics.fillRect(1200, 175, 125, 250);

                rectangleZone.destroy();
            } else {
                console.log('Amulet was not added to inventory.');
            }
        });

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
        
            // Define the bounds of the inventory panel
            const inventoryBounds = new Phaser.Geom.Rectangle(1500, 0, 300, 900);
        
            // Check if the pointer is within the inventory panel
            if (Phaser.Geom.Rectangle.ContainsPoint(inventoryBounds, pointer)) {
                console.log("Item dropped within the inventory panel.");
                return;  // Don't trigger any error or zone logic for inventory interactions
            }
        
            // Check if the pointer is within the cauldron zone
            if (Phaser.Geom.Circle.Contains(cauldronCircle, pointer.x, pointer.y)) {
                if (gameObject.texture.key === 'mirror') {
                    console.log('The mirror is within the cauldron zone.');
                    showMessage("You dip the mirror in the magick waters like the spell booke told you.", this);
        // Remove the bone from the inventory
        inventory.removeItem({ name: 'mirror', img: 'mirror' });
        gameObject.destroy();  // Optionally destroy the gameObject after use
                    inventory.addItemnp({ name: 'magicmirror', img: 'magicmirror' });
                    console.log('Magic mirror added to inventory:', inventory.items);
        
                } else {
                    showMessage("Error: The cauldron doesn't seem interested in this item.", this);
                }
            } else if (Phaser.Geom.Circle.Contains(pigCircle, pointer.x, pointer.y)) {
                // Check if the pig is wearing the amulet and handle accordingly
                if (gameObject.texture.key === 'magicmirror') {
                    const pigWearingAmulet = localStorage.getItem('Pig Wearing Amulet?') === 'True';
        
                    if (pigWearingAmulet) {
                        console.log('The magic mirror is within the pig zone.');
                        showMessage("The pig catches his reflection in the magic mirror and all hell breaks loose. The magic mirror explodes. The pig squeals in fear, and the room is temporarily clothed in darkness.", this);
                        inventory.removeItem({ name: 'magicmirror', img: 'magicmirror' });
                        this.cameras.main.shake(4000, 0.01);
        
                        // After shake completes, fade to black for 2 seconds
                        this.time.delayedCall(4000, () => {
                            this.cameras.main.fadeOut(2000, 0, 0, 0);
                            this.cameras.main.once('camerafadeoutcomplete', () => {
                                localStorage.setItem('spriteX', this.sprite.x);
            localStorage.setItem('spriteY', this.sprite.y);
                                this.scene.start('HutInterior3');
                                this.cameras.main.fadeIn(2000, 0, 0, 0);  // Fade in over 2 seconds
                            });
        
                            this.cameras.main.once('camerafadeoutcomplete', () => {
                                this.cameras.main.flash(3000, 255, 255, 255);  // Flash for 3 seconds
                            });
                        });
        
                    } else {
                        showMessage("You seem to recall from the Wuzzard's spellbook that the subject of the spell must be bearing the amulet.", this);
                        gameObject.x = gameObject.originalX;
                        gameObject.y = gameObject.originalY;
                    }
        
                } else if (gameObject.texture.key === 'amulet') {
                    console.log('The amulet is within the pig zone.');
                    showMessage("You slip the amulet around the pig's neck. It pulses intensely.", this);
        
                    // Display amulet on pig zone
                    this.add.image(315, 310, 'amulet').setScale(0.15);
        
                    // Remove the amulet from the inventory
                    inventory.removeItem({ name: 'amulet', img: 'amulet' });
                    console.log('Amulet removed from inventory:', inventory.items);
                    localStorage.setItem('Pig Wearing Amulet?', 'True');
                }
        
            } else {
                // If the item is dropped outside any valid zone, return it to the original position
                showMessage("Error: You can't drop the item here!", this);
                gameObject.x = gameObject.originalX;
                gameObject.y = gameObject.originalY;
            }
        });
        
        // Check if the amulet was already collected
        this.amuletCollected = localStorage.getItem('amuletCollected') === 'true';

        if (this.amuletCollected) {
            const brownBoxGraphics = this.add.graphics();
            brownBoxGraphics.fillStyle(0xb97a57, 1);
            brownBoxGraphics.fillRect(1200, 175, 125, 250);
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
            localStorage.setItem('spriteX', 740);
            localStorage.setItem('spriteY', 850);
            this.hasTransitioned = true;
            this.scene.start('Poke');
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
