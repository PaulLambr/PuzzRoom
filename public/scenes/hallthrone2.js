class HallThrone2 extends Phaser.Scene {
    constructor() {
        super({ key: 'HallThrone2' });
    }

    preload() {
        // Preload assets
        this.load.image('background_ht2', 'graphics/hallway_throne_open.png');
        this.load.spritesheet('character', 'graphics/grahamprincesspng.png', { frameWidth: 28.5, frameHeight: 70 });
        this.load.spritesheet('goblin', 'graphics/goblin.png', { frameWidth: 28.5, frameHeight: 70 }); // Preload goblin spritesheet
        this.load.image('parchment_bg', 'graphics/parchment_bg.png'); // Preload message background
    }

    create() {
        console.log('Creating HallThrone2 scene');

        // Initialize variables
        this.goblinTriggered = false;
        this.princessCanMove = true;
        this.messageShown = false;

        // Set the background
        const background = this.add.image(750, 450, 'background_ht2');
        background.setDepth(0);

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
        checkIntroMessage(this, "HallThrone2", "So close to your father. The entrance to the throne room is open.", this);

        // Hashmark debugging graphics
        hashmarkGraphics = this.add.graphics();
        this.input.keyboard.on('keydown-H', toggleHashmarks.bind(this, this));

        // Set current scene
        localStorage.setItem('currentScene', 'HallThrone2');

        // Prevent multiple transitions
        this.hasTransitioned = false;

        // Load sprite position from localStorage or set default
        const savedX = localStorage.getItem('spriteX');
        const savedY = localStorage.getItem('spriteY');
        const startX = savedX ? parseFloat(savedX) : 100;
        const startY = savedY ? parseFloat(savedY) : 850;

        // Create the main sprite for the player character
        this.sprite = this.physics.add.sprite(startX, startY, 'character');
        this.sprite.setScale(3);
        this.sprite.setDepth(1);
        this.sprite.body.collideWorldBounds = true;

        // Create goblin sprite (invisible initially)
        this.goblin = this.physics.add.sprite(50, 600, 'goblin').setScale(3).setVisible(false);

        // Remove 'walk' animation if it exists
        if (this.anims.exists('walk')) {
            this.anims.remove('walk');
        }

        // Recreate 'walk' animation for the character
        this.anims.create({
            key: 'walk',
            frames: this.anims.generateFrameNumbers('character', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });

        // Recreate 'goblinWalk2' animation for the goblin
        this.anims.create({
            key: 'goblinWalk2',
            frames: this.anims.generateFrameNumbers('goblin', { start: 0, end: 5 }),
            frameRate: 10,
            repeat: -1
        });

        // Check localStorage for 'moatblown'
        const moatblown = localStorage.getItem('moatblown') === 'True';

        // If moatblown is not true, trigger the goblin animation
        if (!moatblown) {
            this.triggerGoblin();
        }
    }

    triggerGoblin() {
        if (this.goblinTriggered) return;

        this.goblinTriggered = true;
        this.princessCanMove = false;

        // Goblin becomes visible and starts walking
        this.goblin.setVisible(true).anims.play('goblinWalk2', true);
        this.physics.moveTo(this.goblin, this.sprite.x, this.sprite.y, 100);

        // Check goblin's distance to the player and show message when close enough
        this.time.addEvent({
            delay: 10,
            loop: true,
            callback: () => {
                const distance = Phaser.Math.Distance.Between(this.goblin.x, this.goblin.y, this.sprite.x, this.sprite.y);
                if (distance < 10 && !this.messageShown) {
                    this.goblin.setVelocity(0).anims.stop();
                    showMessage("You're too late. We made it through the tunnel. GAME OVER!", this);
                    this.messageShown = true;

                    // After the message, fade to cavern
                    this.time.delayedCall(5000, () => {
                        this.fadeToCavern();
                    });
                }
            },
            callbackScope: this
        });
    }

    fadeToCavern() {
        this.cameras.main.fadeOut(2000, 0, 0, 0);
        this.cameras.main.on('camerafadeoutcomplete', () => {
            inventory.saveInventoryState(); // Save inventory before navigating away
            this.scene.start('Cavern1');
        });
    }

    update() {
        // If the princess cannot move, stop all movement
        if (!this.princessCanMove) {
            this.sprite.setVelocity(0);
            this.sprite.anims.stop();
            return;
        }

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

        // Transition to the next scene (Bridge) if the sprite moves beyond 50 pixels on the left
        if (this.sprite.x < 50 && !this.hasTransitioned) {
            this.sprite.x=50;
            showMessage("Your father is straight ahead. Go say Hi!", this);
        }

        if (this.sprite.y < 500 && this.sprite.x > 550 && this.sprite.x < 950 && !this.hasTransitioned) {
            this.hasTransitioned = true;
            this.scene.start('EndSequence');
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
