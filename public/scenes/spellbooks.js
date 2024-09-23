class Spellbooks extends Phaser.Scene {
    constructor() {
        super({ key: 'Spellbooks' });
    }

    preload() {
        // Preload assets
        this.load.image('background_sp', 'graphics/spellbooks.png');
        this.load.image('bookpages1', 'graphics/bookpages1.png');
        this.load.image('bookpages2', 'graphics/bookpages2.png');
        this.load.image('bookpages3', 'graphics/bookpages3.png');
        this.load.image('bookpages4', 'graphics/bookpages4.png');

        // Fetch and load inventory items from inventory-library.json
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
        console.log('Creating Spellbooks scene');

         // Set the background
         const background = this.add.image(750, 450, 'background_sp');
         background.setDepth(0);

       // Initialize the inventory
       createInventory(this);

       // Reset message panel if it exists
       if (messagePanel) {
           messagePanel.destroy();
           messagePanel = null;
       }

       // Show intro message when entering Castle Prairie
       checkIntroMessage(this, "Spellbooks", "You leaf through the ponderous musty tomes. Only two have not been magically sealed.", this);

        // Hashmark debugging graphics
        hashmarkGraphics = this.add.graphics();
        this.input.keyboard.on('keydown-H', toggleHashmarks.bind(this, this));

       // Prevent multiple transitions
       this.hasTransitioned = false;

        // Initial state: bookpages1 on the left, bookpages3 on the right
        this.book1State = 'bookpages1'; // Track the state of the left book
        this.book2State = 'bookpages3'; // Track the state of the right book

        this.book1 = this.add.image(391, 410, 'bookpages1');
        this.book1.setDepth(1);

        this.book2 = this.add.image(1120, 416, 'bookpages3');
        this.book2.setDepth(1);

        // Draw dividing lines for both books
        const graphics = this.add.graphics();
        graphics.lineStyle(2, 0xffffff, 1);

        // Center vertical line for book1
        graphics.beginPath();
        graphics.moveTo(this.book1.x, this.book1.y - this.book1.height / 2);
        graphics.lineTo(this.book1.x, this.book1.y + this.book1.height / 2);
        graphics.strokePath();

        // Center vertical line for book2
        graphics.beginPath();
        graphics.moveTo(this.book2.x, this.book2.y - this.book2.height / 2);
        graphics.lineTo(this.book2.x, this.book2.y + this.book2.height / 2);
        graphics.strokePath();

        // Interactive zones for book1 (left and right halves)
        const book1LeftZone = this.add.zone(this.book1.x - this.book1.width / 4, this.book1.y, this.book1.width / 2, this.book1.height);
        const book1RightZone = this.add.zone(this.book1.x + this.book1.width / 4, this.book1.y, this.book1.width / 2, this.book1.height);

        // Interactive zones for book2 (left and right halves)
        const book2LeftZone = this.add.zone(this.book2.x - this.book2.width / 4, this.book2.y, this.book2.width / 2, this.book2.height);
        const book2RightZone = this.add.zone(this.book2.x + this.book2.width / 4, this.book2.y, this.book2.width / 2, this.book2.height);

        // Set the zones as interactive
        book1LeftZone.setInteractive();
        book1RightZone.setInteractive();
        book2LeftZone.setInteractive();
        book2RightZone.setInteractive();

        // Left side of book 1: Revert to bookpages1 if currently displaying bookpages2
        book1LeftZone.on('pointerdown', () => {
            if (this.book1State === 'bookpages2') {
                console.log('Reverting book 1 to bookpages1');
                this.book1.setTexture('bookpages1');
                this.book1State = 'bookpages1';
            } else {
                console.log('Book 1 Left Zone clicked: No action.');
            }
        });

        // Right side of book 1: Change to bookpages2
        book1RightZone.on('pointerdown', () => {
            if (this.book1State === 'bookpages1') {
                console.log('Changing book 1 to bookpages2');
                this.book1.setTexture('bookpages2');
                this.book1State = 'bookpages2';
            }
        });

        // Left side of book 2: Revert to bookpages3 if currently displaying bookpages4
        book2LeftZone.on('pointerdown', () => {
            if (this.book2State === 'bookpages4') {
                console.log('Reverting book 2 to bookpages3');
                this.book2.setTexture('bookpages3');
                this.book2State = 'bookpages3';
            } else {
                console.log('Book 2 Left Zone clicked: No action.');
            }
        });

        // Right side of book 2: Change to bookpages4
        book2RightZone.on('pointerdown', () => {
            if (this.book2State === 'bookpages3') {
                console.log('Changing book 2 to bookpages4');
                this.book2.setTexture('bookpages4');
                this.book2State = 'bookpages4';
            }
        });

       
            const exitButton = this.add.text(1450, 850, 'Exit', {
                fontSize: '32px',
                fill: '#ffffff',
                backgroundColor: '#000000'
            }).setInteractive();
        
            // Handle clicking the Exit button to go back to the most recent HutInterior scene
exitButton.on('pointerdown', () => {
    // Get the most recent HutInterior scene from localStorage
    const lastScene = localStorage.getItem('lastVisitedHutInteriorScene');

    if (lastScene) {
        console.log(`Exiting to ${lastScene}`);
        this.scene.start(lastScene);  // Start the last visited HutInterior scene
    } else {
        console.log('Exiting to HutInterior (default)');
        this.scene.start('HutInterior');  // Default to the base HutInterior if no record is found
    }
});

        
            // Set current scene in localStorage
            localStorage.setItem('currentScene', 'Spellbooks');
        
        
    }
}
