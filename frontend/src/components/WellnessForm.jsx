import { useState } from "react";
import { submitDailyWellness } from "../api/wellnessApi";
import WellnessResult from "./WellnessResult";

export default function WellnessForm() {
  // const [formData, setFormData] = useState({
  //   age: "",
  //   height_cm: "",
  //   disease: "",
  //   breakfast: "",
  //   lunch: "",
  //   dinner: "",
  //   snacks: "",
  //   sleep_hours: "",
  //   sleep_start: "",
  //   sleep_end: "",
  //   exercise_hours: "",
  //   water_intake_liters: "",
  //   mood: "",
  //   notes: "",
  // });

  const [formData, setFormData] = useState({
    age: 10,
    height_cm: 125,
    disease: "none",
    breakfast: "milk banana oats",
    lunch: "dal rice",
    dinner: "roti sabzi",
    snacks: "fruit",
    sleep_hours: 8,
    sleep_start: "22:00",
    sleep_end: "06:00",
    exercise_hours: 1,
    water_intake_liters: 2,
    mood: "happy",
    notes: "test mode default values",
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const inputClasses =
    "w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-300 focus:outline-none";

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await submitDailyWellness(formData);
      setResult(res.data);
    } catch (err) {
      console.error(err);
      setError("Unable to submit wellness data");
    } finally {
      setLoading(false);
    }
  };

  if (result)
    return <WellnessResult result={result} onBack={() => setResult(null)} />;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {Object.keys(formData).map((key) => (
        <div key={key}>
          <label className="block font-medium text-gray-700 mb-1">
            {key.replace(/_/g, " ").toUpperCase()}
          </label>

          {key === "notes" ? (
            <textarea
              name={key}
              value={formData[key]}
              onChange={handleChange}
              className={inputClasses + " h-20"}
              placeholder="Optional notes..."
            />
          ) : (
            <input
              type="text"
              name={key}
              value={formData[key]}
              onChange={handleChange}
              className={inputClasses}
              required={key !== "notes"}
            />
          )}
        </div>
      ))}

      <button
        type="submit"
        className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition-all"
      >
        {loading ? "Submitting..." : "Submit"}
      </button>

      {error && <p className="text-red-600">{error}</p>}
    </form>
  );
}
