import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import DailyWellnessDashboard from "../components/DailyWellnessDashboard";

export default function DailyDashboardPage() {
  const [allLogs, setAllLogs] = useState([]);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(
          "https://nutrisense-ai.onrender.com/wellness/history",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();
        console.log("History API response:", data);

        if (Array.isArray(data)) {
          setAllLogs(data);
        } else {
          console.warn("History API did NOT return array. Setting empty list.");
          setAllLogs([]);
        }
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  /* ---------------- FILTER BY MONTH/YEAR USING input.date ---------------- */
  const filtered = allLogs.filter((log) => {
    if (!log.input?.date) return false;
    const [y, m] = log.input.date.split("-").map(Number);
    return y === year && m === month;
  });

  const dashboardData = generateDashboardData(filtered);

  return (
    <div className="min-h-screen bg-[#f9f9f9]">
      <Navbar />

      <div className="max-w-5xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-green-700 text-center mb-8">
          Your Monthly Dashboard
        </h1>

        {/* FILTERS */}
        <div className="flex flex-col items-center mb-10">
          <div className="flex gap-10">
            {/* Month */}
            <div className="flex flex-col items-center">
              <label className="text-sm font-medium text-gray-700 mb-1">
                Select Month
              </label>
              <select
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-400"
              >
                {Array.from({ length: 12 }).map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
              </select>
            </div>

            {/* Year */}
            <div className="flex flex-col items-center">
              <label className="text-sm font-medium text-gray-700 mb-1">
                Select Year
              </label>
              <select
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-400"
              >
                {[2024, 2025, 2026].map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* CONTENT */}
        {loading ? (
          <div className="text-gray-600 text-center">Loading dashboard...</div>
        ) : !dashboardData ? (
          <div className="text-gray-600 text-center">
            No data available for this month.
          </div>
        ) : (
          <DailyWellnessDashboard data={dashboardData} />
        )}
      </div>
    </div>
  );
}

/* -----------------------------------------------------
   DATA PROCESSING — Updated to use input.date everywhere
   ----------------------------------------------------- */

function generateDashboardData(logs) {
  if (!logs.length) return null;

  const moodMap = {
    happy: 80,
    neutral: 50,
    sad: 30,
    stressed: 20,
    angry: 25,
  };

  // Latest entry by date
  const latest = logs[0];
  const input = latest.input;

  const dailyRadar = {
    diet: latest.score,
    sleep: input.sleep_hours * 10,
    energy: 50,
    activity: input.exercise_hours * 20,
    mood: moodMap[input.mood.toLowerCase()] || 50,
  };

  // Pie chart
  const healthy = logs.filter((l) => l.category === "Healthy").length;
  const balanced = logs.filter((l) => l.category === "Moderate").length;
  const junk = logs.filter((l) => l.category === "Poor").length;
  const dietBreakdown = { healthy, balanced, junk };

  // Trends (last 14 entries)
  const trends = logs.slice(-14).map((l) => ({
    date: l.input.date, // ⭐ NEW
    energy: 50,
    mood: moodMap[l.input.mood.toLowerCase()] || 50,
  }));

  // Weekly heatmap (last 28 entries)
  const weeklyQuality = logs.slice(-28).map((l) => ({
    date: l.input.date, // ⭐ NEW
    quality:
      l.category === "Healthy"
        ? "good"
        : l.category === "Moderate"
        ? "mixed"
        : "bad",
  }));

  // Recent "growth" (first 3)
  const recentGrowth = logs.slice(0, 3).map((l) => ({
    date: l.input.date, // ⭐ NEW
    weight: l.input.height_cm / 3.5,
  }));

  // Monthly summaries
  const avgScore = logs.reduce((a, b) => a + b.score, 0) / logs.length;
  const avgSleep =
    logs.reduce((a, b) => a + b.input.sleep_hours, 0) / logs.length;

  const monthlySummary = {
    avgHealthScore: Math.round(avgScore),
    healthyDays: healthy,
    junkDays: junk,
    avgSleep: Math.round(avgSleep),
  };

  return {
    dailyRadar,
    dietBreakdown,
    trends,
    weeklyQuality,
    recentGrowth,
    monthlySummary,
  };
}
