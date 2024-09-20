function handleItemInteraction(pointer, gameObject, zone, scene, inventory) {
    if (Phaser.Geom.Rectangle.Contains(zone.rectangle, pointer.x, pointer.y)) {
        switch (gameObject.texture.key) {
            case 'wineskin':
                handleWineskinInteraction(scene, inventory, zone);
                break;
            default:
                showMessage("Error: You can't drop the item here!", scene);
                returnItemToInventory(gameObject);
                break;
        }
    } else {
        showMessage("Error: You can't drop the item here!", scene);
        returnItemToInventory(gameObject);
    }
}

function handleWineskinInteraction(scene, inventory) {
    showMessage("You fill up the wineskin with the slightly bitter-smelling waters.", scene);

    // Remove the wineskin from the inventory
   
    
        // Add the wineskinwater in place of the original wineskin
        inventory.addItem({ name: 'wineskinwater', img: 'wineskin', x:300, y:600 });
        console.log('Wineskin water added to inventory:', inventory.items);
    
    }




function handleNewItemInteraction(scene, inventory, zone) {
    showMessage("The new item is used successfully!", scene);

    // Specific behavior for the new item
    scene.add.image(zone.circle.x, zone.circle.y, 'uniqueGraphic').setScale(0.5);

    // Remove the new item from the inventory
    inventory.removeItem({ name: 'newItem', img: 'newItem' });
    console.log('New item removed from inventory:', inventory.items);
}

function returnItemToInventory(gameObject) {
    gameObject.x = gameObject.originalX;
    gameObject.y = gameObject.originalY;
}

/*
this.input.on('dragend', (pointer, gameObject) => {
    gameObject.setScale(0.15); // Restore the original scale
    console.log('Dragged item texture key:', gameObject.texture.key);
    
    // Depending on the dragged item, pass the correct zone
    if (gameObject.texture.key === 'amulet') {
        handleItemInteraction(pointer, gameObject, { circle: pigCircle }, this, inventory);
    } else if (gameObject.texture.key === 'newItem') {
        handleItemInteraction(pointer, gameObject, { circle: newItemZone }, this, inventory);
    }
});
*/