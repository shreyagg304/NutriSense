import Navbar from "../components/Navbar";
import { useState } from "react";
import api from "../api/client";
import Footer from "../components/Footer";

export default function Dashboard() {
  const [formData, setFormData] = useState({
    age: "",
    gender: "",
    height: "",
    food_text: "",
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handlePredict = async (e) => {
  e.preventDefault();

  setLoading(true);
  setError("");
  setResult(null);

  try {
    const res = await api.post(
      "/api/predict",
      formData,
      {
        headers: { "Content-Type": "application/json" }
      }
    );

    setResult(res.data);

  } catch (err) {
    console.error(err);

    const detail = err.response?.data?.detail;

    if (Array.isArray(detail)) {
      setError(detail.map((d) => d.msg).join(", "));
    } else if (typeof detail === "string") {
      setError(detail);
    } else {
      setError("Unable to predict data");
    }
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-3xl mx-auto mt-12 bg-white shadow-lg rounded-xl p-8 border border-gray-100">
        <h1 className="text-3xl font-semibold text-green-700 text-center mb-6">
          Nutrition Status Prediction
        </h1>

        <form onSubmit={handlePredict} className="space-y-5">
          <div>
            <label className="block font-medium text-gray-700 mb-1">
              Age (months)
            </label>
            <input
              type="number"
              value={formData.age}
              onChange={(e) =>
                setFormData({ ...formData, age: Number(e.target.value) })
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-300 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-medium text-gray-700 mb-1">
              Gender
            </label>
            <select
              value={formData.gender}
              onChange={(e) =>
                setFormData({ ...formData, gender: e.target.value })
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-300 focus:outline-none"
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>

          <div>
            <label className="block font-medium text-gray-700 mb-1">
              Height (cm)
            </label>
            <input
              type="number"
              value={formData.height}
              onChange={(e) =>
                setFormData({ ...formData, height: Number(e.target.value) })
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-300 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-medium text-gray-700 mb-1">
              Food Description
            </label>
            <textarea
              value={formData.food_text}
              onChange={(e) =>
                setFormData({ ...formData, food_text: e.target.value })
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 h-24 focus:ring-2 focus:ring-green-300 focus:outline-none"
              placeholder="e.g. Rice, dal, milk..."
            />
          </div>

          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition-all"
          >
            {loading ? "Predicting..." : "Predict"}
          </button>
        </form>

        {error && (
          <p className="mt-4 text-red-600 font-medium">
             {error}
          </p>
        )}

        {result && (
          <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-6">
            <h2 className="text-xl font-bold text-green-700 mb-2">Result</h2>
            <p><b>Nutrition Status:</b> {result.nutrition_status}</p>
            <p><b>Food Category:</b> {result.food_category}</p>
            <p className="mt-2 text-gray-700">{result.recommendation}</p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
