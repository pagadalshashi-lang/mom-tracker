export default function Navbar() {
  return (
    <div className="bg-pink-600 text-white p-4 flex justify-between items-center">

      <h1 className="text-2xl font-bold">
        Mom Tracker
      </h1>

      <button className="bg-white text-pink-600 px-4 py-2 rounded">
        Logout
      </button>

    </div>
  );
}