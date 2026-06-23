"use client";

import { useEffect, useState, useRef } from "react";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [showProfile, setShowProfile] = useState(false);

  const profileRef = useRef();

  useEffect(() => {
    const userData = JSON.parse(
      localStorage.getItem("user")
    );

    setUser(userData);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        setShowProfile(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  return (
    <div className="w-full h-16 bg-white shadow flex justify-end items-center px-6">

      <div
        className="relative"
        ref={profileRef}
      >
        <button
          onClick={() =>
            setShowProfile(!showProfile)
          }
          className="w-12 h-12 rounded-full bg-[#3E7591] text-white text-xl font-bold flex items-center justify-center shadow-md"
        >
          {user?.name?.charAt(0)?.toUpperCase() || "U"}
        </button>

        {showProfile && (
          <div className="absolute right-0 mt-3 w-72 bg-white border rounded-xl shadow-xl p-5 z-50">

            <div className="text-center mb-4">
              <div className="w-16 h-16 rounded-full bg-[#3E7591] text-white text-2xl font-bold flex items-center justify-center mx-auto mb-3">
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </div>

              <h3 className="font-bold text-lg text-black">
                {user?.name || "-"}
              </h3>
            </div>

            <div className="border-t pt-3 text-black space-y-3">

              <p>
                <b>Email:</b><br />
                {user?.email || "-"}
              </p>

              <p>
                <b>Employee Code:</b><br />
                {user?.employeeCode || "-"}
              </p>

            </div>

          </div>
        )}
      </div>

    </div>
  );
}