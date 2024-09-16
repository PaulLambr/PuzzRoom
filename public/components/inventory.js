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

    // Create the message panel background using parchment_bg image
    messagePanel = scene.add.image(panelX, panelY, 'parchment_bg');
    messagePanel.setDisplaySize(panelWidth, panelHeight);
    messagePanel.setOrigin(0.5);

    // Add a permanent heading, left-aligned
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
    console.log(`Displaying message: ${text}`);  // Debugging statement

    if (!scene) {
        console.error("Scene is not defined when calling showMessage.");
        return;
    }

    // Create the message panel if it doesn't exist
    if (!messagePanel) {
        createMessagePanel(scene);
    }

    // Remove any existing text before showing the new message
    if (messageText) {
        messageText.destroy();
    }

    // Add the new message text to the panel, left-aligned
    messageText = scene.add.text(messagePanel.x - panelWidth / 2 + 70, messagePanel.y + 10, text, {
        fontFamily: 'Papyrus',
        fontSize: '28px',
        fill: '#000000',
        fontStyle: 'bold',
        align: 'left',
        wordWrap: { width: panelWidth - 80 } // Adjusting for padding
    }).setOrigin(0, 0.5); // Left-align the message text
}

// Function to show the intro message (only once per room)
function showIntroMessage(text, scene, roomID) {
    // Check if the intro message for this room has already been shown
    const introKey = `introMessageShown_${roomID}`;
    const defaultMessage = "Back here again? Did you forget something?";

    // If the message has already been shown, display the default message
    if (localStorage.getItem(introKey)) {
        showMessage(defaultMessage, scene);
    } else {
        // Show the intro message for the first time
        showMessage(text, scene);
        // Mark the intro message as shown for this roomID
        localStorage.setItem(introKey, 'true');
    }
}

// Function to clear the message and show the default one on subsequent visits
function checkIntroMessage(scene, roomID, introText) {
    showIntroMessage(introText, scene, roomID);
}

// Function to create the message panel with a heading
function createMessagePanel(scene) {
    const panelHeight = 400;
    const panelX = configBridge.width / 2;
    const panelY = 900 + panelHeight / 2; // Position below gameplay area

    // Create the message panel background using the parchment_bg image
    messagePanel = scene.add.image(panelX, panelY, 'parchment_bg');
    messagePanel.setDisplaySize(panelWidth, panelHeight);
    messagePanel.setOrigin(0.5);

    // Add a permanent heading to the message panel
    scene.add.text(panelX - panelWidth / 2 + 40, panelY - 135, "YE OLDE CHYRON:", {
        fontFamily: 'Papyrus',
        fontSize: '28px',
        fill: '#000000',
        fontStyle: 'bold',
        align: 'left'
    }).setOrigin(0, 0.5); // Left-align the heading text
}




// Inventory management system
const inventory = {
    items: [],

    addItem(item) {
        // Define default messages for items
        const defaultMessages = {
            'mirror': "It's your handy-dandy hand mirror.",
            'amulet': "It's the ancient amulet of Grak the Goblin King.",
            'rope': "It's a sturdy rope that could come in handy.",
            'wineskin': "It's empty, and even if it had something in it, you wouldn't drink from it.",
            'keys': "It's the brave guard's ring of keys for various areas of the castle",
            'torch': "It's hot. Good thing your bag is made of kevlar!"
            
        };

        if (!this.items.find(i => i.name === item.name)) {
            item.message = defaultMessages[item.name] || "This is an item with no description."; // Add a default message
            this.items.push(item);
            this.updateInventoryDisplay();
            this.saveInventoryState();
        }
    },

    removeItem(item) {
        const index = this.items.findIndex(i => i.name === item.name);
        if (index !== -1) {
            this.items.splice(index, 1);
            this.updateInventoryDisplay();
            this.saveInventoryState();
        }
    },

    updateInventoryDisplay() {
    if (inventoryContainer && gameInstance) {
        inventoryContainer.removeAll(true);
        const itemSize = 64;
        const padding = 10;
        const itemsPerRow = 2;

        this.items.forEach((item, index) => {
            console.log("Rendering item:", item);

            // Use gameInstance directly to add sprites
            let itemSprite = gameInstance.add.sprite(0, 0, item.img).setInteractive();
            itemSprite.setDisplaySize(itemSize, itemSize);
            gameInstance.input.setDraggable(itemSprite);
            inventoryContainer.add(itemSprite);

            const row = Math.floor(index / itemsPerRow);
            const col = index % itemsPerRow;
            itemSprite.x = col * (itemSize + padding) + itemSize / 2 + padding;
            itemSprite.y = row * (itemSize + padding) + itemSize / 2 + padding + 30;

            // Allow dragging items out of the inventory
            itemSprite.on('dragstart', () => {
                gameInstance.children.bringToTop(itemSprite);
            });

            // Add click event to show the item's message
            itemSprite.on('pointerdown', () => {
                console.log(`Clicked on item: ${item.name}`);
                showMessage(item.message, gameInstance);
            });
        });

        console.log("Inventory rendered with", this.items.length, "items.");
    } else {
        console.error("Inventory container or game instance is missing.");
    }
},


    saveInventoryState() {
        window.localStorage.setItem('inventoryState', JSON.stringify(this.items));
    },

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

    clearInventory() {
        this.items = [];
        this.updateInventoryDisplay();
        this.saveInventoryState();
    }
};


// Function for creating inventory in the game
function createInventory(scene) {
    const panelWidth = 300;
    const panelHeight = 900;
    const panelX = 1500; // Position to the right of the 1500px wide gameplay area
    const panelY = 0;

    // Create the inventory panel background using parchment_bg image
    const inventoryPanelBg = scene.add.image(panelX + panelWidth / 2, panelY + panelHeight / 2, 'parchment_bg');

    // Scale the background to fit the panel size
    inventoryPanelBg.setDisplaySize(panelWidth, panelHeight);

    // Add "Inventory" text at the top of the panel
    const inventoryTitle = scene.add.text(panelX + panelWidth / 2 + 95, panelY + 10, 'INVENTORY BAG:', {
        fontFamily: 'Papyrus',
        fontSize: '28px',
        fontStyle: 'bold',
        color: '#000000',  // Black color
    });
    inventoryTitle.setOrigin(1, 0); // Center the text horizontally

    // Initialize the inventory container for items
    inventoryContainer = scene.add.container(panelX, panelY + 50); // Offset by 50px to account for the title

    // Load inventory state from local storage
    inventory.loadInventoryState();
}

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
