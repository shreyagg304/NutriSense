export default function Footer() {
  return (
    <footer className="bg-green-600 border-t border-gray-300 mt-10 py-5">
      <div className="max-w-6xl mx-auto px-4 text-center">

        <h2 className="text-xl font-semibold text-white">
          NutriSense
        </h2>

        <p className="text-md text-white mt-1">
          AI-powered health & wellness insights for better daily habits.
        </p>

        <p className="text-md text-white mt-3">
          © {new Date().getFullYear()} NutriSense. All rights reserved.
        </p>

      </div>
    </footer>
  );
}
