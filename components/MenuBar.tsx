import { useState } from 'react';
import Link from 'next/link';

const MenuBar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  // Toggle dropdown menu
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
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
                  <button disabled>Save Game</button>
                </li>
                <li className="px-4 py-2 hover:bg-gray-200">
                  <button disabled>Restore Game</button>
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
