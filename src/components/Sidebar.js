import Link from "next/link";

export default function Sidebar() {
  return (
    <div className="w-52 bg-[#3E7591] text-white min-h-screen px-4 py-5 shadow-lg">

      <h1 className="text-xl font-bold mb-6 text-center">
        MoM Tracker
      </h1>

      <div className="space-y-1">

        <Link
          href="/dashboard"
          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#2f617a] transition"
        >
          📊 <span>Dashboard</span>
        </Link>

        <Link
          href="/dashboard/upload-mom"
          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#2f617a] transition"
        >
          📤 <span>Upload MOM</span>
        </Link>

        <Link
          href="/dashboard/my-actions"
          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#2f617a] transition"
        >
          ✅ <span>My Actions</span>
        </Link>

        <Link
          href="/dashboard/mom-list"
          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#2f617a] transition"
        >
          📋 <span>MOM List</span>
        </Link>

        <Link
          href="/dashboard/pending"
          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#2f617a] transition"
        >
          ⏳ <span>Pending Tasks</span>
        </Link>

          




        

        <Link
          href="/login"
          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-500 transition mt-6"
        >
          🚪 <span>Logout</span>
        </Link>

      </div>

    </div>
  );
}