import MenuBar from '../components/MenuBar';

export default function Home() {
  return (
    <div className="relative w-screen h-screen bg-gray-800">
      {/* Menu Bar */}
      <MenuBar />

      {/* Embed the Castle Bedroom Scene */}
      <div className="flex items-center justify-center w-screen h-screen bg-gray-800">
        <div className="relative" style={{ width: '1850px', height: '1400px' }}>
          {/* Castle Bedroom Scene loaded via iframe */}
          <iframe
            src="index.html" // Load the scene from the public folder
            width="1850"
            height="1400"
            style={{ border: 'none' }}
            title="Castle Bedroom Scene"
          ></iframe>

          
        </div>
      </div>
    </div>
  );
}
