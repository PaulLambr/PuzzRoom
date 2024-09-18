let inventoryContainer;  // Declare inventoryContainer here
let gameInstance; // Declare gameInstance here
let messageText;
let messagePanel;
const panelWidth = 1800; // Define panelWidth globally for consistent usage

// Function to create the message panel with a heading
function createMessagePanel(scene) {
    const panelHeight = 400;
    const panelX = configBridge.width / 2;
    const panelY = 900 + panelHeight / 2; // Start at 900 pixels, placing the panel below the bottom

    messagePanel = scene.add.image(panelX, panelY, 'parchment_bg');
    messagePanel.setDisplaySize(panelWidth, panelHeight);
    messagePanel.setOrigin(0.5);

    const headingText = scene.add.text(panelX - panelWidth / 2 + 40, panelY - 135, "YE OLDE CHYRON:", {
        fontFamily: 'Papyrus',
        fontSize: '28px',
        fill: '#000000',
        fontStyle: 'bold',
        align: 'left'
    }).setOrigin(0, 0.5); // Left-align the heading text
}

// Function to display a message in the panel
function showMessage(text, scene) {
    if (!scene) {
        console.error("Scene is not defined when calling showMessage.");
        return;
    }

    if (!messagePanel) {
        createMessagePanel(scene);
    }

    if (messageText) {
        messageText.destroy();
    }

    messageText = scene.add.text(messagePanel.x - panelWidth / 2 + 70, messagePanel.y + 10, text, {
        fontFamily: 'Papyrus',
        fontSize: '28px',
        fill: '#000000',
        fontStyle: 'bold',
        align: 'left',
        wordWrap: { width: panelWidth - 80 }
    }).setOrigin(0, 0.5);
}

// Function to show the intro message (only once per room)
function showIntroMessage(text, scene, roomID) {
    const introKey = `introMessageShown_${roomID}`;
    const defaultMessage = "Back here again? Did you forget something?";

    if (localStorage.getItem(introKey)) {
        showMessage(defaultMessage, scene);
    } else {
        showMessage(text, scene);
        localStorage.setItem(introKey, 'true');
    }
}

// Function to clear the message and show the default one on subsequent visits
function checkIntroMessage(scene, roomID, introText) {
    showIntroMessage(introText, scene, roomID);
}

// Inventory management system with drag-and-drop functionality
const inventory = {
    items: [],

    // Add an item to the inventory
    addItem(item) {
        const defaultMessages = {
            'mirror': "It's your handy-dandy hand mirror.",
            'amulet': "It's the ancient amulet of Grak the Goblin King.",
            'rope': "It's a sturdy rope that could come in handy.",
            'wineskin': "It's empty, and even if it had something in it, you wouldn't drink from it.",
            'keys': "It's the brave guard's ring of keys for various areas of the castle.",
            'torch': "It's hot. Good thing your bag is made of kevlar!"
        };

        if (!this.items.find(i => i.name === item.name)) {
            item.message = defaultMessages[item.name] || "This is an item with no description.";
            this.items.push(item);
            console.log(`Added item to inventory: ${item.name}`);
            this.updateInventoryDisplay();
            this.saveInventoryState();
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

                // Debugging: Log when making item draggable
                console.log(`Making item draggable: ${item.name}`);

                gameInstance.input.setDraggable(itemSprite);
                inventoryContainer.add(itemSprite);

                // Set the position in the inventory panel
                const row = Math.floor(index / itemsPerRow);
                const col = index % itemsPerRow;
                itemSprite.x = col * (itemSize + padding) + itemSize / 2 + padding;
                itemSprite.y = row * (itemSize + padding) + itemSize / 2 + padding + 30;

                // Drag-and-Drop Event Handling with Debugging
                itemSprite.on('dragstart', () => {
                    console.log(`Drag started on: ${item.name}`);
                    gameInstance.children.bringToTop(itemSprite); // Bring to front
                    itemSprite.originalX = itemSprite.x;
                    itemSprite.originalY = itemSprite.y;
                    itemSprite.setScale(0.05); // Scale up slightly when dragging
                });

                itemSprite.on('drag', (pointer, dragX, dragY) => {
                    console.log(`Dragging ${item.name}`);
                    itemSprite.x = dragX;
                    itemSprite.y = dragY;
                });

                itemSprite.on('dragend', (pointer) => {
                    console.log(`Drag ended on: ${item.name}`);
                    itemSprite.setScale(0.15); // Reset size after dragging
                
                    const itemBounds = itemSprite.getBounds();
                    const panelBounds = { x: 1500, y: 0, width: 300, height: 900 };
                    const tolerance = 5;  // Allow small tolerance
                
                    // Log the item and panel bounds for debugging
                    console.log(`Item bounds for ${item.name}:`, itemBounds);
                    console.log(`Panel bounds:`, panelBounds);
                
                    // If dropped outside inventory panel with tolerance, return to original position
                    if (
                        itemBounds.right > panelBounds.x + panelBounds.width ||
                        itemBounds.left < panelBounds.x - tolerance ||  // Adjust the left bound with tolerance
                        itemBounds.bottom > panelBounds.y + panelBounds.height ||
                        itemBounds.top < panelBounds.y
                    ) {
                        showMessage("You can't drop the item here!", gameInstance);
                        console.log(`Item ${item.name} dropped outside of inventory. Returning to original position.`);
                        itemSprite.x = itemSprite.originalX;
                        itemSprite.y = itemSprite.originalY;
                    } else {
                        console.log(`Item ${item.name} dropped inside the inventory.`);
                    }
                });
                
                

                // Add click event to show the item's message
                itemSprite.on('pointerdown', () => {
                    showMessage(item.message, gameInstance);
                    console.log(`Clicked on item: ${item.name}`);
                });
            });
        } else {
            console.error("Inventory container or game instance is missing.");
        }
    },

    // Save the current inventory state to local storage
    saveInventoryState() {
        window.localStorage.setItem('inventoryState', JSON.stringify(this.items));
        console.log("Inventory state saved.");
    },

    // Load the inventory state from local storage
    loadInventoryState() {
        const savedState = window.localStorage.getItem('inventoryState');
        if (savedState) {
            try {
                this.items = JSON.parse(savedState);
                console.log("Loaded inventory state from local storage.");
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
    console.log("Creating inventory for the scene.");

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

// Function to toggle the visibility of hashmarks for debugging purposes
function toggleHashmarks() {
    hashmarksVisible = !hashmarksVisible;
    hashmarkGraphics.clear(); // Clear existing hashmarks

    // Clear any previous hashmark text objects
    if (hashmarkText) {
        hashmarkText.forEach(text => text.destroy());
    }

    if (hashmarksVisible) {
        // Set line style for hashmarks
        hashmarkGraphics.lineStyle(1, 0xffffff, 1);
        hashmarkText = [];

        // Draw vertical hashmarks every 50 pixels
        for (let i = 0; i < configBridge.width; i += 50) {
            hashmarkGraphics.strokeLineShape(new Phaser.Geom.Line(i, 0, i, configBridge.height));
            let text = gameInstance.add.text(i, 10, i, { font: '16px Arial', fill: '#ffffff' });
            hashmarkText.push(text);
        }

        // Draw horizontal hashmarks every 50 pixels
        for (let j = 0; j < configBridge.height; j += 50) {
            hashmarkGraphics.strokeLineShape(new Phaser.Geom.Line(0, j, configBridge.width, j));
            let text = gameInstance.add.text(10, j, j, { font: '16px Arial', fill: '#ffffff' });
            hashmarkText.push(text);
        }
    }
}
