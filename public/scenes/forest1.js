class Forest1 extends Phaser.Scene {
    constructor() {
        super({ key: 'Forest1' });
    }

    preload() {
        // Preload assets
        this.load.image('background_f1', 'graphics/forest.jpg');
        this.load.spritesheet('character', 'graphics/grahamprincesspng.png', { frameWidth: 28.5, frameHeight: 70 });
        this.load.image('rope', 'graphics/rope.png'); // Preload rope
        this.load.spritesheet('goblin', 'graphics/goblin.png', { frameWidth: 28.5, frameHeight: 70 }); // Preload goblin spritesheet
        this.load.image('ropeframe', 'graphics/ropeframe.png'); // Preload ropeframe image
        this.load.image('parchment_bg', 'graphics/parchment_bg.png'); // Preload message background
    }


create() {
   console.log('Creating Forest1 scene');

       // Initialize variables
       this.goblinTriggered = false;
       this.princessCanMove = true;
       this.messageShown = false;
   
       // Set the background
       const background = this.add.image(750, 450, 'background_f1');
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
   checkIntroMessage(this, "Forest1", "This cozy forest road seems a little too good to be true.", this);

    // Hashmark debugging graphics
    hashmarkGraphics = this.add.graphics();
    this.input.keyboard.on('keydown-H', toggleHashmarks.bind(this, this));

   // Set current scene
   localStorage.setItem('currentScene', 'Forest1');

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

    // Recreate 'walk' animation
    this.anims.create({
        key: 'walk',
        frames: this.anims.generateFrameNumbers('character', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    });
   
    // Remove 'walk' animation if it exists
   if (this.anims.exists('goblinwalk2')) {
    this.anims.remove('goblinwalk2');
}
       this.anims.create({
           key: 'goblinWalk2',
           frames: this.anims.generateFrameNumbers('goblin', { start: 0, end: 5 }),
           frameRate: 10,
           repeat: -1
       });
   
       // Input cursor keys for controlling the character
       this.cursors = this.input.keyboard.createCursorKeys();
   
       // Create an interactive zone for triggering goblin
       const interactiveZone = this.add.zone(700, 650, 1, 600).setRectangleDropZone(1, 600);
       this.physics.add.existing(interactiveZone, true);
   
       // Create the rope image
       this.ropeImage = this.add.image(750, 560, 'rope').setScale(1.5);
   
       // Trigger goblin when the sprite overlaps the interactive zone
       this.physics.add.overlap(this.sprite, interactiveZone, this.triggerGoblin, null, this);
   
       // Initialize the inventory
       createInventory(this);
   
       // Set current scene
       localStorage.setItem('currentScene', 'Forest1');
   }
   
   triggerGoblin() {
       if (this.goblinTriggered) return;
   
       this.goblinTriggered = true;
       this.princessCanMove = false;
       this.sprite.setTexture('ropeframe'); // Change sprite texture to rope frame
       this.ropeImage.setVisible(false); // Hide rope image
   
       const graphics = this.add.graphics({ lineStyle: { width: 4, color: 0xffff00 } });
       graphics.lineBetween(this.sprite.x + this.sprite.width / 2, this.sprite.y + this.sprite.height / 2, 750, 450);
   
       // After 4 seconds, goblin appears and starts walking
       this.time.delayedCall(4000, () => {
           this.goblin.setVisible(true).anims.play('goblinWalk2', true);
           this.physics.moveTo(this.goblin, 500, 600, 100);
       });
   
       // Check goblin's distance to target and show message when close enough
       this.time.addEvent({
           delay: 10,
           loop: true,
           callback: () => {
               const distance = Phaser.Math.Distance.Between(this.goblin.x, this.goblin.y, 500, 600);
               if (distance < 10 && !this.messageShown) {
                   this.goblin.setVelocity(0).anims.stop();
                   showMessage("My name is Grok, the Goblin King, and you have officially been captured.", this);
                   this.messageShown = true;
   
                   // After message, fade to cavern
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
    // If the princess cannot move (rope frame triggered), stop all movement
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
        localStorage.setItem('spriteX', 1350);
        localStorage.setItem('spriteY', 520);
        this.hasTransitioned = true;
        this.scene.start('Bridge');
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

/*

        let sprite, goblin, ropeImage;
        let cursors;
        let goblinTriggered = false;
        let princessCanMove = true;
        let messageShown = false;

       

            sprite = this.physics.add.sprite(10, 600, 'character').setScale(3);
            goblin = this.physics.add.sprite(50, 600, 'goblin').setScale(3).setVisible(false);

            this.anims.create({
                key: 'walk',
                frames: this.anims.generateFrameNumbers('character', { start: 0, end: 5 }),
                frameRate: 10,
                repeat: -1
            });

            this.anims.create({
                key: 'goblinWalk',
                frames: this.anims.generateFrameNumbers('goblin', { start: 0, end: 5 }),
                frameRate: 10,
                repeat: -1
            });


            const interactiveZone = this.add.zone(700, 650, 1, 600).setRectangleDropZone(1, 600);
            this.physics.add.existing(interactiveZone, true);

            ropeImage = this.add.image(750, 560, 'rope').setScale(1.5);

            this.physics.add.overlap(sprite, interactiveZone, triggerGoblin, null, this);

          

        function triggerGoblin() {
            if (goblinTriggered) return;

            goblinTriggered = true;
            princessCanMove = false;
            sprite.setTexture('ropeframe');
            ropeImage.setVisible(false);

            const graphics = this.add.graphics({ lineStyle: { width: 4, color: 0xffff00 } });
            graphics.lineBetween(sprite.x + sprite.width / 2, sprite.y + sprite.height / 2, 750, 450);

            this.time.delayedCall(4000, () => {
                goblin.setVisible(true).anims.play('goblinWalk', true);
                this.physics.moveTo(goblin, 500, 600, 100);
            });

            this.time.addEvent({
                delay: 10,
                loop: true,
                callback: () => {
                    const distance = Phaser.Math.Distance.Between(goblin.x, goblin.y, 500, 600);
                    if (distance < 10 && !messageShown) {
                        goblin.setVelocity(0).anims.stop();
                        showMessage("My name is Grok, the Goblin King, and you have officially been captured.", this);
                        messageShown = true;

                        this.time.delayedCall(5000, () => {
                            fadeToCavern.call(this);
                        });
                    }
                },
                callbackScope: this
            });
        }

        function fadeToCavern() {
            this.cameras.main.fadeOut(2000, 0, 0, 0);
            this.cameras.main.on('camerafadeoutcomplete', () => {
                inventory.saveInventoryState(); // Save inventory before navigating away
                window.location.href = "cavern3.html";
            });
        }

        function update() {
            if (!princessCanMove) {
                sprite.setVelocity(0, 0).anims.stop();
                return;
            }

            let moving = false;
            if (cursors.left.isDown) {
                sprite.setVelocityX(-200).setFlipX(true);
                moving = true;
            } else if (cursors.right.isDown) {
                sprite.setVelocityX(200).setFlipX(false);
                moving = true;
            } else {
                sprite.setVelocityX(0);
            }

            if (cursors.up.isDown && sprite.y > 400) {
                sprite.setVelocityY(-200);
                moving = true;
            } else if (cursors.down.isDown && sprite.y < 700) {
                sprite.setVelocityY(200);
                moving = true;
            } else {
                sprite.setVelocityY(0);
            }

            if (moving) {
                sprite.anims.play('walk', true);
            } else {
                sprite.setVelocity(0, 0).anims.stop().setFrame(1);
            }
        }

       
*/