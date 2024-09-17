import { useState } from 'react';

const MenuBar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setMenuOpen(!menuOpen);
  };

  // Save localStorage to save.json
  const saveGame = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const gameData = JSON.stringify(localStorage); // Convert localStorage to JSON string
    const blob = new Blob([gameData], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'save.json'; // Name the download file
    link.click();
  };

  // Trigger file input for restore
  const triggerFileInput = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();  // This ensures no unwanted page reload happens
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (event) => {
      restoreGame(event);  // You pass the event to the restoreGame function here
    };

    input.click();  // Open the file picker
  };

  // Restore game from save.json
  const restoreGame = (event: Event) => {
    event.preventDefault();
    const input = event.target as HTMLInputElement;
    const file = input?.files?.[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const fileText = e.target?.result as string; // Ensure fileText is a string
        const restoredData = JSON.parse(fileText);

        Object.keys(restoredData).forEach((key) => {
          localStorage.setItem(key, restoredData[key]);
        });

        const currentScene = localStorage.getItem('currentScene');
        if (window.game && window.game.scene.keys[currentScene]) {
          window.game.scene.start(currentScene);
        } else {
          console.error(`Scene "${currentScene}" not found.`);
        }
      };
      reader.readAsText(file);
    } else {
      console.error("No file selected for restoration.");
    }
  };

  return (
    <div className="w-full bg-gray-900 text-white p-4">
      <div className="flex items-center">
        <h1 className="text-xl">Game Menu</h1>
        <div className="relative ml-4">
          <button onClick={toggleMenu} className="bg-gray-800 px-4 py-2 rounded-lg">
            File
          </button>

          {menuOpen && (
            <div className="absolute left-0 mt-2 w-48 bg-white text-black rounded-md shadow-lg z-20">
              <ul className="py-1">
                <li className="px-4 py-2 hover:bg-gray-200">
                  <button onClick={() => window.game.scene.start('CastleBedroom')}>Start Game</button>
                </li>
                <li className="px-4 py-2 hover:bg-gray-200">
                  <button onClick={saveGame}>Save Game</button>
                </li>
                <li className="px-4 py-2 hover:bg-gray-200">
                  <button onClick={(e) => triggerFileInput(e)}>Restore Game</button> {/* Ensure event is passed */}
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
