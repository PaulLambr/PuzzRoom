// Register both CastleBedroom and Tower scenes in this configuration
const configBridge = {
    type: Phaser.CANVAS,
    width: 1800,
    height: 1300,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: [CastleBedroom, Tower] // Register both scenes here
};

// Initialize the Phaser game instance with both scenes
window.game = new Phaser.Game(configBridge);
