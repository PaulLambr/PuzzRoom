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
let circularZone;
let poolRectangle;
let pigCircle;
let cauldronCircle;


const inventoryPanel = { x: 1500, y: 0, width: 300, height: 900 };
const configBridge = {
    width: 1800,   // Define the width as per your game size
    height: 1300   // Define the height as per your game size
};

// Define the CastleBedroom scene
class CastleBedroom extends Phaser.Scene {
    constructor() {
        super({ key: 'CastleBedroom' });
        this.reflection = null; // Make sure reflection is initialized
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
        // Use animationManager to create animations globally
animationManager.createAnimations(this);

        this.add.image(750, 450, 'background');

        const savedX = localStorage.getItem('spriteX');
        const savedY = localStorage.getItem('spriteY');
        const startX = savedX ? parseFloat(savedX) : 100;
        const startY = savedY ? parseFloat(savedY) : 525;



        this.sprite = this.physics.add.sprite(startX, startY, 'character');
        this.sprite.setScale(3);
        this.sprite.setDepth(2)


    // Play the walking animation
    this.sprite.anims.play('walk', true);

        cursors = this.input.keyboard.createCursorKeys();

        // Interactive zone for King Graham message
        rectangleZone2 = this.add.zone(1190, 150, 150, 200).setRectangleDropZone(150, 200);
        rectangleZone2.setInteractive();
        rectangleZone2.on('pointerdown', () => {
            showMessage("This is your dad, King Graham. Sadly he disappeared last summer hunting goblins in the Fearful Forest near the Mystic Mountains. Many brave knights went in search of him with no luck thus far.", this);
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
                    brownBoxGraphics.setDepth(1)

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
        checkIntroMessage(this, "CastleBedroom", "Ah what a bright shining morning it is in the Kingdom of Kenmoria. You have just awoken, but instead of the pleasant trills of songbirds greeting your ears, it seems like a din of clashing metal and harsh grunting sounds waft through the tower of the castle where you reside.");

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

        if (this.sprite.y < 325) {
            this.sprite.y = 325;

        }

        if (this.sprite.x < 125) {
            this.sprite.x = 125;

        }

        if (moving) {
            this.sprite.anims.play('walk', true);
        } else {
            this.sprite.setVelocity(0, 0);
            this.sprite.anims.stop();
            this.sprite.setFrame(1);
        }

         // Check if the sprite is within the circle to display the reflection
const spriteX = this.sprite.x;
const spriteY = this.sprite.y;
const distanceToMirror = Phaser.Math.Distance.Between(spriteX, spriteY, 760, 400);

if (distanceToMirror <= 100) {
    // Show the reflection if within range
    this.showReflection(spriteX, spriteY);
} else {
    // Hide or destroy the reflection if outside the range
    if (this.reflection) {
        this.reflection.setVisible(false);  // Hide the reflection
    }
}
}
// Function to create a mirror reflection
// Function to create a mirror reflection
showReflection(spriteX, spriteY) {
    if (!this.reflection || !this.reflection.active) {
        // Create the reflection sprite only if it doesn't exist or was destroyed
        this.reflection = this.add.sprite(768, 190, 'character')
            .setFlipY(false)
            .setFlipX(this.sprite.flipX) // Mirror the sprite's horizontal flip (direction)
            .setScale(1.7)
            .setAlpha(0.5)
            .setDepth(0); // Ensure it appears behind other objects
    }


    // Make the reflection visible again if it was hidden
    this.reflection.setVisible(true);

    // Set the reflection's flipX to match the player's flipX
    this.reflection.setFlipX(this.sprite.flipX);

    // Get the current frame index of the sprite's walk animation
    const currentFrame = this.sprite.anims.currentFrame.index;
    const maxFrameIndex = this.anims.get('walk').frames.length - 1;
    const validFrame = Math.min(currentFrame, maxFrameIndex);

    // Set the reflection frame to match the current walking frame
    this.reflection.setFrame(validFrame);
}}