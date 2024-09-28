class Cavernthrone extends Phaser.Scene {
    constructor() {
        super({ key: 'Cavernthrone' });
    }

    preload() {
        // Preload assets
        this.load.image('background_ct1', 'graphics/goblin_throneroom_grak.png');
        this.load.spritesheet('character', 'graphics/grahamprincesspng.png', { frameWidth: 28.5, frameHeight: 70 });
        this.load.spritesheet('goblingirl', 'graphics/goblingirl.png', { frameWidth: 28.5, frameHeight: 70 });
        this.load.image('grak', 'graphics/grak.png'); // Grak guard sprite
        this.load.image('door', 'graphics/door.png'); // Door for interactive zone
        this.load.image('amulet', 'graphics/graks_amulet.png'); // Amulet image
    }

    create() {
        console.log('Creating Cavernthrone scene');
    
        // Set the background
        const background = this.add.image(750, 450, 'background_ct1');
        background.setDepth(0);
    
        // Initialize the inventory
        createInventory(this);
    
        // Reset message panel if it exists
        if (messagePanel) {
            messagePanel.destroy();
            messagePanel = null;
        }
    
        // Show intro message when entering Cavernhall
        checkIntroMessage(this, "Cavernthrone", "Grak the Goblin King holds court in his rather empty echoing halls.", this);
    
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
    
        // Create interactive zone for Goblin King
        this.goblinKingZone = this.add.zone(720, 200, 200, 400).setOrigin(0, 0).setInteractive();
        this.goblinKingZone.on('pointerdown', () => {
            this.interactWithGoblinKing();
        });

        // Draw debugging zone around Goblin King interactive zone
    const debugGraphics = this.add.graphics();
    debugGraphics.lineStyle(2, 0xff0000);  // Red outline
    debugGraphics.strokeRect(this.goblinKingZone.x, this.goblinKingZone.y, this.goblinKingZone.width, this.goblinKingZone.height);

   
     

       // Handle dragging
       this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
           gameObject.x = dragX;
           gameObject.y = dragY;
       });

       this.input.on('dragend', (pointer, gameObject) => {
        // Reset the scale after dragging
        gameObject.setScale(0.15);
    
        // Get the bounds of the Goblin King or Grak
        const grakBounds = this.goblinKingZone.getBounds();
        const pointerX = pointer.worldX || pointer.x;
        const pointerY = pointer.worldY || pointer.y;
    
        // Check if the dragged item is dropped on Grak and if the item's texture key is 'mirrorshard'
        if (Phaser.Geom.Rectangle.Contains(grakBounds, pointerX, pointerY) && gameObject.texture.key === 'mirrorshard') {
            // Call the function to handle the event when the shard is given to Grak
            
            showMessage("You confront the Goblin King with the shard of the Magick Mirror to see who really is behind this hall of mirrors.", this);

            // Set a 5-second freeze
        this.time.delayedCall(5000, () => {
            // Camera shake for 4 seconds
            this.cameras.main.shake(4000, 0.01);
    
            // After shake completes, fade to black for 2 seconds
            this.time.delayedCall(4000, () => {
                this.cameras.main.fadeOut(2000, 0, 0, 0);  // Fade out over 2 seconds
    
                // After fade out completes, switch to the next scene
                this.cameras.main.once('camerafadeoutcomplete', () => {
                    localStorage.setItem('spriteX', 750);  // Save the sprite's position for the next scene
                    localStorage.setItem('spriteY', 750);
                    this.scene.start('Cavernthrone2');  // Start the next scene
                    
                    // Fade in the new scene over 2 seconds
                    this.cameras.main.fadeIn(2000, 0, 0, 0);  // Fade in over 2 seconds
                });
    
                // Flash after fade-out
                this.cameras.main.once('camerafadeoutcomplete', () => {
                    this.cameras.main.flash(3000, 255, 255, 255); // Flash for 3 seconds
                });
            });
        });
    
            /* // Optionally, destroy or handle the shard after interaction
            gameObject.destroy();
    
            // Optionally remove the shard from inventory (if necessary)
            inventory.removeItem({ name: 'mirrorshard' }); */
        } else {
            // If not dropped on Grak or it's a different item, add the item to the inventory based on its texture key
            inventory.addItemnp({ name: gameObject.texture.key, img: gameObject.texture.key });
            inventory.updateInventoryDisplay();
    
        
        }
    });
    
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
    
    interactWithGoblinKing() {
        if (this.isGoblinForm) {
            showMessage("What are you doing here? Go find the princess!", this);
        } else {
            showMessage("Ah, princess. Your hopes to escape were revealed to be rather empty and pathetic. Soon my plans will be complete. Right now 1,000 goblins march on your castle. By morning, the entire kingdom will belong to me. If you wish to sit at my side, I would be most delighted.", this);
            
           
        }
    }
    
    
   

    update() {
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
                 // Block the player's exit
            this.exitBlocked = true; 
            }
        } else {
            this.sprite.setVelocity(0, 0);
            this.sprite.anims.stop();
            this.sprite.setFrame(1);  // Reset to idle frame
        }
    
        // Check if the exit is blocked by the Goblin King
        if (this.sprite.y > 900) {
            this.sprite.y = 900;
            if (this.exitBlocked) {
                showMessage("The Goblin King has blocked your exit with dark magick.", this);
                
            } else {
                console.log('Transitioning to Cavernhall scene');
                localStorage.setItem('spriteX', this.sprite.x);  // Optionally save the sprite's current position
                localStorage.setItem('spriteY', 500);  // Optionally save the sprite's current position
                this.scene.start('Cavernhall');
            }
        }
    }
}    