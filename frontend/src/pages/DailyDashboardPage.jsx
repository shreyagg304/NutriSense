import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import DailyWellnessDashboard from "../components/DailyWellnessDashboard";
import Footer from "../components/Footer";

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
        if (Array.isArray(data)) setAllLogs(data);
        else setAllLogs([]);
      } catch (err) {
        console.error("Failed to load history", err);
        setAllLogs([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [token]);

  // Filter logs by month & year (use created_at if present; fall back to input.date)
  const filtered = allLogs.filter((log) => {
    const dtRaw = log.created_at ?? log.input?.date;
    if (!dtRaw) return false;
    const d = new Date(dtRaw);
    return d.getMonth() + 1 === month && d.getFullYear() === year;
  });

  const dashboardData = generateDashboardData(filtered);

  return (
    <div className="min-h-screen bg-[#f9f9f9]">
      <Navbar />

      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-green-700 text-center mb-6">
          Your Monthly Dashboard
        </h1>

        {/* Filters stay above dashboard (Option 1) */}
        <div className="flex justify-center gap-6 mb-8">
          <div className="flex flex-col items-center">
            <label className="text-sm text-gray-700 mb-1">Select Month</label>
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

          <div className="flex flex-col items-center">
            <label className="text-sm text-gray-700 mb-1">Select Year</label>
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

        {/* Content */}
        {loading ? (
          <div className="text-gray-600 text-center py-12">Loading dashboard...</div>
        ) : !dashboardData ? (
          <div className="text-gray-600 text-center py-12">No data available for this month.</div>
        ) : (
          <DailyWellnessDashboard
            data={dashboardData}
            selected={{ month, year }}
          />
        )}
      </div>
      <Footer />
    </div>
  );
}

/* ----------------- DATA PROCESSING ----------------- */

function generateDashboardData(logs) {
  if (!logs || logs.length === 0) return null;

  const moodMap = {
    happy: 80,
    neutral: 50,
    sad: 30,
    stressed: 20,
    angry: 25,
  };

  // sort descending by date (so latest is first)
  const sorted = [...logs].sort((a, b) => new Date(b.created_at ?? b.input?.date) - new Date(a.created_at ?? a.input?.date));
  const latest = sorted[0];
  const input = latest.input ?? {};

  const dailyRadar = {
    diet: Math.round(latest.score ?? 50),
    sleep: Math.round((input.sleep_hours ?? 7) * 10),
    energy: 50,
    activity: Math.round((input.exercise_hours ?? 0) * 20),
    mood: moodMap[(input.mood ?? "neutral").toLowerCase()] || 50,
  };

  const healthy = logs.filter((l) => (l.category ?? l.prediction) === "Healthy").length;
  const balanced = logs.filter((l) => (l.category ?? l.prediction) === "Moderate").length;
  const junk = logs.filter((l) => (l.category ?? l.prediction) === "Poor").length;
  const dietBreakdown = { healthy, balanced, junk };

  const trends = sorted.slice(0, 14).map((l) => {
    const d = (l.input && l.input.date) || (l.created_at ? l.created_at.slice(0, 10) : null);
    return {
      date: d || new Date().toISOString().slice(0, 10),
      energy: 50,
      mood: moodMap[((l.input && l.input.mood) || "neutral").toLowerCase()] || 50,
    };
  }).reverse();

  const weeklyQuality = sorted.slice(0, 28).map((l) => {
    const d = (l.input && l.input.date) || (l.created_at ? l.created_at.slice(0, 10) : null);
    return {
      date: d || new Date().toISOString().slice(0, 10),
      quality:
        (l.category ?? l.prediction) === "Healthy" ? "good" :
        (l.category ?? l.prediction) === "Moderate" ? "mixed" : "bad",
    };
  }).reverse();

  const recentGrowth = sorted.slice(0, 3).map((l) => ({
    date: (l.input && l.input.date) || (l.created_at ? l.created_at.slice(0, 10) : ""),
    height_cm: (l.input && l.input.height_cm) ?? null,
  }));

  const avgScore = logs.reduce((a, b) => a + (b.score ?? 0), 0) / logs.length;
  const avgSleep = logs.reduce((a, b) => a + ((b.input && b.input.sleep_hours) ?? 7), 0) / logs.length;

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
