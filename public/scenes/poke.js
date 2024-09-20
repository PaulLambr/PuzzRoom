class Poke extends Phaser.Scene {
    constructor() {
        super({ key: 'Poke' });
    }

    preload() {
        // Load all assets
        this.load.image('background_pig', 'graphics/poke.png');
        this.load.image('parchment_bg', 'graphics/parchment_bg.png');
        this.load.spritesheet('character', 'graphics/grahamprincesspng.png', { frameWidth: 28.5, frameHeight: 70 });
        this.load.image('amulet', 'graphics/graks_amulet.png');
        this.load.image('mirror', 'graphics/mirror.png');
        this.load.image('torch', 'graphics/torch.png');
        this.load.image('bone', 'graphics/bone.png');
        this.load.image('corn', 'graphics/corn.png');
        this.load.spritesheet('pig', 'graphics/piggy17270.png', { frameWidth: 57, frameHeight: 70 });
        this.load.image('debris_cloud', 'graphics/debris.png'); 
    }

    create() {
        console.log('Creating Poke scene');
        
        // Initialize corn drop zone unlocked variable
        this.isCornZoneUnlocked = false;

        // Background and player sprite
        const background = this.add.image(750, 450, 'background_pig').setDepth(0);

        // Load saved position of the sprite if available
        const savedX = localStorage.getItem('spriteX');
        const savedY = localStorage.getItem('spriteY');
        const startX = savedX ? parseFloat(savedX) : 100;
        const startY = savedY ? parseFloat(savedY) : 850;

        // Create the player sprite
        this.sprite = this.physics.add.sprite(startX, startY, 'character').setScale(3).setCollideWorldBounds(true);
        this.sprite.setDepth(1);

        // Walking animation
        this.anims.create({
            key: 'walk',
            frames: this.anims.generateFrameNumbers('character', { start: 0, end: 5 }),
            frameRate: 10,
            repeat: -1
        });

        // Pig animation
        this.anims.create({
            key: 'pigMove',
            frames: this.anims.generateFrameNumbers('pig', { start: 0, end: 2 }),
            frameRate: 6,
            repeat: -1
        });

        // Input cursor keys
        this.cursors = this.input.keyboard.createCursorKeys();

        // Create the inventory panel and load any saved items
        createInventory(this);

        // Reset message panel if it exists
        if (messagePanel) {
            messagePanel.destroy();
            messagePanel = null;
        }

        // Display an intro message when entering the scene
        checkIntroMessage(this, "Poke", "What a quaint boarded-up hut in the middle of nowhere. A strange pig is running amok.");

        // Hashmark debugging graphics
        hashmarkGraphics = this.add.graphics();
        this.input.keyboard.on('keydown-H', toggleHashmarks.bind(this, this));



        // Set current scene
        localStorage.setItem('currentScene', 'ShoreRiver1');

        // Prevent multiple transitions
        this.hasTransitioned = false;


        // Corn acquisition zone
        const cornZone = this.add.zone(350, 125, 400, 250).setInteractive();
        cornZone.on('pointerdown', () => {
            const cornInInventory = inventory.items.find(i => i.name === 'corn');
            if (!cornInInventory) {
                showMessage("You pick out a juicy ear of corn.", this);
                inventory.addItem({ name: 'corn', img: 'corn', x: cornZone.x, y: cornZone.y }, this.sprite);
            } else {
                showMessage("You already have the corn in your inventory.", this);
            }
        });

        // Corn drop zone
        this.cornDropZone = this.add.zone(650, 450, 150, 250).setRectangleDropZone(150, 250).setInteractive();

        // For debugging, visualize the drop zone
        const graphics = this.add.graphics();
        graphics.lineStyle(2, 0xff0000);  // Red outline for debugging
        graphics.strokeRect(this.cornDropZone.x - 75, this.cornDropZone.y - 125, 150, 250);

        // Enable physics for the corn drop zone
        this.physics.world.enable(this.cornDropZone);
        this.cornDropZone.body.setAllowGravity(false);
        this.cornDropZone.body.moves = false;

        // Pig logic
        const randomX = Phaser.Math.Between(0, configBridge.width - 57 * 5);
        const randomY = Phaser.Math.Between(0, configBridge.height - 70 * 5);
        this.pig = this.physics.add.sprite(randomX, randomY, 'pig').setScale(5);
        this.pig.anims.play('pigMove', true);
        movePig.call(this);

        // Repeated pig movement
        this.time.addEvent({
            delay: 2000,
            loop: true,
            callback: movePig,
            callbackScope: this
        });

        this.pig.setInteractive();
        this.pig.on('pointerdown', () => {
            showMessage("This pig is too slippery to grab.", this);
        });

        // Drag and Drop Logic
        this.input.on('dragstart', (pointer, gameObject) => {
            gameObject.setScale(0.15);  // Scale during drag
            gameObject.originalX = gameObject.x;
            gameObject.originalY = gameObject.y;
        });

        this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
            gameObject.x = dragX;
            gameObject.y = dragY;
        });

        this.input.on('dragend', (pointer, gameObject) => {
            gameObject.setScale(0.15);  // Reset size after dragging

            const dropZoneBounds = this.cornDropZone.getBounds();
            const tolerance = 30;

            // Check if the pointer is within the drop zone bounds
            if (
                pointer.x >= dropZoneBounds.x - tolerance &&
                pointer.x <= dropZoneBounds.x + dropZoneBounds.width + tolerance &&
                pointer.y >= dropZoneBounds.y - tolerance &&
                pointer.y <= dropZoneBounds.y + dropZoneBounds.height + tolerance &&
                gameObject.texture.key === 'corn'  // Only trigger if corn is dropped
            ) {
                console.log('Corn dropped in the correct zone');
                handleCornDropSuccess.call(this, gameObject);
            } else {
                console.log("Corn dropped in the wrong zone");
                showMessage("You can't drop the corn here!", this);
                gameObject.x = gameObject.originalX;
                gameObject.y = gameObject.originalY;
            }
        });

        // Overlap logic to transition to the Cellar scene after unlocking the corn zone
        this.physics.add.overlap(this.sprite, this.cornDropZone, () => {
            if (this.isCornZoneUnlocked) {
                console.log('Corn zone unlocked, transitioning to Cellar scene...');
                this.scene.start('HutInterior');  // Transition to the Cellar scene
            }
        });

       
    }

    update() {
        // Player movement logic
        let moving = false;
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

         // Transition to CastlePrairie if sprite moves beyond 50 pixels on the left
     if (this.sprite.x > 1400 && !this.hasTransitioned) {
        console.log('Transitioning to RplusG scene');
        localStorage.setItem('spriteX', this.sprite.x - 1200);
        localStorage.setItem('spriteY', this.sprite.y);
        this.hasTransitioned = true;
        this.scene.start('Grassriver1');
    }
    }
}

// Pig movement logic
function movePig() {
    const randomX = Phaser.Math.Between(0, configBridge.width - 57 * 5);
    const randomY = Phaser.Math.Between(0, configBridge.height - 70 * 5);
    this.pig.setFlipX(randomX < this.pig.x);
    this.tweens.add({
        targets: this.pig,
        x: randomX,
        y: randomY,
        duration: 2000,
        ease: 'Power2',
        onComplete: () => {
            movePig.call(this);
        },
        callbackScope: this
    });

    
}

// When corn is successfully dropped and pig crashes through the zone
function handleCornDropSuccess(gameObject) {
    console.log('Corn recognized');
    
    // Pig animation and disappearing logic
    const targetX = 725;  // Center of the drop zone
    this.pig.setFlipX(this.pig.x > targetX);
    
    this.tweens.add({
        targets: this.pig,
        x: targetX,
        y: 575,
        duration: 1000,
        ease: 'Power2',
        onComplete: () => {
            this.pig.destroy();
            const debrisCloud = this.add.image(725, 575, 'debris_cloud').setScale(1.5);
            this.time.delayedCall(500, () => {
                debrisCloud.destroy();
                const graphics = this.add.graphics();
                graphics.fillStyle(0x000000, 1);
                graphics.fillRect(650, 450, 150, 250);
                showMessage("The pig crashes through the wood to reach the corn.", this);

                // Unlock the corn zone
                this.isCornZoneUnlocked = true;
            }, [], this);
        },
        callbackScope: this
    });

    // Remove the corn from the inventory
    inventory.removeItem({ name: 'corn', img: 'corn' });
}
