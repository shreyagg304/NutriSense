import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto text-center pt-24 px-6">
        <h1 className="text-4xl font-bold text-green-700 mb-4">
          Welcome to NutriSense 🍏
        </h1>

        <p className="text-lg text-gray-600 mb-10">
          Track daily wellness, monitor health habits, and get personalized
          insights to improve your lifestyle.
        </p>

        <div className="flex justify-center gap-6">
          <Link
            to="/login"
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold"
          >
            Log In
          </Link>

          <Link
            to="/signup"
            className="bg-white border border-green-600 text-green-700 px-6 py-3 rounded-lg font-semibold hover:bg-green-50"
          >
            Sign Up
          </Link>
        </div>

        <div className="mt-14">
          <h2 className="text-2xl font-semibold text-green-700 mb-3">
            Why NutriSense?
          </h2>

          <ul className="text-gray-600 space-y-2">
            <li>✔ AI-powered wellness analysis</li>
            <li>✔ Daily nutrition & lifestyle tracking</li>
            <li>✔ Personalized recommendations</li>
            <li>✔ Long-term wellness history insights</li>
          </ul>
        </div>
      </div>
    </div>
  );
}