let sprite;
let cursors;
let rectangleZone2;
let rectangleZone;
let mirrorAddedToInventory = false;
let hashmarkGraphics;
let hashmarkText = [];
let hashmarksVisible = false;
let hasTransitioned = false;  // Initialize hasTransitioned

const inventoryPanel = { x: 1500, y: 0, width: 300, height: 900 };

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

        sprite = this.physics.add.sprite(startX, startY, 'character');
        sprite.setScale(3);

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
                inventory.addItem({ name: 'mirror', img: 'mirror' });
                showMessage("You pick up your handy-dandy hand mirror.", this);

                const brownBoxGraphics = this.add.graphics();
                brownBoxGraphics.fillStyle(0x7f2100, 1);
                brownBoxGraphics.fillRect(750, 290, 100, 45);
                rectangleZone.destroy();
                mirrorAddedToInventory = true;
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
        this.input.keyboard.on('keydown-H', toggleHashmarks, this);

        // Check and display the intro message
        checkIntroMessage(this, "castleBedroom", "Ah what a bright shining morning it is in the Kingdom of Kenmoria. You have just awoken...");

        hasTransitioned = false;  // Initialize it here as well for safety

        localStorage.setItem('currentScene', '/castlebedroom');
    }
    
    update() {
        let moving = false;

        if (cursors.left.isDown) {
            sprite.setVelocityX(-200);
            sprite.setFlipX(true);
            moving = true;
        } else if (cursors.right.isDown) {
            sprite.setVelocityX(200);
            sprite.setFlipX(false);
            moving = true;
        } else {
            sprite.setVelocityX(0);
        }

        if (cursors.up.isDown) {
            sprite.setVelocityY(-200);
            moving = true;
        } else if (cursors.down.isDown) {
            sprite.setVelocityY(200);
            moving = true;
        } else {
            sprite.setVelocityY(0);
        }

        if (sprite.x > 1500 && !hasTransitioned) {
            localStorage.setItem('spriteX', sprite.x - 1480);
            localStorage.setItem('spriteY', sprite.y);
            hasTransitioned = true;

            // Transition to Tower scene
            this.scene.start('Tower');
        }

        if (moving) {
            sprite.anims.play('walk', true);
        } else {
            sprite.setVelocity(0, 0);
            sprite.anims.stop();
            sprite.setFrame(1);
        }
    }
}


