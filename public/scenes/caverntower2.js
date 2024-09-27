class Caverntower2 extends Phaser.Scene {
    constructor() {
        super({ key: 'Caverntower2' });
    }

    preload() {
        // Preload assets
        this.load.image('background_ct6', 'graphics/caverntower.png');
        this.load.spritesheet('character', 'graphics/grahamprincesspng.png', { frameWidth: 28.5, frameHeight: 70 });
        this.load.spritesheet('goblingirl', 'graphics/goblingirl.png', { frameWidth: 28.5, frameHeight: 70 });
        this.load.image('grak', 'graphics/grak.png'); // Grak guard sprite
        this.load.image('door', 'graphics/door.png'); // Door for interactive zone
        this.load.image('amulet', 'graphics/graks_amulet.png'); // Amulet image
    }

    create() {
        console.log('Creating Caverntower2 scene');
    
        // Set the background
        const background = this.add.image(750, 450, 'background_ct6');
        background.setDepth(0);
    
        // Initialize the inventory
        createInventory(this);
    
        // Reset message panel if it exists
        if (messagePanel) {
            messagePanel.destroy();
            messagePanel = null;
        }
    
        // Show intro message when entering Cavernhall
        checkIntroMessage(this, "Caverntower2", "This tower seems eerily familiar.", this);

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

        if (this.sprite.x > 1300 && this.sprite.x < 1500 && this.sprite.y < 106) {
            const hasShard = localStorage.getItem('has shard') === 'true';  // Check if 'has shard' is true in localStorage
            
            if (hasShard) {
                // If the shard has already been collected, transition to Cavernbedroom2
                console.log('Transitioning to Cavernbedroom2 scene');
                localStorage.setItem('spriteX', 150);  // Optionally save the sprite's current position
                localStorage.setItem('spriteY', 535);  // Optionally save the sprite's current position
                this.scene.start('Cavernbedroom2');  // Transition to Cavernbedroom2
            } else {
                // Otherwise, transition to Cavernbedroom
                console.log('Transitioning to Cavernbedroom scene');
                localStorage.setItem('spriteX', 150);  // Optionally save the sprite's current position
                localStorage.setItem('spriteY', 535);  // Optionally save the sprite's current position
                this.scene.start('Cavernbedroom');  // Transition to Cavernbedroom
            }
        }
        
        

        if (this.sprite.x < 150 && this.sprite.y > 0 && this.sprite.y < 150) {
            console.log('Transitioning to Caverntower1 scene');
            localStorage.setItem('spriteX', 1300);  // Optionally save the sprite's current position
            localStorage.setItem('spriteY', 250);  // Optionally save the sprite's current position
            this.scene.start('Caverntower1');
        }
        
        
    }
}