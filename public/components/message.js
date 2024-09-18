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
