import React, { useEffect } from 'react';
import Phaser from 'phaser';
import { CastleBedroomScene } from '../pages/scenes/castlebedroom';  // Correct relative path

export default function GameComponent() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const gameConfig: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        width: 1500,
        height: 900,
        parent: 'phaser-game',
        scene: [CastleBedroomScene],  // First scene to load
      };

      const game = new Phaser.Game(gameConfig);

      return () => {
        game.destroy(true);  // Clean up Phaser instance when component unmounts
      };
    }
  }, []);

  return <div id="phaser-game" style={{ width: '1500px', height: '900px' }}></div>;
}
