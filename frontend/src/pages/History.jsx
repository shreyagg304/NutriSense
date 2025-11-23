import Navbar from "../components/Navbar";
import { useState, useEffect } from "react";
import api from "../api/client";
import Footer from "../components/Footer";

export default function WellnessHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get("/wellness/history");
        console.log("Wellness history:", res.data);

        // Ensure always array
        setHistory(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error(err);
        setError("Unable to load wellness history");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto p-8">
        <h1 className="text-3xl font-semibold text-green-700 text-center mb-6">
          Daily Wellness History
        </h1>

        {loading && (
          <p className="text-center text-gray-500">Loading history...</p>
        )}

        {error && (
          <p className="text-center text-red-600 font-medium">{error}</p>
        )}

        {!loading && history.length === 0 ? (
          <p className="text-center text-gray-500">
            No wellness records found.
          </p>
        ) : (
          <div className="space-y-6">
            {history.map((item) => (
              <div
                key={item._id}
                className="bg-white border border-gray-200 shadow-sm rounded-xl p-6 hover:shadow-md transition-all"
              >
                {/* ⭐ USING input.date INSTEAD OF created_at */}
                <div className="text-sm text-gray-500 mb-2">
                  {item.input?.date
                    ? item.input.date
                    : "Date unavailable"}
                </div>

                <p className="text-gray-700 text-sm mb-1">
                  <b>Category:</b>{" "}
                  <span className="text-green-600 font-medium">
                    {item.category}
                  </span>
                </p>

                <p className="text-gray-700 text-sm mb-1">
                  <b>Score:</b> {item.score}
                </p>

                <p className="text-gray-700 text-sm mb-1">
                  <b>Age:</b> {item.input.age}
                </p>

                <p className="text-gray-700 text-sm mb-1">
                  <b>Height:</b> {item.input.height_cm} cm
                </p>

                <p className="text-gray-700 text-sm mb-1">
                  <b>Disease:</b> {item.input.disease}
                </p>

                <p className="text-gray-700 text-sm mb-1">
                  <b>Mood:</b> {item.input.mood}
                </p>

                <p className="text-gray-700 text-sm mb-1">
                  <b>Water Intake:</b> {item.input.water_intake_liters} L
                </p>

                <p className="text-gray-700 text-sm mb-1">
                  <b>Sleep:</b> {item.input.sleep_hours} hrs (
                  {item.input.sleep_start} → {item.input.sleep_end})
                </p>

                <p className="text-gray-700 text-sm mb-1">
                  <b>Exercise:</b> {item.input.exercise_hours} hrs
                </p>

                <p className="text-gray-700 text-sm mb-2">
                  <b>Food:</b> {item.input.breakfast}, {item.input.lunch},{" "}
                  {item.input.dinner}, {item.input.snacks}
                </p>

                {item.input.notes && (
                  <p className="text-gray-700 text-sm mb-2">
                    <b>Notes:</b> {item.input.notes}
                  </p>
                )}

                <p className="text-gray-700 text-sm">
                  <b>Recommendations:</b> {item.recommendations.join(' ')}
                </p>

              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
