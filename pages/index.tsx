import MenuBar from '../components/MenuBar';

export default function Home() {
  return (
    <div className="relative w-screen h-screen bg-gray-800">
      {/* Menu Bar */}
      <MenuBar />

      {/* Background Image and Disclaimer */}
      <div className="flex items-center justify-center w-screen h-screen bg-gray-800">
        <div className="relative" style={{ width: '1500px', height: '900px' }}>
          {/* Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: 'url("/graphics/menu.webp")', width: '1500px', height: '800px' }}
          ></div>

          {/* Disclaimer */}
          <div
            className="absolute top-0 left-0 w-full text-center p-4 bg-black bg-opacity-75 text-white text-lg"
            style={{ height: '100px' }}
          >
            <p>Use this screen to size the gameplay canvas prior to beginning gameplay.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
