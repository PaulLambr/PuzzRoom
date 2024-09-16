import { useState } from 'react';
import Link from 'next/link';

const MenuBar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  // Toggle dropdown menu
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  // Save localStorage to save.json
  const saveGame = () => {
    const gameData = JSON.stringify(localStorage); // Convert localStorage to JSON string
    const blob = new Blob([gameData], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'save.json'; // Name the download file
    link.click();
  };

  // Restore game from save.json
  const restoreGame = (event: Event) => {
    const input = event.target as HTMLInputElement;
    const file = input?.files?.[0]; // Get the file from the input
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const fileText = e.target?.result;

        // Check if fileText is a string before parsing
        if (typeof fileText === 'string') {
          const restoredData = JSON.parse(fileText);

          // Restore the data to localStorage
          Object.keys(restoredData).forEach((key) => {
            localStorage.setItem(key, restoredData[key]);
          });

          // Reload the game scene (you'll need to customize this based on your game's structure)
          const currentScene = localStorage.getItem('currentScene');
          if (currentScene) {
            window.location.href = currentScene; // Redirect to the last saved scene
          }
        }
      };
      reader.readAsText(file);
    }
  };

  // Trigger file input for restore
  const triggerFileInput = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = restoreGame; // Use 'Event' type here
    input.click(); // Open the file picker
  };

  return (
    <div className="w-full bg-gray-900 text-white p-4">
      <div className="flex items-center">
        {/* Heading on the left with margin */}
        <h1 className="text-xl">Game Menu</h1>

        {/* File button next to the heading */}
        <div className="relative ml-4">
          <button onClick={toggleMenu} className="bg-gray-800 px-4 py-2 rounded-lg">
            File
          </button>

          {menuOpen && (
            <div className="absolute left-0 mt-2 w-48 bg-white text-black rounded-md shadow-lg z-20">
              <ul className="py-1">
                <li className="px-4 py-2 hover:bg-gray-200">
                  <Link href="/game">Start Game</Link>
                </li>
                <li className="px-4 py-2 hover:bg-gray-200">
                  <button onClick={saveGame}>Save Game</button>
                </li>
                <li className="px-4 py-2 hover:bg-gray-200">
                  <button onClick={triggerFileInput}>Restore Game</button>
                </li>
                <li className="px-4 py-2 hover:bg-gray-200">
                  <button disabled>Restart Game</button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MenuBar;
