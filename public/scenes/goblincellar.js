class GoblinCellar extends Phaser.Scene {
    constructor() {
        super({ key: 'GoblinCellar' });  // Define the scene key for the Cellar
    }

    preload() {
        // Preload assets for the Cellar scene
        this.load.image('backgroundgc1', 'graphics/goblincellarpowderkeg.png'); // Unique background for Cellar
        this.load.image('parchment_bg', 'graphics/parchment_bg.png');
        this.load.spritesheet('character', 'graphics/grahamprincesspng.png', { frameWidth: 28.5, frameHeight: 70 });
        this.load.spritesheet('goblinKing', 'graphics/goblin.png', { frameWidth: 28.5, frameHeight: 70 });
        this.load.spritesheet('goblingirl', 'graphics/goblingirl.png', { frameWidth: 28.5, frameHeight: 70 });
        this.load.image('torch', 'graphics/torch.png');
        this.load.image('amulet', 'graphics/graks_amulet.png');
        this.load.image('mirror', 'graphics/mirror.png');
        

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
        
 

 
        // Initialize key variables
        this.torchUsed = false;
        this.goblinKing = null;
        this.darkOverlay = null;
        this.noGoZones = null;
        this.hasTransitioned = false;

        console.log('Creating Caverntower1 scene');
    
        // Set the background
        const background = this.add.image(750, 450, 'backgroundgc1');
       
    
       
 // Add dark overlay for the room
 this.darkOverlay = this.add.graphics();
 this.darkOverlay.fillStyle(0x000000, 1);
 this.darkOverlay.fillRect(0, 0, 1800, 1300); // Fill the whole scene with black

 createInventory(this);
    
        // Reset message panel if it exists
        if (messagePanel) {
            messagePanel.destroy();
            messagePanel = null;
        }
    
        // Show intro message when entering Cavernhall
        checkIntroMessage(this, "GoblinCellar", "It smells like sulfur and other fart-like Goblin spells.", this);

          // Hashmark debugging graphics
          hashmarkGraphics = this.add.graphics();
          this.input.keyboard.on('keydown-H', toggleHashmarks.bind(this, this));
    
         // Load the sprite's previous coordinates from localStorage, if available
         const savedX = localStorage.getItem('spriteX');
         const savedY = localStorage.getItem('spriteY');
         const startX = savedX ? parseFloat(savedX) : 100;
         const startY = savedY ? parseFloat(savedY) : 525;
    
        // Retrieve isGoblinForm from local storage or set default to false (princess)
        this.isGoblinForm = localStorage.getItem('isGoblinForm') === 'true';
    
        // Remove 'walk' animation if it exists
        if (this.anims.exists('walk')) {
            this.anims.remove('walk');
        }
    
        // Create walking animations for both forms
        if (!this.anims.exists('walk')) {
            this.anims.create({
                key: 'walk',
                frames: this.anims.generateFrameNumbers('character', { start: 0, end: 5 }),
                frameRate: 10,
                repeat: -1
            });
        }
    
        if (this.anims.exists('goblinWalk4')) {
            this.anims.remove('goblinWalk4');
        }
    
        if (!this.anims.exists('goblinWalk4')) {
            this.anims.create({
                key: 'goblinWalk4',
                frames: this.anims.generateFrameNumbers('goblingirl', { start: 0, end: 5 }),
                frameRate: 10,
                repeat: -1
            });
        }
    
        // Create the main sprite for the player character based on isGoblinForm
        this.sprite = this.physics.add.sprite(startX, startY, this.isGoblinForm ? 'goblingirl' : 'character');
        this.sprite.setScale(3);
        this.sprite.setDepth(1);
        this.sprite.body.collideWorldBounds = true;
    
        // Play the correct animation on creation
        this.sprite.anims.play(this.isGoblinForm ? 'goblinWalk4' : 'walk', true);
    
        // Input cursor keys for controlling the character
        this.cursors = this.input.keyboard.createCursorKeys();
    
        // Input keyboard for transitioning between forms
        this.input.keyboard.on('keydown-T', () => {
            this.toggleForm();
        });

        // Create Goblin King animation
        this.anims.create({
            key: 'goblinKingWalk',
            frames: this.anims.generateFrameNumbers('goblinKing', { start: 0, end: 5 }),
            frameRate: 10,
            repeat: -1
        });

        
    

        // Create no-go zones
        this.noGoZones = this.physics.add.staticGroup();
        this.noGoZones.create(290, 295, null).setSize(165, 95).setVisible(false); // No-go zone 1
        this.noGoZones.create(600, 600, null).setSize(165, 195).setVisible(false); // No-go zone 2
        this.noGoZones.create(950, 295, null).setSize(165, 195).setVisible(false); // No-go zone 3
        this.noGoZones.create(1220, 600, null).setSize(165, 195).setVisible(false); // No-go zone 4

        this.physics.add.collider(this.sprite, this.noGoZones, this.handleNoGoZoneCollision, null, this);

        

        // Add the transition zone to another scene (Castle Prairie)
        this.transitionZone = this.add.zone(1240, 200, 180, 1).setOrigin(0.5); // Transition area
        this.physics.add.existing(this.transitionZone);
        this.transitionZone.body.setAllowGravity(false);
        this.transitionZone.body.setImmovable(true);
        this.physics.add.overlap(this.sprite, this.transitionZone, this.showamissive, null, this); 

        // Enable drag and drop for inventory items
        this.input.on('dragstart', (pointer, gameObject) => {
            gameObject.setScale(0.28); // Scale up slightly when dragging starts
            gameObject.originalX = gameObject.x; // Store the original X position
            gameObject.originalY = gameObject.y; // Store the original Y position
        });

        this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
            gameObject.x = dragX;
            gameObject.y = dragY;
        });

        this.input.on('dragend', (pointer, gameObject) => {
            gameObject.setScale(0.15); // Restore the original scale

            const itemBounds = gameObject.getBounds();

            if (gameObject.texture.key === 'torch' && !this.torchUsed) {
                this.darkOverlay.clear();
                this.torchUsed = true;

                showMessage("The room is now illuminated by the torch.", this);

                this.goblinKing = this.physics.add.sprite(1150, 450, 'goblinKing').setScale(3);
                this.goblinKing.anims.play('goblinKingWalk', true);

                // Make the Goblin King flee after a brief appearance
                this.tweens.add({
                    targets: this.goblinKing,
                    x: 1250,
                    y: 200,
                    duration: 3000,
                    onComplete: () => {
                        this.goblinKing.destroy();
                        showMessage("Goblins are moving out from the castle.", this);
                    }
                });

                // Return the torch to its original position
                gameObject.x = gameObject.originalX;
                gameObject.y = gameObject.originalY;
            } else {
                if (
                    itemBounds.right <= inventoryPanel.x + inventoryPanel.width &&
                    itemBounds.left >= inventoryPanel.x &&
                    itemBounds.bottom <= inventoryPanel.y + inventoryPanel.height &&
                    itemBounds.top >= inventoryPanel.y
                ) {
                    return;
                } else {
                    showMessage("You can't drop the item here!", this);
                    gameObject.x = gameObject.originalX;
                    gameObject.y = gameObject.originalY;
                }
            }
        });

       

        localStorage.setItem('currentScene', 'GoblinCellar');

        // Call the shard pickup creation function
        this.createShardPickup();
    }

    createShardPickup() {
        const orbX = 560;
        const orbY = 60;
        const pickupRadius = 200;  // Increase pickup radius for easier proximity detection
    
        /* // Draw the debugging circle where the player can pick up the shard
        const debugGraphics = this.add.graphics();
        debugGraphics.lineStyle(2, 0xff0000, 1);  // Red color with full opacity
        debugGraphics.strokeCircle(orbX, orbY, pickupRadius);  // Draw the circle at the shard's position */
    
        // Add a listener for when the player clicks near the shard
        this.input.on('pointerdown', (pointer) => {
            // Log player and shard positions for debugging
            console.log('Player Position:', this.sprite.x, this.sprite.y);
            console.log('Shard Position:', orbX, orbY);
    
            const distance = Phaser.Math.Distance.Between(this.sprite.x, this.sprite.y, orbX, orbY);
    
            console.log('Distance between player and shard:', distance);
    
            if (distance <= pickupRadius) {
                // Log the shard pick up for debugging
                console.log('Player clicked within range of the shard.');
    
                // Add the shard to the inventory (proximity is already checked in the addItem method)
                inventory.addItem({ name: 'powderkeg', img: 'powderkeg', x: orbX, y: orbY }, this.sprite);
    
                // Show a message that the shard was picked up
                showMessage("You have picked up a keg of sulfurous powder.", this);
    
                // Draw a little green box in the shard zone
                const whiteBox = this.add.graphics();
                whiteBox.fillStyle(0x929000, 1);  // Set the color to green with full opacity
                whiteBox.fillRect(orbX - 65, orbY - 21, 119, 68);  // Draw the 40x40 box centered at the shard's position
    
                // Optionally, you can stop further pointerdown listeners for this shard after it's picked up
                this.input.off('pointerdown');

                localStorage.setItem('has powderkeg', true);

            } else {
                // If player clicks outside of range, display a too far message
                showMessage("You're too far away to pick up the powder keg.", this);
                console.log('Player clicked outside of shard pickup range.');
            }
        });
    }

    // Handle movement restrictions (No-go zones)
    handleNoGoZoneCollision(sprite, zone) {
        if (sprite.body.touching.left || sprite.body.touching.right) {
            sprite.setVelocityX(0);
        }
        if (sprite.body.touching.up || sprite.body.touching.down) {
            sprite.setVelocityY(0);
        }
    }

   // Transition to Castle Prairie scene
   showamissive() {
    showMessage("Some magick precludes you following the goblin army.", this);
    } 
    toggleForm() {
        // Toggle the form
        this.isGoblinForm = !this.isGoblinForm;
        
        // Save the updated form to local storage
        localStorage.setItem('isGoblinForm', this.isGoblinForm);
    
        // Stop any currently playing animations
        this.sprite.anims.stop();
    
        // Switch the sprite texture and play the appropriate animation
        if (this.isGoblinForm) {
            this.sprite.setTexture('goblingirl'); // Switch to goblin girl texture
            this.sprite.anims.play('goblinWalk4', true); // Play goblin girl walking animation
        } else {
            this.sprite.setTexture('character'); // Switch to princess texture
            this.sprite.anims.play('walk', true); // Play princess walking animation
        }
    }
    update() {
        let moving = false;

        // Handle movement and walking animation
        if (this.cursors.left.isDown) {
            this.sprite.setVelocityX(-200);
            this.sprite.setFlipX(true);
            moving = true;
        } else if (this.cursors.right.isDown) {
            this.sprite.setVelocityX(200);
            this.sprite.setFlipX(false);
            moving = true;
        } else {
            this.sprite.setVelocityX(0); // Stop horizontal movement
        }

        if (this.cursors.up.isDown) {
            this.sprite.setVelocityY(-200);
            moving = true;
        } else if (this.cursors.down.isDown) {
            this.sprite.setVelocityY(200);
            moving = true;
        } else {
            this.sprite.setVelocityY(0); // Stop vertical movement
        }

        // Play the correct walking animation based on the current form
    if (moving) {
        if (this.isGoblinForm) {
            if (!this.sprite.anims.isPlaying || this.sprite.anims.currentAnim.key !== 'goblinWalk4') {
                this.sprite.anims.play('goblinWalk4', true);  // Play Goblin Girl walking animation
            }
        } else {
            if (!this.sprite.anims.isPlaying || this.sprite.anims.currentAnim.key !== 'walk') {
                this.sprite.anims.play('walk', true);  // Play Princess walking animation
            }
        }
    } else {
        this.sprite.setVelocity(0, 0);
        this.sprite.anims.stop();
        this.sprite.setFrame(1);  // Idle frame when not moving
    }


        // Prevent the sprite from going out of bounds
        if (this.sprite.y < 160) {
            this.sprite.y = 160;
        }
        if (this.sprite.x > 1350) {
            this.sprite.x = 1350;
        }

        // Transition back to Tower2 if sprite moves beyond the left side (x < 0)
        if (this.sprite.x < 106 && !this.hasTransitioned) {
            localStorage.setItem('spriteX', 280);  // Adjust as needed
            localStorage.setItem('spriteY', 400);
            this.hasTransitioned = true;
            console.log("Transitioning to Tower2");
            this.scene.start('Cavern1b');  // Replace with the correct scene key
        }
    }
}
