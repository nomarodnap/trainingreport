import './styles.css';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-10 bg-gradient-to-br from-indigo-100 to-white p-6">
      <h1 className="text-4xl font-bold text-gray-800">🌈 Tailwind Animated Buttons</h1>

      {/* ปุ่มแบบ Hover Scale */}
      <button className="px-6 py-3 bg-blue-500 text-white rounded-xl shadow-lg transition-transform duration-300 hover:scale-110">
        Hover Scale
      </button>

      {/* ปุ่มแบบ Glow Effect */}
      <button className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold rounded-full shadow-md hover:shadow-pink-300/50 transition-shadow duration-300">
        Glow Effect
      </button>

      {/* ปุ่มแบบ Border Slide In */}
      <button className="relative px-6 py-3 bg-white text-black font-semibold border-2 border-black rounded-lg overflow-hidden group">
        <span className="absolute inset-0 w-full h-full bg-black translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out" />
        <span className="relative group-hover:text-white transition-colors duration-300">Slide Border</span>
      </button>

      {/* ปุ่มแบบ Pulse */}
      <button className="px-6 py-3 bg-green-500 text-white font-bold rounded-lg animate-pulse">
        Pulse
      </button>

      {/* ปุ่มแบบ Bounce */}
      <button className="px-6 py-3 bg-yellow-400 text-white font-bold rounded-full animate-bounce">
        Bounce
      </button>
    </div>
  );
}
