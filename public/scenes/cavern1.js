class Cavern1 extends Phaser.Scene {
    constructor() {
        super({ key: 'Cavern1' });

        // Declare cageLocked as a class property (initially true)
        this.cageLocked = true;
    }

    preload() {
        // Preload assets (unchanged)
        this.load.image('background_cav', 'graphics/cavern.png');
        this.load.spritesheet('character', 'graphics/grahamprincesspng.png', { frameWidth: 28.5, frameHeight: 70 });
        this.load.spritesheet('goblingirl', 'graphics/goblingirl.png', { frameWidth: 28.5, frameHeight: 70 });

        this.load.spritesheet('goblinKing', 'graphics/goblin.png', { frameWidth: 28.5, frameHeight: 70 });
        this.load.image('parchment_bg', 'graphics/parchment_bg.png');
        this.load.image('amulet', 'graphics/graks_amulet.png');
        this.load.image('silverSword', 'graphics/silver_sword.png');
        this.load.image('door', 'graphics/door.png');
        this.load.image('grak', 'graphics/grak.png');
    }

    create() {
        // Set the cavern background
        this.add.image(750, 450, 'background_cav');

        // Initialize the cage as locked
        this.cageLocked = true;

        
        // Reset message panel if it exists
        if (messagePanel) {
            messagePanel.destroy();
            messagePanel = null;
        }

        // Show intro message when entering Castle Prairie
        checkIntroMessage(this, "Cavern1", "This is crazy.", this);


        // Create the character sprite and position it in the cage
        this.sprite = this.physics.add.sprite(1050, 500, 'character').setScale(3);
        this.sprite.body.collideWorldBounds = true;

        // Walking animation for the character
        this.anims.create({
            key: 'walk',
            frames: this.anims.generateFrameNumbers('character', { start: 0, end: 5 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'goblinWalk',
            frames: this.anims.generateFrameNumbers('goblingirl', { start: 0, end: 5 }),
            frameRate: 10,
            repeat: -1
        });
        

        this.anims.create({
            key: 'goblinKingWalk',
            frames: this.anims.generateFrameNumbers('goblinKing', { start: 0, end: 5 }),
            frameRate: 10,
            repeat: -1
        });

        // Input cursor keys for controlling the character
        this.cursors = this.input.keyboard.createCursorKeys();

        // Create the cage
        this.createCage();

        // Add Grak sprite
        this.grak = this.add.sprite(550, 260, 'grak').setScale(1.5);

        // Create the inventory panel (to the right of the 1500px gameplay area)
        createInventory.call(this, this);

        // Initialize inventory and load its state
        inventory.loadInventoryState();
        inventory.updateInventoryDisplay();

        // Enable dragging from the inventory
        this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
            gameObject.x = dragX;
            gameObject.y = dragY;
        });

        // Handle drag end events
        this.setupDragEvents();

        // Start a delayed event for spawning the Goblin King
        this.time.delayedCall(10000, this.spawnGoblinKing, [], this);

        // Add the door interactive zone
        this.createInteractiveZones();

        // Show intro message
        checkIntroMessage(this, "Cavern1", "The first thing that assaults you, besides the indignity of your false imprisonment, is the reek of this dank cavern.", this);
    }

    update() {
        let moving = false;

        // Define the bounds for the cage
        const cageLeft = this.cageLocked ? 1050 - 175 : 0;  // Left boundary of the cage when locked
        const cageRight = this.cageLocked ? 1050 + 175 : this.scale.width;  // Right boundary of the cage when locked
        const cageTop = this.cageLocked ? 500 - 175 : 0;  // Top boundary of the cage when locked
        const cageBottom = this.cageLocked ? 500 + 175 : this.scale.height;  // Bottom boundary of the cage when locked

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

        // Check if the character is moving and play the appropriate animation
        if (moving) {
            if (this.isGoblinForm) {
                this.sprite.anims.play('goblinWalk', true);  // Goblin walking animation
            } else {
                this.sprite.anims.play('walk', true);  // Princess walking animation
            }
        } else {
            this.sprite.setVelocity(0, 0);
            this.sprite.anims.stop();
            this.sprite.setFrame(1);  // Ensure the sprite stops in the correct frame
        }
    }

    createCage() {
        const cageSize = 350;
        const cageX = 1050;
        const cageY = 500;

        // Draw the cage
        const cageGraphics = this.add.graphics({ lineStyle: { width: 12, color: 0x000000 } });
        cageGraphics.strokeRect(cageX - cageSize / 2, cageY - cageSize / 2, cageSize, cageSize);

        cageGraphics.beginPath();
        for (let i = cageX - cageSize / 2 + 25; i <= cageX + cageSize / 2 - 25; i += 50) {
            cageGraphics.moveTo(i, cageY - cageSize / 2);
            cageGraphics.lineTo(i, cageY + cageSize / 2);
        }
        cageGraphics.strokePath();

        // Define the cage bounds as a Phaser.Geom.Rectangle
        this.cageBounds = new Phaser.Geom.Rectangle(cageX - cageSize / 2, cageY - cageSize / 2, cageSize, cageSize);
    }

    setupDragEvents() {
        this.input.on('dragstart', (pointer, gameObject) => {
            // Increase item size when dragging
            gameObject.setScale(0.28);
            gameObject.originalX = gameObject.x;
            gameObject.originalY = gameObject.y;
        });

        this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
            // Update item position during dragging
            gameObject.x = dragX;
            gameObject.y = dragY;
        });

        this.input.on('dragend', (pointer, gameObject) => {
            gameObject.setScale(0.15);  // Reset the size after dragging

            console.log('Dragged item:', gameObject.texture.key);
            console.log('Pointer dropped at:', pointer.x, pointer.y);

            // Fetch Grak's bounds
            const grakBounds = this.grak.getBounds();
            console.log('Grak bounds:', grakBounds);

            // Use pointer's world position for checking
            const pointerX = pointer.worldX || pointer.x;
            const pointerY = pointer.worldY || pointer.y;

            console.log('Pointer world position:', pointerX, pointerY);

            // Check if the pointer's position is within Grak's bounds and if the item is the amulet
            if (Phaser.Geom.Rectangle.Contains(grakBounds, pointerX, pointerY) && gameObject.texture.key === 'amulet') {
                console.log("Amulet dropped on Grak, capturing his soul!");
                this.captureGrakSoul(gameObject);  // Trigger the event only if the amulet is dropped on Grak
            } else {
                console.log("Dropped elsewhere, returning to inventory");
                // Add item back to inventory
                inventory.addItemnp({ name: gameObject.texture.key, img: gameObject.texture.key });
                inventory.updateInventoryDisplay();
                gameObject.destroy();
            }
        });
    }

    captureGrakSoul(amuletSprite) {
        console.log("Removing amulet from inventory...");
        inventory.removeItem({ name: 'amulet' });
        inventory.updateInventoryDisplay();  // Update the display

        console.log("Adding SoulSwitcher to inventory...");
        inventory.addItemnp({ name: 'soulswitcher', img: 'soulswitcher' });
        inventory.updateInventoryDisplay();  // Ensure the new item shows up

        showMessage("Grak's soul is captured in the amulet, which is now the SoulSwitcher!", this);

        this.grak.destroy();
        console.log("Grak destroyed and soul captured.");

        this.spawnSword(this.grak.x, this.grak.y);
        this.transformToGoblin();
    }

    spawnSword(x, y) {
        const swordSprite = this.physics.add.sprite(x, y, 'silverSword').setInteractive();
        swordSprite.setScale(1.5);
        swordSprite.setDisplaySize(64, 64);
    
        // Add a click event to the sword
        swordSprite.on('pointerdown', (pointer) => {
            const distance = Phaser.Math.Distance.Between(this.sprite.x, this.sprite.y, swordSprite.x, swordSprite.y);
            
            if (distance < 100) { // Check if the player is close enough (within 100px)
                console.log("Player is close enough to collect the sword.");
                
                // Add the sword to inventory when close enough
                inventory.addItem({ name: 'Silver Sword', img: 'silverSword', x: swordSprite.x, y: swordSprite.y }, this.sprite);
                swordSprite.destroy();  // Remove the sword from the game world
                showMessage("You have collected the Silver Sword!", this);
            } else {
                showMessage("You are too far from the sword to collect it.", this);
                console.log("Player is too far from the sword.");
            }
        });
    }
    
    

    transformToGoblin() {
        this.isGoblinForm = true;
        console.log("Transforming to Goblin Girl");
    
        // Explicitly set the Goblin Girl texture and force an update
        /*this.sprite.anims.stop();  // Stop any running animation
this.sprite.setTexture('goblingirl');  // Now set the correct texture
*/
        this.sprite.setTexture('goblingirl');
        console.log("Texture set to Goblin Girl:", this.sprite.texture.key);
    
        // Play the goblin girl walking animation
        this.sprite.anims.play('goblinWalk', true);
    
        // Double check the applied texture after setting
        if (this.sprite.texture.key !== 'goblingirl') {
            console.error("Failed to set texture to Goblin Girl, current texture:", this.sprite.texture.key);
        }
    
        showMessage("You have transformed into the Goblin Girl!", this);
    }
    
    
    

    spawnGoblinKing() {
        if (this.goblinKingAppeared) return; // Prevent multiple spawns

        this.goblinKingAppeared = true;
        const goblinKing = this.physics.add.sprite(350, 175, 'goblinKing').setScale(3);
        goblinKing.anims.play('goblinKingWalk', true);

        this.physics.moveTo(goblinKing, 1050 - 350 / 2 - 250, 500, 100);

        this.handleGoblinKingMovement(goblinKing);
    }

    handleGoblinKingMovement(goblinKing) {
        const stopX = 1050 - 350 / 2 - 250;

        this.time.addEvent({
            delay: 10,
            loop: true,
            callback: () => {
                const distance = Phaser.Math.Distance.Between(goblinKing.x, goblinKing.y, stopX, 500);
                if (distance < 10) {
                    goblinKing.setVelocity(0);
                    goblinKing.anims.stop();

                    if (this.isGoblinForm) {
                        showMessage("How did you get in there Grak? The prisoner must have escaped.", this);
                        this.freeGoblinGirl();
                    } else {
                        showMessage("The Goblin King drains your life force. YOU HAVE DIED!", this);
                        this.gameOver();
                    }
                }
            },
            callbackScope: this
        });
    }

    createInteractiveZones() {
        const doorZone = this.add.zone(350, 175, 220, 250).setRectangleDropZone(175, 250);
        this.physics.add.existing(doorZone, true);
        const doorImage = this.add.image(350, 175, 'door').setScale(1);

        doorZone.setInteractive();
        doorZone.on('pointerdown', () => {
            showMessage("You hear goblin revelry.", this);
        });
    }

    freeGoblinGirl() {
        this.cageLocked = false;  // Unlock the cage
        showMessage("The Goblin Girl is free!", this);
    }

    gameOver() {
        // Logic for ending the game
        console.log("Game Over");
    }
}
