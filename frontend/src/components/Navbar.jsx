import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [isOpen, setIsOpen] = useState(false);

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

  const navItem =
    "block px-3 py-2 text-gray-700 hover:text-green-700 transition";

  return (
    <nav className="w-full bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex justify-between items-center max-w-6xl mx-auto">

        {/* LOGO */}
        <Link
          to={userName ? "/" : "/login"}
          className="text-2xl font-bold text-green-700"
        >
          NutriSense
        </Link>

        {/* Desktop Nav */}
        {userName && (
          <div className="hidden md:flex items-center gap-6">
            <Link to="/dashboard" className={navItem}>
              Status Prediction
            </Link>

            <Link to="/history" className={navItem}>
              History
            </Link>

            <Link to="/daily-wellness" className={navItem}>
              Daily Wellness
            </Link>

            <Link to="/daily-dashboard" className={navItem}>
              Dashboard
            </Link>

            <span className="text-gray-800 font-medium">Hi, {userName}</span>

            <button
              onClick={handleLogout}
              className="text-red-600 hover:text-red-700 transition px-3 py-2"
            >
              Logout
            </button>
          </div>
        )}

        {/* Desktop - Not logged in */}
        {!userName && (
          <div className="hidden md:flex items-center gap-6">
            <Link to="/login" className={navItem}>
              Login
            </Link>
            <Link to="/signup" className={navItem}>
              Sign Up
            </Link>
          </div>
        )}

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-gray-700 hover:text-green-700"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="md:hidden mt-4 bg-white border-t border-gray-200 pt-2 pb-4 px-2">

          {userName ? (
            <>
              <Link to="/dashboard" className={navItem}>
                Status Prediction
              </Link>
              <Link to="/history" className={navItem}>
                History
              </Link>
              <Link to="/daily-wellness" className={navItem}>
                Daily Wellness
              </Link>
              <Link to="/daily-dashboard" className={navItem}>
                Dashboard
              </Link>

              <span className="block px-3 py-2 text-gray-800 font-medium">
                Hi, {userName}
              </span>

              <button
                onClick={handleLogout}
                className="block w-full text-left px-3 py-2 text-red-600 hover:text-red-700 transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className={navItem}>
                Login
              </Link>
              <Link to="/signup" className={navItem}>
                Sign Up
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}