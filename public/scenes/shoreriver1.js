class ShoreRiver1 extends Phaser.Scene {
    constructor() {
        super({ key: 'ShoreRiver1' });
    }

    preload() {
        // Preload assets
        this.load.image('background_sr1', 'graphics/whale.png');
        this.load.image('parchment_bg', 'graphics/parchment_bg.png');
        this.load.spritesheet('character', 'graphics/grahamprincesspng.png', { frameWidth: 28.5, frameHeight: 70 });
        this.load.image('amulet', 'graphics/graks_amulet.png');
        this.load.image('mirror', 'graphics/mirror.png');
        this.load.image('torch', 'graphics/torch.png');
        this.load.image('bone', 'graphics/bone.png');


        // Fetch and load inventory items from inventory-library.json
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
        console.log('Creating ShoreRiver1 scene');

        // Initialize variables
        this.boneAddedToInventory = false;
        this.showHashmarks = false;  // Hashmarks toggle
        this.zoneActivated = false;  // Zone activation flag
        this.hashmarkText = [];  // Initialize empty array for hashmark text objects

        // Set the background
        const background = this.add.image(750, 450, 'background_sr1');
        background.setDepth(0);

        // Load sprite position from localStorage or set default
        const savedX = localStorage.getItem('spriteX');
        const savedY = localStorage.getItem('spriteY');
        const startX = savedX ? parseFloat(savedX) : 100;
        const startY = savedY ? parseFloat(savedY) : 850;  // Character starts behind the rock

        // Create the main sprite for the player character
        this.sprite = this.physics.add.sprite(startX, startY, 'character');
        this.sprite.setScale(3);
        this.sprite.setDepth(1);
        this.sprite.body.collideWorldBounds = true;

       // Before defining the animation, check if it already exists
if (!this.anims.exists('walk')) {
    this.anims.create({
        key: 'walk',
        frames: this.anims.generateFrameNumbers('character', { start: 0, end: 5 }),
        frameRate: 10,
        repeat: -1
    });
}

/*
        // Create interactive zone for the whale
const rectangleZone = this.add.zone(440, 370, 450, 250).setRectangleDropZone(450, 250);
rectangleZone.setInteractive();
rectangleZone.on('pointerdown', () => {
    if (!boneAddedToInventory) {
        // Call addItem to handle proximity check and inventory addition
        inventory.addItem({ name: 'bone', img: 'bone', x: rectangleZone.x, y: rectangleZone.y }, this.sprite);

        // Only proceed with the success logic if the torch is successfully added to the inventory
        if (inventory.items.find(item => item.name === 'bone')) {
            showMessage("Amongst the license parchments of carriages, ocean litter, and rotted blubber, you fish out (yes I know it's a mammal) what's left of this creature's lunch.", this);
            rectangleZone.destroy(); // Remove the torch zone
           boneAddedToInventory = true;
        }
    }
}); */

 // Create interactive zone for the whale
 const rectangleZone = this.add.zone(440, 370, 450, 250).setRectangleDropZone(450, 250);
 rectangleZone.setInteractive();
 rectangleZone.on('pointerdown', () => {
    
         inventory.addItem({ name: 'bone', img: 'bone', x: rectangleZone.x, y: rectangleZone.y }, this.sprite);
 
         if (inventory.items.find(item => item.name === 'bone')) {
            showMessage("Amongst the license parchments of carriages, ocean litter, and rotted blubber, you fish out (yes I know it's a mammal) what's left of this creature's lunch.", this);
            rectangleZone.destroy(); // Remove the torch zone
         }})
     
 

        // Input cursor keys for controlling the character
        this.cursors = this.input.keyboard.createCursorKeys();

        // Initialize the inventory
        createInventory(this);

        // Reset message panel if it exists
        if (messagePanel) {
            messagePanel.destroy();
            messagePanel = null;
        }

        // Show intro message when entering Shore River
        checkIntroMessage(this, "ShoreRiver1", "What a lovely section of beach where the mouth of the river opens. Oh, wait. There's a rotting whale carcass spoiling the view.", this);

        // Hashmark debugging graphics
        hashmarkGraphics = this.add.graphics();
        this.input.keyboard.on('keydown-H', toggleHashmarks.bind(this, this));



        // Set current scene
        localStorage.setItem('currentScene', 'ShoreRiver1');

        // Prevent multiple transitions
        this.hasTransitioned = false;
    }
    
    update() {
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
    
        // Debugging log for position
        console.log(`Sprite Position: X=${this.sprite.x}, Y=${this.sprite.y}`);
    
        // Transition to CastlePrairie if sprite moves beyond 50 pixels on the left
        if (this.sprite.x > 1450 && !this.hasTransitioned) {
            console.log('Transitioning to Cellar scene');
            localStorage.setItem('spriteX', this.sprite.x - 1400);
            localStorage.setItem('spriteY', this.sprite.y);
            this.hasTransitioned = true;
            this.scene.start('Poke');
        }
    
        // Transition to another scene if sprite moves beyond 900 pixels on the Y axis
        if (this.sprite.y < 106 && !this.hasTransitioned) {
            console.log('Transitioning to G3grasslandcorn scene');
            localStorage.setItem('spriteX', this.sprite.x);
            localStorage.setItem('spriteY', this.sprite.y + 700);
            this.hasTransitioned = true;
            this.scene.start('G3grasslandcorn');
        }
    
        if (moving) {
            this.sprite.anims.play('walk', true);
        } else {
            this.sprite.setVelocity(0, 0);
            this.sprite.anims.stop();
            this.sprite.setFrame(1);
        }
    }
}