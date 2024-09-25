// animationManager.js
const animationManager = {
    animations: {},

    preload(scene) {
        // Preload the necessary assets for animations
        scene.load.spritesheet('character', 'graphics/grahamprincesspng.png', { frameWidth: 28.5, frameHeight: 70 });
    },

    createAnimations(scene) {
        // Create the walking animation globally if not already created
        if (!this.animations['walk']) {
            this.animations['walk'] = scene.anims.create({
                key: 'walk',
                frames: scene.anims.generateFrameNumbers('character', { start: 0, end: 5 }),
                frameRate: 10,
                repeat: -1
            });
        }
    }
};
