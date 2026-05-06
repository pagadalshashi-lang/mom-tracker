import Link from "next/link";

export default function Home() {
  return (
    <div className="h-screen flex flex-col justify-center items-center bg-pink-100">

      <h1 className="text-5xl font-bold text-pink-700 mb-6">
        Mom Tracker
      </h1>

      <div className="flex gap-4">

        <Link href="/login">
          <button className="bg-pink-600 text-white px-6 py-3 rounded-lg">
            Login
          </button>
        </Link>

        <Link href="/register">
          <button className="border border-pink-600 text-pink-600 px-6 py-3 rounded-lg">
            Create Account
          </button>
        </Link>

      </div>

    </div>
  );
}