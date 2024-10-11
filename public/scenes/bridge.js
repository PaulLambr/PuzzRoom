class Bridge extends Phaser.Scene {
    constructor() {
        super({ key: 'Bridge' });
    }

    preload() {
        // Preload assets
        this.load.image('background_bridge', 'graphics/bridge_done.png');
        this.load.image('parchment_bg', 'graphics/parchment_bg.png');
        this.load.spritesheet('character', 'graphics/grahamprincesspng.png', { frameWidth: 28.5, frameHeight: 70 });
        this.load.image('amulet', 'graphics/graks_amulet.png');
        this.load.image('mirror', 'graphics/mirror.png');
        this.load.image('torch', 'graphics/torch.png');
        this.load.image('cerberus_singleframe', 'graphics/cerberus_singleframe.png');
        this.load.spritesheet('cerberussprite', 'graphics/cerberussprite.png', { frameWidth: 100, frameHeight: 70 });

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
        console.log('Creating Bridge scene');
    
        // Initialize variables
        this.torchAddedToInventory = false;
        this.showHashmarks = false;  // Hashmarks toggle
        this.zoneActivated = false;  // Zone activation flag
    
        // Set the background
        const background = this.add.image(750, 450, 'background_bridge');
        background.setDepth(0);
    
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
    
        // Initialize the inventory
        createInventory(this);
    
        // Reset message panel if it exists
        if (messagePanel) {
            messagePanel.destroy();
            messagePanel = null;
        }
    
        // Show intro message
        checkIntroMessage(this, "Bridge", "A gnarly-looking beast watches you approach with 6 hungry eyes fixed upon you.", this);
    
        // Hashmark debugging graphics
        hashmarkGraphics = this.add.graphics();
        this.input.keyboard.on('keydown-H', toggleHashmarks.bind(this, this));
    
        // Set current scene
        localStorage.setItem('currentScene', 'Bridge');
    
        // Prevent multiple transitions
        this.hasTransitioned = false;
    
        // Create Cerberus animation with 3 frames (from 0 to 2)
        this.anims.create({
            key: 'cerberus_walk',
            frames: this.anims.generateFrameNumbers('cerberussprite', { start: 0, end: 2 }),
            frameRate: 5,  // Adjust the frame rate as needed
            repeat: -1     // Infinite loop
        });
    
        // Create Cerberus sprite and play the animation
this.cerberus = this.add.sprite(650, 550, 'cerberussprite');
this.cerberus.setDepth(1);
this.cerberus.setScale(2);
this.cerberus.play('cerberus_walk');

// Enable input on the Cerberus sprite to make it clickable
this.cerberus.setInteractive();

this.cerberus.on('pointerdown', () => {
    showMessage("This ravenous 3-headed hell hound looks like it could devour you in about 1 bite per ugly snout.", this);
});

        
        // Create a no-go zone physics body without rendering another sprite
this.noGoZone = this.physics.add.staticGroup();

// Use a proper zone for invisible areas instead of using a sprite with null texture
const invisibleZone = this.add.zone(650, 550, 200, 200);  // Create an invisible zone
this.physics.world.enable(invisibleZone);  // Enable physics on the zone
invisibleZone.body.setImmovable(true);  // Ensure the zone is immovable

// Add the invisible zone to the noGoZone group to manage it
this.noGoZone.add(invisibleZone);

// Set collision between the player sprite and the no-go zone
this.physics.add.collider(this.sprite, invisibleZone);

 // Create no-go zones
 const noGoZones = [
    { x: 700, y: 400, width: 800, height: 1 },        // From x: 0 to x: 375 at y: 800
    { x: 700, y: 650, width: 800, height: 1 },
    { x: 700, y: 180, width: 1, height: 300 },      // From x: 510 to x: 1500 at y: 800
    { x: 700, y: 750, width: 1, height: 200 },      // From x: 200 to x: 1500 at y: 210
    
];

noGoZones.forEach(zone => {
    const newZone = this.add.zone(zone.x + zone.width / 2, zone.y, zone.width, zone.height).setOrigin(0.5, 0.5);
    this.physics.add.existing(newZone, true);
    this.physics.add.collider(this.sprite, newZone);
});

        // Drag and drop for inventory items
        this.input.on('dragstart', (pointer, gameObject) => {
            // Scale the item when dragging starts
            gameObject.setScale(0.28);
            gameObject.originalX = gameObject.x;
            gameObject.originalY = gameObject.y;
        });
    
        this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
            // Update item position as it is being dragged
            gameObject.x = dragX;
            gameObject.y = dragY;
        });
    
        this.input.on('dragend', (pointer, gameObject) => {
            gameObject.setScale(0.15);  // Restore original size
    
            const noGoZoneBounds = new Phaser.Geom.Circle(650, 550, 120);
            const pointerInNoGoZone = Phaser.Geom.Circle.Contains(noGoZoneBounds, pointer.x, pointer.y);
    
            if (pointerInNoGoZone && gameObject.texture.key === 'poppysoakedbone') {
                showMessage("Cerberus accepts the bone, then teeters and falls over, allowing you to proceed!", this);
                inventory.removeItem({ name: 'poppysoakedbone', img: 'poppysoakedbone' });
    
                // Call the moveNoGoZone function from within the scene's context
                this.moveNoGoZone();
            } else if(pointerInNoGoZone && gameObject.texture.key === 'bone') {
                showMessage("Cerberus eats the delicious bone with alacrity!", this);
                inventory.removeItem({ name: 'bone', img: 'bone' });
            
            } else {
                gameObject.x = gameObject.originalX;
                gameObject.y = gameObject.originalY;
            }
        });
    }
    

    moveNoGoZone() {
        const newX = 650 - 200;
        const newY = 550 - 200;
    
        // Use tween to make Cerberus saunter to the new position
        this.tweens.add({
            targets: this.cerberus,    // Target the Cerberus sprite
            x: newX,                   // New x position
            y: newY,                   // New y position
            duration: 3000,            // Time in milliseconds (3 seconds)
            ease: 'Linear',            // Movement easing type
            onComplete: () => {
                console.log("Cerberus has moved to the new position.");

                // Stop the current Cerberus animation
            this.cerberus.anims.stop(); 

            // Change the Cerberus texture to the single frame image after the animation completes
            this.cerberus.setTexture('cerberus_singleframe');
            }
        });
    
        // Move the no-go zone physics body to the new position
        this.noGoZone.getChildren()[0].setPosition(newX, newY).refreshBody();  // Refresh the static body's position

    
    
    }
    

    update() {
        let moving = false;

        // Character movement
        if (this.cursors.left.isDown) {
            this.sprite.setVelocityX(-200);
            this.sprite.setFlipX(true);
            moving = true;
        } else if (this.cursors.right.isDown) {
            // Allow right movement only if x <= 550 or y is between 450 and 650
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
        if (this.sprite.x > 1390 && !this.hasTransitioned) {
            localStorage.setItem('spriteX', 250);
            localStorage.setItem('spriteY', 600);
            this.hasTransitioned = true;
            this.scene.start('Forest1');
        }

        // Transition to dining room if sprite moves beyond 900 pixels on the bottom
        if (this.sprite.y > 900 && !this.hasTransitioned) {
            localStorage.setItem('spriteX', this.sprite.x);
            localStorage.setItem('spriteY', this.sprite.y - 750);
            this.hasTransitioned = true;
            this.scene.start('GFCM');
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
