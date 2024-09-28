class Cavern1b extends Phaser.Scene {
    constructor() {
        super({ key: 'Cavern1b' });

        this.cageLocked = false;
    }

    preload() {
        // Preload assets
        this.load.image('background_cavb', 'graphics/cavern.png');
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
        console.log('Creating Cavern1b scene');
        this.hasTransitioned = false;

        // Set the background
        const background = this.add.image(750, 450, 'background_cavb');
        background.setDepth(0);
    
        // Initialize the inventory
        createInventory(this);
    
        // Reset message panel if it exists
        if (messagePanel) {
            messagePanel.destroy();
            messagePanel = null;
        }
    
        // Show intro message when entering Cavernhall
        checkIntroMessage(this, "Cavern1b", "Testing.", this);

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
    
        // Remove 'walk' animation if it exists
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

        // Corrected line: Accessing inventory.items directly
    const swordInInventory = inventory.items.some(item => item.name === 'silversword');

    // If sword is not in the inventory, spawn it at (550, 260)
    if (!swordInInventory) {
        this.spawnSword(550, 260);
    }

     // Create the cage
     this.createCage();

     // Add the door interactive zone
     this.createInteractiveZones();

     // Enable dragging from the inventory
     this.setupDragEvents();
       
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
        console.log(this.sprite.anims.currentAnim ? this.sprite.anims.currentAnim.key : 'No animation playing');
    
        let moving = false;
    
        // Character movement logic
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
            this.sprite.setFrame(1);  // Reset to idle frame
        }
        

         // Check if Goblin Girl moves past x = 100 and transition to the Bridge scene
    if (this.sprite.x < 150 && !this.hasTransitioned) {
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
            
            // Get the bounds of the door
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
        });
    }
    
    unlockDoor(gameObject) {
        // Overlay the 'dooropen' image on top of the 'door' image
        this.add.image(350, 175, 'dooropen').setScale(1).setDepth(1);
    
        showMessage("The door is unlocked!", this);
    
        // Add collision detection between the player and the open door
        this.physics.add.overlap(this.sprite, this.doorZone, () => {
            // Transition to the next scene (Caverncellar)
            this.scene.start('GoblinCellar');
        });
    }
    
    createInteractiveZones() {
        // Create a drop zone for the door
        this.doorZone = this.add.zone(350, 175, 220, 250).setRectangleDropZone(175, 250);
        this.physics.add.existing(this.doorZone, true);  // Add physics for overlap detection
        const doorImage = this.add.image(350, 175, 'door').setScale(1);
        
        // Make the door interactive
        this.doorZone.setInteractive();
        this.doorZone.on('pointerdown', () => {
            showMessage("The door is locked.", this);
        });
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

}


