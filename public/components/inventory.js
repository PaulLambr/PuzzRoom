let inventoryContainer;  // Declare inventoryContainer here
let gameInstance; // Declare gameInstance here

// Inventory management system with drag-and-drop functionality
const inventory = {
    items: [],

        // Function to add an item to the inventory without proximity check
addItemnp(item) {
    console.log("Item being added (no proximity check):", item);  // Debugging: Check the item object

    const defaultMessages = {
        'mirror': "It's your handy-dandy hand mirror.",
        'amulet': "It's the ancient amulet of Grak the Goblin King.",
        'rope': "It's a sturdy rope that could come in handy.",
        'wineskin': "It's empty, and even if it had something in it, you wouldn't drink from it.",
        'keys': "It's the brave guard's ring of keys for various areas of the castle.",
        'torch': "It's hot. Good thing your bag is made of kevlar!",
        'bone': "Not sure what animal this belonged to. Hopefully not some poor Seattle Mariner.",
        'corn': "This piece of corn definitely has your ear.",
        'wineskinwater': "The Goblin wineskin has been purified by healing mountain springwaters.",
        'magicmirror': "Your handy-dandy mirror went to Wizard School like Hawk from Real Bros.",
        'potentpoppy': "A very rare and not easily attainable soporific plant."
    };

    // Only proceed if the item is not already in the inventory
    if (!this.items.find(i => i.name === item.name)) {
        // Add the item to the inventory
        item.message = defaultMessages[item.name] || "This is an item with no description.";
        this.items.push(item);
        console.log(`Added item to inventory (no proximity check): ${item.name}`);
        this.updateInventoryDisplay();
        this.saveInventoryState();
    } else {
        console.log(`Item already in inventory: ${item.name}`);
    }
}
,
    

    // Add an item to the inventory with a proximity check
    addItem(item, sprite) {
        console.log("Item being added:", item);  // Debugging: Check the item object
        console.log("Sprite position:", sprite.x, sprite.y);  // Debugging: Check the sprite position
    
        const defaultMessages = {
            'mirror': "It's your handy-dandy hand mirror.",
            'amulet': "It's the ancient amulet of Grak the Goblin King.",
            'rope': "It's a sturdy rope that could come in handy.",
            'wineskin': "It's empty, and even if it had something in it, you wouldn't drink from it.",
            'keys': "It's the brave guard's ring of keys for various areas of the castle.",
            'torch': "It's hot. Good thing your bag is made of kevlar!",
            'bone': "Not sure what animal this belonged to. Hopefully not some poor Seattle Mariner.",
            'corn': "This piece of corn definitely has your ear.",
            'wineskinwater': "The Goblin wineskin has been purified by healing mountain springwaters.",
            'potentpoppy': "A very rare and not easily attainable soporific plant."
        };
    
        // Proximity check: Calculate the distance between the player and the item
        const distance = Phaser.Math.Distance.Between(sprite.x, sprite.y, item.x, item.y);
    
        if (distance <= 250) {  // Check if the player is within 100 pixels
            // Only proceed if the item is not already in the inventory
            if (!this.items.find(i => i.name === item.name)) {
                // Add the item to the inventory
                item.message = defaultMessages[item.name] || "This is an item with no description.";
                this.items.push(item);
                console.log(`Added item to inventory: ${item.name}`);
                this.updateInventoryDisplay();
                this.saveInventoryState();
            }
        } else {
            // Show the "too far" message if the player is too far from the item
            showMessage("You're too far away!", gameInstance);
            console.log(`Player is too far from the item: ${item.name}`);
        }
    },

    // Add removeItem method here
    removeItem(item) {
        const itemIndex = this.items.findIndex(i => i.name === item.name);
        if (itemIndex !== -1) {
            this.items.splice(itemIndex, 1);  // Remove the item from the inventory
            console.log(`Removed item from inventory: ${item.name}`);
            this.updateInventoryDisplay();   // Update inventory UI after removing
            this.saveInventoryState();       // Save updated inventory state to localStorage
        } else {
            console.log(`Item not found in inventory: ${item.name}`);
        }
    },

    
    
    // Function to update the inventory display and enable drag-and-drop
    updateInventoryDisplay() {
        if (inventoryContainer && gameInstance) {
            inventoryContainer.removeAll(true); // Clear existing items
            const itemSize = 64;
            const padding = 10;
            const itemsPerRow = 2;

            // Loop through all inventory items and make them draggable
            this.items.forEach((item, index) => {
                let itemSprite = gameInstance.add.sprite(0, 0, item.img).setInteractive();
                itemSprite.setDisplaySize(itemSize, itemSize);

                gameInstance.input.setDraggable(itemSprite);
                inventoryContainer.add(itemSprite);

                // Set the position in the inventory panel
                const row = Math.floor(index / itemsPerRow);
                const col = index % itemsPerRow;
                itemSprite.x = col * (itemSize + padding) + itemSize / 2 + padding;
                itemSprite.y = row * (itemSize + padding) + itemSize / 2 + padding + 30;

                // Drag-and-Drop Event Handling
                itemSprite.on('dragstart', () => {
                    gameInstance.children.bringToTop(itemSprite); // Bring to front
                    itemSprite.originalX = itemSprite.x;
                    itemSprite.originalY = itemSprite.y;
                    itemSprite.setScale(0.05); // Scale up slightly when dragging
                });

                itemSprite.on('drag', (pointer, dragX, dragY) => {
                    itemSprite.x = dragX;
                    itemSprite.y = dragY;
                });

                itemSprite.on('dragend', (pointer) => {
                    itemSprite.setScale(0.15); // Reset size after dragging
                
                    const itemBounds = itemSprite.getBounds();
                    const panelBounds = { x: 1500, y: 0, width: 300, height: 900 };
                    const tolerance = 5;  // Allow small tolerance
                
                    // If dropped outside inventory panel with tolerance, return to original position
                    if (
                        itemBounds.right > panelBounds.x + panelBounds.width ||
                        itemBounds.left < panelBounds.x - tolerance ||  // Adjust the left bound with tolerance
                        itemBounds.bottom > panelBounds.y + panelBounds.height ||
                        itemBounds.top < panelBounds.y
                    ) {
                        showMessage("You can't drop the item here!", gameInstance);
                        itemSprite.x = itemSprite.originalX;
                        itemSprite.y = itemSprite.originalY;
                    }
                });

                // Add click event to show the item's message
                itemSprite.on('pointerdown', () => {
                    showMessage(item.message, gameInstance);
                });
            });
        } else {
            console.error("Inventory container or game instance is missing.");
        }
    },

        
    // Save the current inventory state to local storage
    saveInventoryState() {
        window.localStorage.setItem('inventoryState', JSON.stringify(this.items));
    },

    // Load the inventory state from local storage
    loadInventoryState() {
        const savedState = window.localStorage.getItem('inventoryState');
        if (savedState) {
            try {
                this.items = JSON.parse(savedState);
                this.updateInventoryDisplay();
            } catch (error) {
                console.error("Failed to parse inventory state:", error);
                window.localStorage.removeItem('inventoryState');
                this.items = [];
                this.updateInventoryDisplay();
            }
        }
    },

    // Clear the entire inventory
    clearInventory() {
        this.items = [];
        this.updateInventoryDisplay();
        this.saveInventoryState();
    }
    
};


// Function for creating inventory in the game
function createInventory(scene) {
    gameInstance = scene; // Set the gameInstance to the current scene

    const panelWidth = 300;
    const panelHeight = 900;
    const panelX = 1500;
    const panelY = 0;

    const inventoryPanelBg = scene.add.image(panelX + panelWidth / 2, panelY + panelHeight / 2, 'parchment_bg');
    inventoryPanelBg.setDisplaySize(panelWidth, panelHeight);

    const inventoryTitle = scene.add.text(panelX + panelWidth / 2 + 95, panelY + 10, 'INVENTORY BAG:', {
        fontFamily: 'Papyrus',
        fontSize: '28px',
        fontStyle: 'bold',
        color: '#000000',
    });
    inventoryTitle.setOrigin(1, 0);

    inventoryContainer = scene.add.container(panelX, panelY + 50);

    // Load inventory state from local storage
    inventory.loadInventoryState();
}
