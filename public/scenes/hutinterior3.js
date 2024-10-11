class HutInterior3 extends Phaser.Scene {
    constructor() {
        super({ key: 'HutInterior3' });
    }

    preload() {
        // Preload assets
        this.load.image('background_hi3', 'graphics/hutinterior_postpig.png');
        this.load.image('parchment_bg', 'graphics/parchment_bg.png');
        this.load.spritesheet('character', 'graphics/grahamprincesspng.png', { frameWidth: 28.5, frameHeight: 70 });
        this.load.image('amulet', 'graphics/graks_amulet.png');
        this.load.image('mirror', 'graphics/mirror.png');
        this.load.image('torch', 'graphics/torch.png');
        this.load.image('rope', 'graphics/rope.png');
        this.load.image('shiftywizard', 'graphics/shifty_wizard.png');

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
        console.log('Creating Hut Interior 3 scene');
    
        // Initialize variables
        this.torchAddedToInventory = false;
        this.showHashmarks = false;  // Hashmarks toggle
        this.zoneActivated = false;  // Zone activation flag
    
        // Set the background
        const background = this.add.image(750, 450, 'background_hi3');
        background.setDepth(0);

        localStorage.setItem('lastVisitedHutInteriorScene', 'HutInterior3');
    
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
        checkIntroMessage(this, "HutInterior3", "The pig no longer seems quite so strange and a wizard has appeared before your very eyes. You see that it is indeed, Benjamin Wuzzard, your father's most trusted advisor, friend, and personal magician.", this);
    
        // Hashmark debugging graphics
        hashmarkGraphics = this.add.graphics();
        this.input.keyboard.on('keydown-H', toggleHashmarks.bind(this, this));
    
        // Set current scene
        localStorage.setItem('currentScene', 'HutInterior3');
    
        // Prevent multiple transitions
        this.hasTransitioned = false;
    
        const circularZone = this.add.zone(290, 310).setSize(280, 280); // Add a zone for interactive purposes
        circularZone.setInteractive();
        circularZone.on('pointerdown', () => {
            showMessage("OINK!", this);
        })
    // Create interactive pool rectangle zone
const wizardRectangle = this.add.zone(925, 190, 250, 250).setRectangleDropZone(250, 250).setInteractive();

/* // Debugging: Draw the rectangle representing the wizard interaction zone
const debugWizardGraphics = this.add.graphics();
debugWizardGraphics.lineStyle(2, 0x00ff00, 1); // Green color with full opacity
debugWizardGraphics.strokeRect(wizardRectangle.x - wizardRectangle.input.hitArea.width / 2, wizardRectangle.y - wizardRectangle.input.hitArea.height / 2, wizardRectangle.input.hitArea.width, wizardRectangle.input.hitArea.height);
*/
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
    
        // Add Shifty Wizard to the scene
        const shiftyWizard = this.add.image(1050, 300, 'shiftywizard');
        shiftyWizard.setOrigin(0.5, 0.5);
        shiftyWizard.setScale(300 / shiftyWizard.height);  // Set height to 300 pixels
        shiftyWizard.setDepth(1);
    
        // Make Shifty Wizard interactive
        shiftyWizard.setInteractive();
        shiftyWizard.on('pointerdown', () => {
            showMessage("Thank you dear Princess for saving me! I feared I might be trapped by that dratted pig, but I had to take the risk. Now how to get you past that accursed cur who guards the Bridge of Souls. Maybe there's something in my lorebooks.", this);
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
            console.log('Pointer position:', pointer.x, pointer.y);
        
            // Define the bounds of the inventory panel
            const inventoryBounds = new Phaser.Geom.Rectangle(1500, 0, 300, 900);
        
            // Check if the pointer is within the inventory panel
            if (Phaser.Geom.Rectangle.ContainsPoint(inventoryBounds, pointer)) {
                console.log("Item dropped within the inventory panel.");
                return;  // Skip further logic if dropped within the inventory panel
            }
        
            // Check if the item is dropped on the wizard
            if (Phaser.Geom.Rectangle.Contains(wizardRectangle, pointer.x, pointer.y)) {
                // Check for bone
                if (gameObject.texture.key === 'bone') {
                    console.log('You give the wizard the bone.');
                    localStorage.setItem('Wuzzard has bone?', 'True');
                    showMessage("The wizard takes the bone eagerly. He says, 'Ah this is definitely a suitable snack. Now all we need is a powerful opiate.'", this);
        
                    // Remove the bone from the inventory
                    inventory.removeItem({ name: 'bone', img: 'bone' });
                    gameObject.destroy();  // Optionally destroy the gameObject after use
        
                } else if (gameObject.texture.key === 'potentpoppy') {
                    console.log('You give the wizard the potent poppy.');
                    localStorage.setItem('Wuzzard has potentpoppy?', 'True');
                    showMessage("The wizard takes the potent poppy eagerly. He says, 'Ah, this is definitely a sleeping agent. Now all we need is a delivery system.'", this);
        
                    // Remove the potent poppy from the inventory
                    inventory.removeItem({ name: 'potentpoppy', img: 'potentpoppy' });
                    gameObject.destroy();  // Optionally destroy the gameObject after use
                }
        
                // Check if both items have been delivered to the wizard
                const hasBone = localStorage.getItem('Wuzzard has bone?') === 'True';
                const hasPoppy = localStorage.getItem('Wuzzard has potentpoppy?') === 'True';
        
                if (hasBone && hasPoppy) {
                    console.log('The wizard has both the bone and potent poppy.');
                    showMessage("'That was a lot of work,' but this should put a charging rhino to sleep. Also, please take this amulet with you, I can't bear the thought of sharing a brain with that pig again. Sigh... I fear you may need it as your father has most likely found himself in a similar fix. I have reason to believe the wily warlock, Grak, may have a hand in this. Please succeed where I have failed dear Princess. Bring him home safe!'", this);
        
                    // Create the new item "Poppy-soaked bone" and add it to the inventory
                    inventory.addItemnp({ name: 'poppysoakedbone', img: 'poppysoakedbone' });
                    console.log('Poppy-soaked bone added to inventory:', inventory.items);
        
                    // Add the amulet back to the inventory
                    inventory.addItemnp({ name: 'amulet', img: 'amulet' });
                    console.log('Amulet added to inventory:', inventory.items);
        
                    // Optionally reset the flags if you want the process to start again
                    localStorage.setItem('Wuzzard has bone?', 'False');
                    localStorage.setItem('Wuzzard has potentpoppy?', 'False');
                }
        
            } else {
                // If the item was not dropped on the wizard, show an error message
                showMessage("Error: You can't drop the item here!", this);
        
                // Return the item to its original position within the inventory panel
                gameObject.x = gameObject.originalX;
                gameObject.y = gameObject.originalY;
            }
        });
        
        
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
