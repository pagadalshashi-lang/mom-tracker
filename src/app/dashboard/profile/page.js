"use client";

import { useEffect, useState } from "react";

export default function ProfilePage() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");

    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold text-[#3E7591] mb-8">
        My Profile
      </h1>

      <div className="bg-white rounded-xl shadow-lg p-6">
        {user ? (
          <div className="space-y-4 text-black">

            <div>
              <strong>Name:</strong> {user.name}
            </div>

            <div>
              <strong>Email:</strong> {user.email}
            </div>

            <div>
              <strong>Employee Code:</strong> {user.empCode}
            </div>

            <div>
              <strong>Department:</strong> {user.department}
            </div>

            <div>
              <strong>Role:</strong> {user.role}
            </div>

          </div>
        ) : (
          <p>No User Found</p>
        )}
      </div>
    </div>
  );
}