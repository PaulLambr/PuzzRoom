class Cavern1 extends Phaser.Scene {
    constructor() {
        super({ key: 'Cavern1' });

        // Declare initial state properties
        this.cageLocked = true;
        this.isGoblinForm = false; // Initially, the princess has not transformed
        this.goblinKingAppeared = false; // Prevent multiple spawns of Goblin King
    }

    preload() {
        // Preload assets
        this.load.image('background_cav', 'graphics/cavern.png');
        this.load.spritesheet('character', 'graphics/grahamprincesspng.png', { frameWidth: 28.5, frameHeight: 70 });
        this.load.spritesheet('goblingirl', 'graphics/goblingirl.png', { frameWidth: 28.5, frameHeight: 70 });
        this.load.spritesheet('goblinKing', 'graphics/goblin.png', { frameWidth: 28.5, frameHeight: 70 });
        this.load.image('parchment_bg', 'graphics/parchment_bg.png');
        this.load.image('amulet', 'graphics/graks_amulet.png');
        this.load.image('silversword', 'graphics/silver_sword.png');
        this.load.image('door', 'graphics/door.png');
        this.load.image('grak', 'graphics/grak.png');
        this.load.image('dooropen', 'graphics/dooropen.png');  // Preload door open image
    }

    create() {
        // Set the cavern background
        this.add.image(750, 450, 'background_cav');

         // Reset message panel if it exists
         if (messagePanel) {
            messagePanel.destroy();
            messagePanel = null;
        }

        // Show intro message when entering the scene
        checkIntroMessage(this, "Cavern1", "The first thing that assaults you, besides the indignity of your false imprisonment, is the reek of this dank cavern.", this);

        // Create the character sprite (princess) and position it in the cage
        this.sprite = this.physics.add.sprite(1050, 500, 'character').setScale(3);
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

        // Remove 'walk' animation if it exists
       if (this.anims.exists('goblinWalk3')) {
        this.anims.remove('goblinWalk3');
    }
        // Create the walking animation for Goblin Girl
        if (!this.anims.exists('goblinWalk3')) {
            this.anims.create({
                key: 'goblinWalk3',
                frames: this.anims.generateFrameNumbers('goblingirl', { start: 0, end: 5 }),
                frameRate: 10,
                repeat: -1
            });
        }

        // Remove 'walk' animation if it exists
       if (this.anims.exists('goblinKingwalk')) {
        this.anims.remove('goblinKingwalk');
    }
        // Create the walking animation for Goblin King
        if (!this.anims.exists('goblinKingWalk')) {
            this.anims.create({
                key: 'goblinKingWalk',
                frames: this.anims.generateFrameNumbers('goblinKing', { start: 0, end: 5 }),
                frameRate: 10,
                repeat: -1
            });
        }

        // Input cursor keys for controlling the character
        this.cursors = this.input.keyboard.createCursorKeys();

        // Create the cage
        this.createCage();

        // Add Grak sprite
        this.grak = this.add.sprite(550, 260, 'grak').setScale(1.5);

        // Enable dragging from the inventory
        this.setupDragEvents();

        // Add the door interactive zone
        this.createInteractiveZones();

        // Create inventory (to the right of the 1500px gameplay area)
        createInventory.call(this, this);

        // Initialize inventory and load its state
        inventory.loadInventoryState();
        inventory.updateInventoryDisplay();

        // Start a delayed event for spawning the Goblin King
        this.time.delayedCall(10000, this.spawnGoblinKing, [], this);
    }

    update() {

        if (this.isGameOver) {
            this.sprite.setVelocity(0, 0);  // Ensure the sprite cannot move
            this.sprite.anims.stop();       // Stop any animation
            return;  // Prevent further update logic if the game is over
        }

        let moving = false;

        // Define the bounds for the cage
        const cageLeft = this.cageLocked ? 1050 - 175 : 0;
        const cageRight = this.cageLocked ? 1050 + 175 : this.scale.width;
        const cageTop = this.cageLocked ? 500 - 175 : 0;
        const cageBottom = this.cageLocked ? 500 + 175 : this.scale.height;

        // Restrict movement within the cage if it's locked
        if (this.cursors.left.isDown && this.sprite.getBounds().left > cageLeft) {
            this.sprite.setVelocityX(-200);
            this.sprite.setFlipX(true);
            moving = true;
        } else if (this.cursors.right.isDown && this.sprite.getBounds().right < cageRight) {
            this.sprite.setVelocityX(200);
            this.sprite.setFlipX(false);
            moving = true;
        } else {
            this.sprite.setVelocityX(0);
        }

        if (this.cursors.up.isDown && this.sprite.getBounds().top > cageTop) {
            this.sprite.setVelocityY(-200);
            moving = true;
        } else if (this.cursors.down.isDown && this.sprite.getBounds().bottom < cageBottom) {
            this.sprite.setVelocityY(200);
            moving = true;
        } else {
            this.sprite.setVelocityY(0);
        }

        // Ensure Goblin Girl texture stays intact after transformation
        if (this.isGoblinForm && this.sprite.texture.key !== 'goblingirl') {
            console.log('Fixing texture back to goblingirl');
            this.sprite.setTexture('goblingirl');  // Reapply Goblin Girl texture if it changes
        }

        // Check if the character is moving and play the appropriate animation
        if (moving) {
            if (this.isGoblinForm) {
                // Play Goblin Girl walking animation
                if (!this.sprite.anims.isPlaying || this.sprite.anims.currentAnim.key !== 'goblinWalk3') {
                    this.sprite.anims.play('goblinWalk3', true);
                }
            } else {
                // Play Princess walking animation
                if (!this.sprite.anims.isPlaying || this.sprite.anims.currentAnim.key !== 'walk') {
                    this.sprite.anims.play('walk', true);
                }
            }
        } else {
            this.sprite.setVelocity(0, 0);
            this.sprite.anims.stop();
            this.sprite.setFrame(1);
        }

        // Check if Goblin Girl moves past x = 100 and transition to the Bridge scene
    if (this.sprite.x < 200 && !this.hasTransitioned) {
        localStorage.setItem('spriteX', this.sprite.x + 1100);  // Set new starting position in the next scene
        localStorage.setItem('spriteY', this.sprite.y);
        this.hasTransitioned = true;

        // Transition to the Bridge scene
        this.scene.start('Cavernhall');
    }

    if (this.sprite.x > 1400) {
        console.log('Transitioning to Cavern1 scene');
        localStorage.setItem('spriteX', this.sprite.x - 1300);  // Optionally save the sprite's current position
        localStorage.setItem('spriteY', this.sprite.y);  // Optionally save the sprite's current position
        this.scene.start('Cavernhall2');
    }
    }

    transformToGoblin() {
    this.isGoblinForm = true;
    console.log("Transforming to Goblin Girl");

    // Stop all animations to avoid conflicts
    this.sprite.anims.stop();

    // Explicitly set the Goblin Girl texture and ensure it's correct
    this.sprite.setTexture('goblingirl');
    this.sprite.setFrame(0);  // Set to the first frame of Goblin Girl spritesheet

    // Log the current texture to check if it sticks
    console.log("Current sprite texture after transformation:", this.sprite.texture.key);

    // Ensure Goblin Girl's walk animation starts
    this.sprite.anims.play('goblinWalk3', true);

    showMessage("You have transformed into the Goblin Girl!", this);
    localStorage.setItem('isGoblinForm', true);  // Set true when transforming into Goblin Girl

}

    

    freeGoblinGirl() {
        this.cageLocked = false;
        showMessage("The Goblin Girl is free!", this);

        // Ensure Goblin Girl's walk animation plays continuously
        this.sprite.anims.play('goblinWalk3', true);

        // Exit Goblin King
        this.exitGoblinKing();
    }

    spawnGoblinKing() {
        if (this.goblinKingAppeared) return;

        this.goblinKingAppeared = true;
        this.goblinKing = this.physics.add.sprite(350, 175, 'goblinKing').setScale(3);
        this.goblinKing.anims.play('goblinKingWalk', true);

        console.log("Goblin King spawned:", this.goblinKing);

        this.handleGoblinKingMovement(this.goblinKing);
    }

    handleGoblinKingMovement(goblinKing) {
    // Move the Goblin King to the cage
    this.tweens.add({
        targets: goblinKing,
        x: 850,  // Position where the cage is located
        y: 500,  // Align with the cage's vertical position
        duration: 4000,  // Slow down movement to the cage
        ease: 'Linear',
        onComplete: () => {
            console.log("Goblin King reached the cage.");
    
            // Check if the player has transformed into Goblin Girl
            if (!this.isGoblinForm) {
                console.log("Princess is still in the cage. Game Over.");
                this.isGameOver = true;  // Prevent further player input
                
                this.gameOver();  // Call the gameOver method to display message and restart
            } else {
                // Free the Goblin Girl if transformation happened
                showMessage("How did you get in there Grak? The prisoner must have escaped.", this);
                this.time.delayedCall(5000, () => {
                    this.freeGoblinGirl();
                    this.time.delayedCall(1000, () => {
                        this.exitGoblinKing();
                    });
                });
            }
        }
    });
}


    exitGoblinKing() {
        // Ensure the Goblin King exits the scene
        this.goblinKing.setFlipX(true);
        this.goblinKing.anims.play('goblinKingWalk', true);

        this.tweens.add({
            targets: this.goblinKing,
            x: -200,
            duration: 5000,
            ease: 'Linear',
            onComplete: () => {
                console.log("Goblin King has left the stage and will be destroyed.");
                this.goblinKing.destroy();  // Destroy the Goblin King sprite after exiting
            }
        });
    }

    createCage() {
        const cageSize = 350;
        const cageX = 1050;
        const cageY = 500;

        const cageGraphics = this.add.graphics({ lineStyle: { width: 12, color: 0x000000 } });
        cageGraphics.strokeRect(cageX - cageSize / 2, cageY - cageSize / 2, cageSize, cageSize);

        cageGraphics.beginPath();
        for (let i = cageX - cageSize / 2 + 25; i <= cageX + cageSize / 2 - 25; i += 50) {
            cageGraphics.moveTo(i, cageY - cageSize / 2);
            cageGraphics.lineTo(i, cageY + cageSize / 2);
        }
        cageGraphics.strokePath();

        this.cageBounds = new Phaser.Geom.Rectangle(cageX - cageSize / 2, cageY - cageSize / 2, cageSize, cageSize);
    }

    setupDragEvents() {
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
            const grakBounds = this.grak.getBounds();
            const pointerX = pointer.worldX || pointer.x;
            const pointerY = pointer.worldY || pointer.y;

            if (Phaser.Geom.Rectangle.Contains(grakBounds, pointerX, pointerY) && gameObject.texture.key === 'amulet') {
                this.captureGrakSoul(gameObject);
            } else {
                inventory.addItemnp({ name: gameObject.texture.key, img: gameObject.texture.key });
                inventory.updateInventoryDisplay();
                gameObject.destroy();
            }

            // Ensure doorZone exists and has bounds before using them
    if (this.doorZone) {
        const doorBounds = this.doorZone.getBounds();
        const pointerX = pointer.worldX || pointer.x;
        const pointerY = pointer.worldY || pointer.y;

        // Check if the keys were dropped on the door
        if (Phaser.Geom.Rectangle.Contains(doorBounds, pointerX, pointerY) && gameObject.texture.key === 'keys') {
            this.unlockDoor(gameObject);  // Call the door unlock function
        } else {
            // Return the item to the inventory if not dropped on the door
            inventory.addItemnp({ name: gameObject.texture.key, img: gameObject.texture.key });
            inventory.updateInventoryDisplay();
            gameObject.destroy();
        }
    }
        });
    }

    captureGrakSoul(amuletSprite) {
        console.log("Removing amulet from inventory...");
        console.log("Adding SoulSwitcher to inventory...");
        inventory.addItemnp({ name: 'soulswitcher', img: 'soulswitcher' });
        inventory.updateInventoryDisplay();
        showMessage("Grak's soul is captured in the amulet, which is now the SoulSwitcher!", this);
        this.grak.destroy();
        this.spawnSword(this.grak.x, this.grak.y);
        this.transformToGoblin();
    }

    spawnSword(x, y) {
        const swordSprite = this.physics.add.sprite(x, y, 'silversword').setInteractive();
        swordSprite.setScale(1.5);
        swordSprite.setDisplaySize(64, 64);

        swordSprite.on('pointerdown', (pointer) => {
            const distance = Phaser.Math.Distance.Between(this.sprite.x, this.sprite.y, swordSprite.x, swordSprite.y);
            if (distance < 100) {
                inventory.addItem({ name: 'silversword', img: 'silversword', x: swordSprite.x, y: swordSprite.y }, this.sprite);
                swordSprite.destroy();
                showMessage("You have collected the Silver Sword!", this);
            } else {
                showMessage("You are too far from the sword to collect it.", this);
            }
        });
    }

    createInteractiveZones() {
        // Create doorZone and assign it to this.doorZone for global access
        this.doorZone = this.add.zone(350, 175, 220, 250).setRectangleDropZone(175, 250);
        this.physics.add.existing(this.doorZone, true); // Enable physics
        
        // Add the door image
        const doorImage = this.add.image(350, 175, 'door').setScale(1);
        
        // Make doorZone interactive
        this.doorZone.setInteractive();
        this.doorZone.on('pointerdown', () => {
            showMessage("You hear goblin revelry.", this);
        });
    }
    

    gameOver() {
        this.sprite.setVelocity(0, 0);  // Stop any movement of the sprite
        this.isGameOver = true;  // Set the flag to prevent any further input
    
        showMessage("Game Over! The Goblin King caught you before you transformed.", this);  // Display the game over message
    
        // Fade out and restart the scene after a delay
        this.time.delayedCall(2000, () => {  // 2-second delay before restarting
            this.cameras.main.fadeOut(1000, 0, 0, 0, () => {
                this.scene.restart();  // Restart the scene after fade-out
            });
        });
    }

    unlockDoor(gameObject) {
        // Overlay the 'dooropen' image on top of the 'door' image
        this.add.image(350, 175, 'dooropen').setScale(1).setDepth(1);
    
        showMessage("The door is unlocked!", this);
    
        // Add collision detection between the player and the open door
        this.physics.add.overlap(this.sprite, this.doorZone, () => {
            // Transition to the next scene (Caverncellar)
            this.scene.start('Caverncellar');
        });
    }
}    

//this works