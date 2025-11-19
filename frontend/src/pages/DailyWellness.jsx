import Navbar from "../components/Navbar";
import WellnessForm from "../components/WellnessForm";

export default function DailyWellness() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-3xl mx-auto mt-12 bg-white shadow-lg rounded-xl p-8 border border-gray-100">
        <h1 className="text-3xl font-semibold text-green-700 text-center mb-6">
          Daily Wellness Tracker
        </h1>

        <WellnessForm />
      </div>
    </div>
  );
}
