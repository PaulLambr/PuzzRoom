// Phaser is now available globally via the CDN, so no import is needed

// Define global game configuration
const config: Phaser.Types.Core.GameConfig = {
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
    scene: [],  // Scene list to be added dynamically
};

// Initialize the Phaser Game
window.game = new window.Phaser.Game(config);

// Global game variables
export let sprite: Phaser.Physics.Arcade.Sprite;
export let cursors: Phaser.Types.Input.Keyboard.CursorKeys;
export let inventory: any = {}; // Initialize as empty, will load dynamically

// Inventory system functions
export const loadInventory = () => {
    fetch('inventory-library.json')
        .then(response => response.json())
        .then(data => {
            data.items.forEach((item: { name: string; img: string }) => {
                gameInstance.load.image(item.name, item.img);
            });
        })
        .catch(error => console.error('Error loading inventory library:', error));
};

export const saveInventoryState = () => {
    // Save inventory to localStorage or some persistent mechanism
};

export const loadInventoryState = () => {
    // Load inventory state from localStorage
    inventory.loadInventoryState();
};

window.addEventListener('load', () => {
    if (window.game && inventory) {
        loadInventoryState();
    } else {
        console.error("Game instance or inventory not initialized.");
    }
});
