import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const loadUser = () => {
      const user = localStorage.getItem("user");
      if (user) {
        try {
          const parsed = JSON.parse(user);
          setUserName(parsed.name || "");
        } catch {
          setUserName("");
        }
      } else {
        setUserName("");
      }
    };

    loadUser();
    window.addEventListener("storage", loadUser);

    return () => window.removeEventListener("storage", loadUser);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.dispatchEvent(new Event("storage"));

    navigate("/login");
  };

  return (
    <nav className="w-full bg-white shadow-sm border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <Link
          to={userName ? "/dashboard" : "/login"}
          className="text-xl font-semibold text-green-700"
        >
          NutriSense
        </Link>

        {userName && (
          <div className="flex items-center gap-4">
            <Link
              to="/dashboard"
              className="text-gray-700 hover:text-green-700 transition px-2 py-1 rounded"
            >
              Dashboard
            </Link>
            <Link
              to="/history"
              className="text-gray-700 hover:text-green-700 transition px-2 py-1 rounded"
            >
              History
            </Link>
            <Link 
              to="/daily-wellness" 
              className="hover:text-green-700"
            >
              Daily Wellness
            </Link>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        {userName ? (
          <>
            <span className="text-gray-800 font-medium">Hi, {userName}</span>
            <button
              onClick={handleLogout}
              className="text-sm text-red-600 hover:text-red-700 px-3 py-1 rounded"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className="text-gray-700 hover:text-green-700 transition px-2 py-1 rounded"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="text-gray-700 hover:text-green-700 transition px-2 py-1 rounded"
            >
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
