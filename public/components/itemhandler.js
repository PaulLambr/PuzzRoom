// When corn is successfully dropped and pig crashes through the zone
function handleCornDropSuccess(gameObject) {
    console.log('Corn recognized');
    
    // Pig animation and disappearing logic
    const targetX = 725;  // Center of the drop zone
    this.pig.setFlipX(this.pig.x > targetX);
    
    this.tweens.add({
        targets: this.pig,
        x: targetX,
        y: 575,
        duration: 1000,
        ease: 'Power2',
        onComplete: () => {
            this.pig.destroy();
            const debrisCloud = this.add.image(725, 575, 'debris_cloud').setScale(1.5);
            this.time.delayedCall(500, () => {
                debrisCloud.destroy();
                const graphics = this.add.graphics();
                graphics.fillStyle(0x000000, 1);
                graphics.fillRect(650, 450, 150, 250);
                showMessage("The pig crashes through the wood to reach the corn.", this);

                // Unlock the corn zone
                this.isCornZoneUnlocked = true;
                localStorage.setItem('Can enter hut?', 'True');
            }, [], this);
        },
        callbackScope: this
    });

    // Remove the corn from the inventory
    inventory.removeItem({ name: 'corn', img: 'corn' });
}

function checkPigWearingAmulet(scene) {
    const pigWearingAmulet = localStorage.getItem('Pig Wearing Amulet?') === 'True';
    if (pigWearingAmulet) {
        console.log('Pig is already wearing the amulet.');
        scene.add.image(315, 310, 'amulet').setScale(0.15);
    }
}




/*

function handleItemInteraction(pointer, gameObject, zone, scene, inventory) {
    if (Phaser.Geom.Rectangle.Contains(zone.rectangle, pointer.x, pointer.y)) {
        switch (gameObject.texture.key) {
            case 'wineskin':
                handleWineskinInteraction(scene, inventory, zone);
                break;
            default:
                showMessage("Error: You can't drop the item here!", scene);
                gameObject.x = gameObject.originalX;
       gameObject.y = gameObject.originalY;
                break;
        }
    } else {
        showMessage("Error: You can't drop the item here!", scene);
       // Return the item to its original position within the inventory panel
       gameObject.x = gameObject.originalX;
       gameObject.y = gameObject.originalY;
    }
}

function handleItemInteractionc(pointer, gameObject, zone, scene, inventory) {

if (Phaser.Geom.Circle.Contains(pigCircle, pointer.x, pointer.y)) {

    if (gameObject.texture.key === 'amulet') {
        console.log('The amulet is within the pig zone.');
        showMessage("You slip the amulet around the pig's neck. It pulses intensely.", this);

        // Display rope on OINK zone
        this.add.image(290, 310, 'rope').setScale(0.5);

        // Remove the amulet from the inventory
        inventory.removeItem({ name: 'amulet', img: 'amulet' });
        console.log('Amulet removed from inventory:', inventory.items);
    } else {
        showMessage("Error: The pig doesn't seem interested in this item.", this);
    }
} else {
    showMessage("Error: You can't drop the item here!", this);

    // Return the item to its original position within the inventory panel
    gameObject.x = gameObject.originalX;
    gameObject.y = gameObject.originalY;
}
}); 

    if (Phaser.Geom.Circle.Contains(zone.circle, pointer.x, pointer.y)) {
        switch (gameObject.texture.key) {
                case 'amulet':
                handleAmuletInteraction(scene, inventory, zone);
                break;
                case 'wineskinwater':
                handleWineskinWaterInteraction(scene, inventory, zone);
                break;
            default:
                showMessage("Error: You can't drop the item here!", scene);
                returnItemToInventory(gameObject);
                break;
        }
    } else {
        showMessage("Error: You can't drop the item here!", scene);
        // Return the item to its original position within the inventory panel
        gameObject.x = gameObject.originalX;
        gameObject.y = gameObject.originalY;
    }
}

function handleWineskinInteraction(scene, inventory) {
    showMessage("You fill up the wineskin with the slightly bitter-smelling waters.", scene);

    // Remove the original wineskin from inventory
    inventory.removeItem({ name: 'wineskin', img: 'wineskin' });

    // Add the wineskin filled with water (wineskinwater) in place of the original wineskin
    inventory.addItemnp({ name: 'wineskinwater', img: 'wineskin' }); // Assuming wineskinwater has a different image
    console.log('Wineskin water added to inventory:', inventory.items);
}





function handleAmuletInteraction(scene, inventory, zone) {
  
      
            showMessage("You slip the amulet around the pig's neck. It pulses intensely.", this);

            // Display rope on OINK zone
            this.add.image(290, 310, 'amulet').setScale(0.5);

            // Remove the amulet from the inventory
            inventory.removeItem({ name: 'amulet', img: 'amulet' });
            console.log('Amulet removed from inventory:', inventory.items);
       

    }

    function handleWineskinWaterInteraction(scene, inventory, zone) {
  
      
        showMessage("You fill up the cauldron with the contents of the wineskin. The waters sparkle green and purple.", this);

        // Remove the amulet from the inventory
        inventory.removeItem({ name: 'wineskinwater', img: 'wineskinwater' });
        console.log('Wineskinwater removed from inventory:', inventory.items);

        localStorage.setItem('gamestate', 'Cauldron filled with water');
        this.scene.start('Poke');
   

   
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


from hutinterior.js
this.input.on('dragend', (pointer, gameObject) => {
            gameObject.setScale(0.15); // Restore the original scale
            console.log('Dragged item texture key:', gameObject.texture.key);
        
            // Log the pointer's position
            console.log('Pointer position:', pointer.x, pointer.y);
        
            // Check if the pointer is within the pig's circular zone
            if (Phaser.Geom.Circle.Contains(pigCircle, pointer.x, pointer.y)) {
                if (gameObject.texture.key === 'amulet') {
                    console.log('The amulet is within the pig zone.');
                    showMessage("You slip the amulet around the pig's neck. It pulses intensely.", this);
        
                    // Display rope on OINK zone
                    this.add.image(290, 310, 'rope').setScale(0.5);
        
                    // Remove the amulet from the inventory
                    inventory.removeItem({ name: 'amulet', img: 'amulet' });
                    console.log('Amulet removed from inventory:', inventory.items);
                } else {
                    showMessage("Error: The pig doesn't seem interested in this item.", this);
                }
            } else {
                showMessage("Error: You can't drop the item here!", this);
        
                // Return the item to its original position within the inventory panel
                gameObject.x = gameObject.originalX;
                gameObject.y = gameObject.originalY;
            }
        });
*/
