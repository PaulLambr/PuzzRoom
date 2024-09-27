/*
class Cavernbedroom extends Phaser.Scene {
    constructor() {
        super({ key: 'Cavernbedroom' });
    }

    preload() {
        // Preload assets
        this.load.image('background_cbr', 'graphics/cavernbedroom.png');
        this.load.spritesheet('character', 'graphics/grahamprincesspng.png', { frameWidth: 28.5, frameHeight: 70 });
        this.load.spritesheet('goblingirl', 'graphics/goblingirl.png', { frameWidth: 28.5, frameHeight: 70 });
        this.load.image('grak', 'graphics/grak.png'); // Grak guard sprite
        this.load.image('door', 'graphics/door.png'); // Door for interactive zone
        this.load.image('amulet', 'graphics/graks_amulet.png'); // Amulet image
    }

    create() {
        console.log('Creating Cavernbedroom scene');
    
        // Set the background
        const background = this.add.image(750, 450, 'background_cbr');
        background.setDepth(0);
    
        // Initialize the inventory
        createInventory(this);
    
        // Reset message panel if it exists
        if (messagePanel) {
            messagePanel.destroy();
            messagePanel = null;
        }
    
        // Show intro message when entering Cavernhall
        checkIntroMessage(this, "Cavernbedroom", "This must be the Goblin King's personal quarters. A mirror sits upon the antique wood writing desk.", this);

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
    
        // Check if the sprite is within the circle to display the reflection
        const spriteX = this.sprite.x;
        const spriteY = this.sprite.y;
        const distanceToMirror = Phaser.Math.Distance.Between(spriteX, spriteY, 725, 400);
    
        if (distanceToMirror <= 100) {
            // Create the reflection
            this.showReflection(spriteX, spriteY);
        } else {
            // If the sprite moves out of the circle, remove the reflection
            if (this.reflection) {
                this.reflection.destroy();
                this.reflection = null;
            }
        }
    
        // Scene transition logic (example)
        if (this.sprite.x < 150) {
            console.log('Transitioning to Cavernhall2 scene');
            localStorage.setItem('spriteX', 1300);  // Save the sprite's position for the next scene
            localStorage.setItem('spriteY', 250);
            this.scene.start('Caverntower2');
        }
    }
    
    // Function to create a mirror reflection
showReflection(spriteX, spriteY) {
    if (!this.reflection) {
        // Create the reflection sprite at (725, 200)
        this.reflection = this.add.sprite(725, 190, this.isGoblinForm ? 'goblingirl' : 'character')
            .setFlipY(false)     // Keep it right-side up
            .setFlipX(false)      // Flip horizontally like a mirror reflection
            .setScale(1.9)       // Slightly smaller reflection
            .setAlpha(0.5);      // Semi-transparent for reflection effect

        this.reflection.setDepth(0); // Ensure it appears behind other objects
    }

    // Get the current frame index (ensure it doesn't exceed the frame count)
    const currentFrame = this.sprite.anims.currentFrame.index;
    const maxFrameIndex = this.anims.get(this.isGoblinForm ? 'goblinWalk4' : 'walk').frames.length - 1;
    const validFrame = Math.min(currentFrame, maxFrameIndex); // Ensure the frame index is valid

    // Set the reflection frame
    this.reflection.setFrame(validFrame);


    
        // Play the correct animation for the reflection
        if (this.isGoblinForm) {
            this.reflection.anims.play('goblinWalk4', true);
        } else {
            this.reflection.anims.play('walk', true);
        }
    }
    
}

*/