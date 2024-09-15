// game.tsx
import React, { useEffect } from 'react';
import Phaser from 'phaser';
import { CastleBedroomScene } from './scenes/castlebedroom';  // Corrected path

export default function GameComponent() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const gameConfig: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        width: 1800,
        height: 1300,
        scene: [CastleBedroomScene], // Attach the CastleBedroomScene
      };

      const game = new Phaser.Game(gameConfig);

      return () => {
        game.destroy(true); // Clean up the Phaser instance when the component unmounts
      };
    }
  }, []);

  return <div id="phaser-game"></div>; // The div where Phaser will render the game
}
