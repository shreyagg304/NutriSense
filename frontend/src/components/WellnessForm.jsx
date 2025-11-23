import { useState } from "react";
import { submitDailyWellness } from "../api/wellnessApi";
import WellnessResult from "./WellnessResult";

export default function WellnessForm() {
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  // const [formData, setFormData] = useState({
  //   date: today,                 // ⭐ Default today's date
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
    date : today,
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
      const numericData = {
        ...formData,
        age: Number(formData.age),
        height_cm: Number(formData.height_cm),
        sleep_hours: Number(formData.sleep_hours),
        exercise_hours: Number(formData.exercise_hours),
        water_intake_liters: Number(formData.water_intake_liters),
      };

      const res = await submitDailyWellness(numericData);
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

      {/* ⭐ DATE FIELD */}
      <div>
        <label className="block font-medium text-gray-700 mb-1">DATE</label>
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          className={inputClasses}
          required
        />
      </div>

      {/* Render all fields EXCEPT date */}
      {Object.keys(formData)
        .filter((key) => key !== "date")
        .map((key) => (
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
                type={
                  key.includes("hours") ||
                  key.includes("liters") ||
                  key === "age" ||
                  key === "height_cm"
                    ? "number"
                    : "text"
                }
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
