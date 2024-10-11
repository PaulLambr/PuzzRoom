class Swampmaze extends Phaser.Scene {
    constructor() {
        super({ key: 'Swampmaze' });
    }

    preload() {
        // Preload assets
        this.load.image('background_swm', 'graphics/swamp3.png');
        this.load.image('parchment_bg', 'graphics/parchment_bg.png');
        this.load.spritesheet('character', 'graphics/grahamprincesspng.png', { frameWidth: 28.5, frameHeight: 70 });
        this.load.image('amulet', 'graphics/graks_amulet.png');
        this.load.image('mirror', 'graphics/mirror.png');
        this.load.image('torch', 'graphics/torch.png');

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
        console.log('Creating Swampmaze scene');
    
        // Initialize variables
        this.torchAddedToInventory = false;
        this.showHashmarks = false;  // Hashmarks toggle
        this.zoneActivated = false;  // Zone activation flag
        this.gameOver = false;  // Flag to check if the game is over due to falling asleep
    
        // Set the background
        const background = this.add.image(750, 450, 'background_swm');
        background.setDepth(0);
    
        // Load sprite position from localStorage or set default
        const savedX = localStorage.getItem('spriteX');
        const savedY = localStorage.getItem('spriteY');
        const startX = savedX ? parseFloat(savedX) : 100;
        const startY = savedY ? parseFloat(savedY) : 850;  // Character starts behind the rock
    
        // Create the main sprite for the player character
        this.sprite = this.physics.add.sprite(startX, startY, 'character');
        this.sprite.setScale(2);
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
    
        // Initialize the inventory
        createInventory(this);
    
        // Reset message panel if it exists
        if (messagePanel) {
            messagePanel.destroy();
            messagePanel = null;
        }
    
        // Show intro message when entering Castle Prairie
        checkIntroMessage(this, "Swampmaze", "The stench of this swamp is overpowering. It's making you feel woozy.", this);
    
        // Hashmark debugging graphics
        this.hashmarkGraphics = this.add.graphics();
    
        // Toggle hashmarks with the 'H' key
        this.input.keyboard.on('keydown-H', () => toggleHashmarks(this));
    
        // Set current scene
        localStorage.setItem('currentScene', 'Swampmaze');
    
        // Prevent multiple transitions
        this.hasTransitioned = false;
    
        // Start a countdown for 18 seconds is the right time
        this.time.delayedCall(35000, () => {
            if (!this.hasTransitioned) {
                this.endGame();  // If the player hasn't transitioned, end the game
            }
        });
    
        // Create no-go zones
        const noGoZones = [
            { x: 0, y: 800, width: 375, height: 1 },        // From x: 0 to x: 375 at y: 800
            { x: 510, y: 800, width: 990, height: 1 },      // From x: 510 to x: 1500 at y: 800
            { x: 200, y: 210, width: 1300, height: 1 },      // From x: 200 to x: 1500 at y: 210
            { x: 200, y: 420, width: 1, height: 420 },
            { x: 200, y: 640, width: 1000, height: 1 },
            { x: 400, y: 470, width: 1125, height: 1 },
            { x: 400, y: 410, width: 1, height: 70 },
            { x: 400, y: 370, width: 320, height: 1 },
            { x: 1075, y: 345, width: 1, height: 250 },
            { x: 1380, y: 630, width: 1, height: 320 },
            { x: 1300, y: 100, width: 1, height: 180 }
        ];
    
        noGoZones.forEach(zone => {
            const newZone = this.add.zone(zone.x + zone.width / 2, zone.y, zone.width, zone.height).setOrigin(0.5, 0.5);
            this.physics.add.existing(newZone, true);
            this.physics.add.collider(this.sprite, newZone);
        });
    
        // Create a rectangle representing the potent poppy item at (790, 350) with size (110, 100)
const poppyItemZone = this.add.zone(790 + 110 / 2, 350 + 100 / 2, 110, 100).setOrigin(0.5, 0.5).setInteractive();
this.physics.add.existing(poppyItemZone, true);

// Define the proximity radius
const pickupRadius = 100;  // Player must be within 100 pixels to pick up the item

// Add a click event to add the poppy to inventory with proximity check
poppyItemZone.on('pointerdown', () => {
    // Calculate the distance between the player and the item
    const distance = Phaser.Math.Distance.Between(this.sprite.x, this.sprite.y, 790 + 110 / 2, 350 + 100 / 2);

    // If the player is within the defined radius, allow them to pick up the item
    if (distance <= pickupRadius) {
        // Add the potent poppy item to inventory
        inventory.addItem({ name: 'potentpoppy', img: 'potentpoppy', x: 790, y: 350 }, this.sprite);

        // Replace the item zone with a green box
        const greenBox = this.add.rectangle(790 + 110 / 2, 350 + 150 / 2, 110, 150, 0xc1e724).setOrigin(0.5, 0.5);
        poppyItemZone.destroy();  // Remove the interactive zone after the item is collected

        showMessage("You have picked up the potent poppy.", this);  // Display success message
    } else {
        // If player is too far, show a message and prevent pickup
        showMessage("You're too far away to pick up the poppy.", this);
    }
});

    }
    
    // End game when the player stays in the swamp for more than 20 seconds
    endGame() {
        this.gameOver = true;
        this.sprite.setVelocity(0, 0); // Stop the player's movement
        
        showMessage("You've fallen asleep in the poisonous swamp! The game is over.", this); // Display the game over message
        this.cameras.main.fadeOut(5000, 0, 0, 0);  // Fade to black
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

      

        // Transition to next scene if the player is between 950 and 1300 pixels x and greater than 875 pixels y
if (this.sprite.x > 950 && this.sprite.x < 1300 && this.sprite.y < 75 && !this.hasTransitioned) {
    localStorage.setItem('spriteX', this.sprite.x);
    localStorage.setItem('spriteY', this.sprite.y + 750);
    this.hasTransitioned = true;
    this.scene.start('G2grasslandswamp');  // Change to your next scene here
}

         // Transition to next scene if the player is between 950 and 1300 pixels x and greater than 875 pixels y
if (this.sprite.y > 900 && !this.hasTransitioned) {
    localStorage.setItem('spriteX', this.sprite.x);
    localStorage.setItem('spriteY', this.sprite.y - 705);
    this.hasTransitioned = true;
    this.scene.start('Grassriver1');  // Change to your next scene here
}

         // Transition to next scene if the player is between 950 and 1300 pixels x and greater than 875 pixels y
         if (this.sprite.x > 1440 && !this.hasTransitioned) {
            localStorage.setItem('spriteX', this.sprite.x - 1300);
            localStorage.setItem('spriteY', this.sprite.y);
            this.hasTransitioned = true;
            this.scene.start('CaveEntrance');  // Change to your next scene here
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
