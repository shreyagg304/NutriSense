export default function WellnessResult({ result, onBack }) {
  return (
    <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-6 shadow-md">
      <h2 className="text-2xl font-bold text-green-700 mb-4">
        Wellness Summary
      </h2>

      <p className="mb-2">
        <b>Wellness Score:</b> {result.wellness_score}
      </p>

      <p className="mb-2">
        <b>Status:</b> {result.prediction}
      </p>

      <p className="mb-2">
        <b>Recommendations:</b> {result.recommendations.join(", ")}
      </p>

      <button
        onClick={onBack}
        className="mt-6 w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg"
      >
        Back
      </button>
    </div>
  );
}
