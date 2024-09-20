let sprite;
let cursors;
let rectangleZone2;
let rectangleZone;
let mirrorAddedToInventory = false;
let hashmarkGraphics;
let hashmarkText = [];
let hashmarksVisible = false;
let hasTransitioned = false;  // Initialize hasTransitioned
let torchAddedToInventory = false;
let boneAddedToInventory = false;
let wineskinAddedToInventory = false;
let cornDropZone;
let pig;
let isCornZoneUnlocked = false;

const inventoryPanel = { x: 1500, y: 0, width: 300, height: 900 };
const configBridge = {
    width: 1800,   // Define the width as per your game size
    height: 1300   // Define the height as per your game size
};

// Define the CastleBedroom scene
class CastleBedroom extends Phaser.Scene {
    constructor() {
        super({ key: 'CastleBedroom' });
    }

    preload() {
        this.load.image('background', 'graphics/bedroom_shadow.png');
        this.load.image('parchment_bg', 'graphics/parchment_bg.png');
        this.load.spritesheet('character', 'graphics/grahamprincesspng.png', { frameWidth: 28.5, frameHeight: 70 });
        this.load.image('amulet', 'graphics/graks_amulet.png');
        this.load.image('rope', 'graphics/rope.png');
        this.load.image('mirror', 'graphics/mirror.png');

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
        gameInstance = this;

        this.add.image(750, 450, 'background');

        const savedX = localStorage.getItem('spriteX');
        const savedY = localStorage.getItem('spriteY');
        const startX = savedX ? parseFloat(savedX) : 100;
        const startY = savedY ? parseFloat(savedY) : 525;

        this.sprite = this.physics.add.sprite(startX, startY, 'character');
        this.sprite.setScale(3);

        this.anims.create({
            key: 'walk',
            frames: this.anims.generateFrameNumbers('character', { start: 0, end: 5 }),
            frameRate: 10,
            repeat: -1
        });

        cursors = this.input.keyboard.createCursorKeys();

        // Interactive zone for King Graham message
        rectangleZone2 = this.add.zone(1190, 150, 150, 200).setRectangleDropZone(150, 200);
        rectangleZone2.setInteractive();
        rectangleZone2.on('pointerdown', () => {
            showMessage("This is your dad, King Graham...", this);
        });

        // Interactive zone for the mirror
        rectangleZone = this.add.zone(800, 310, 100, 60).setRectangleDropZone(100, 60);
        rectangleZone.setInteractive();

        rectangleZone.on('pointerdown', () => {
            if (!mirrorAddedToInventory) {
                // Calculate the distance between the player and the mirror
                const distance = Phaser.Math.Distance.Between(this.sprite.x, this.sprite.y, 800, 310);

                if (distance <= 200) {  // Check if the player is within 200 pixels
                    // Add the mirror to the inventory
                    inventory.addItem({ name: 'mirror', img: 'mirror', x: 800, y: 310 }, this.sprite);

                    showMessage("You pick up your handy-dandy hand mirror.", this);

                    // Draw the brown box on the screen after picking up the mirror
                    const brownBoxGraphics = this.add.graphics();
                    brownBoxGraphics.fillStyle(0x7f2100, 1);
                    brownBoxGraphics.fillRect(750, 290, 100, 45);

                    // Destroy the rectangle zone once the mirror is picked up
                    rectangleZone.destroy();
                    mirrorAddedToInventory = true;
                } else {
                    // Show a message if the player is too far away
                    showMessage("You're too far away from the mirror to pick it up!", this);
                }
            }
        });

        createInventory(this);

        if (inventory.items.find(item => item.name === 'mirror')) {
            const brownBoxGraphics = this.add.graphics();
            brownBoxGraphics.fillStyle(0x7f2100, 1);
            brownBoxGraphics.fillRect(750, 290, 100, 45);
            rectangleZone.destroy();
            mirrorAddedToInventory = true;
        }

        hashmarkGraphics = this.add.graphics();
        this.input.keyboard.on('keydown-H', toggleHashmarks.bind(this, this));

        if (messagePanel) {
            messagePanel.destroy();
            messagePanel = null;
        }
        // Check and display the intro message
        checkIntroMessage(this, "CastleBedroom", "Ah what a bright shining morning it is in the Kingdom of Kenmoria. You have just awoken...");

        this.hasTransitioned = false;  // Initialize it here as well for safety

        localStorage.setItem('currentScene', 'CastleBedroom');
    }

    update() {
        let moving = false;
       

        if (cursors.left.isDown) {
            this.sprite.setVelocityX(-200);
            this.sprite.setFlipX(true);
            moving = true;
        } else if (cursors.right.isDown) {
            this.sprite.setVelocityX(200);
            this.sprite.setFlipX(false);
            moving = true;
        } else {
            this.sprite.setVelocityX(0);
        }

        if (cursors.up.isDown) {
            this.sprite.setVelocityY(-200);
            moving = true;
        } else if (cursors.down.isDown) {
            this.sprite.setVelocityY(200);
            moving = true;
        } else {
            this.sprite.setVelocityY(0);
        }

        if (this.sprite.x > 1500 && !this.hasTransitioned) {
            localStorage.setItem('spriteX', 200);
            localStorage.setItem('spriteY', 200);
            this.hasTransitioned = true;

            // Transition to Tower scene
            this.scene.start('Tower');
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
