class EndSequence extends Phaser.Scene {
    constructor() {
        super({ key: 'EndSequence' });
    }

    preload() {
        // Preload dummy background images for the slideshow
        this.load.image('background1', 'graphics/graham.webp');
        this.load.image('background2', 'graphics/graham1.webp');
        this.load.image('background3', 'graphics/graham2.webp');
    }

    create() {
        console.log('Creating EndSequence scene');
        if (messagePanel) {
            messagePanel.destroy();
            messagePanel = null;
        }
        // Check and display the intro message
        checkIntroMessage(this, "EndSequence", "You are lovingly reunited with your brave father King Graham. You think to yourself, he had whole cowboy picnics bringing his adventures to life, while I just had one dude.");

        // Initialize the backgrounds array for the slideshow
        this.backgrounds = [
            this.add.image(900, 450, 'background1'),
            this.add.image(900, 450, 'background2'),
            this.add.image(900, 450, 'background3')
        ];

        // Hide all backgrounds except the first one
        this.backgrounds.forEach((bg, index) => {
            if (index !== 0) bg.setVisible(false);
        });

        // Current background index
        this.currentBackgroundIndex = 0;

        // Time between background changes (e.g., 3 seconds)
        this.slideDuration = 3000;

        // Timer to track slideshow progress
        this.nextSlideTime = this.time.now + this.slideDuration;

        // Prevent multiple transitions
        this.hasTransitioned = false;
    }

    update(time) {
        // Check if it's time to show the next slide
        if (time > this.nextSlideTime) {
            // Hide the current background
            this.backgrounds[this.currentBackgroundIndex].setVisible(false);

            // Move to the next background
            this.currentBackgroundIndex = (this.currentBackgroundIndex + 1) % this.backgrounds.length;

            // Show the next background
            this.backgrounds[this.currentBackgroundIndex].setVisible(true);

            // Set the next slide change time
            this.nextSlideTime = time + this.slideDuration;
        }
    }
}
