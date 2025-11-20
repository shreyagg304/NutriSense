import React from "react";
import { Radar, Line, Pie } from "react-chartjs-2";
import {
  Chart,
  RadarController,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  Title,
  ArcElement,
} from "chart.js";

Chart.register(
  RadarController,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  Title,
  ArcElement
);

export default function DailyWellnessDashboard({ data }) {
  return (
    <div className="space-y-10">

      {/* -------------------------------------------------- */}
      {/* ROW 1: RADAR + LOGIC */}
      {/* -------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Radar Chart */}
        <Card title="Daily Health Radar" className="lg:col-span-2">
          <div className="max-w-[500px] mx-auto">
            <Radar data={radarConfig(data.dailyRadar)} />
          </div>
        </Card>

        {/* Radar Explanation */}
        <Card title="Radar Score Logic">
          <RadarLogic />
        </Card>

      </div>

      {/* -------------------------------------------------- */}
      {/* ROW 2: LINE GRAPH + PIE CHART */}
      {/* -------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Line Graph */}
        <Card title="Mood & Energy (Last 14 Days)">
          <div className="max-w-[600px] mx-auto">
            <Line data={lineConfig(data.trends)} />
          </div>
        </Card>

        {/* Pie Chart */}
        <Card title="Diet Breakdown">
          <div className="max-w-[350px] mx-auto">
            <Pie data={pieConfig(data.dietBreakdown)} />
          </div>
        </Card>

      </div>

      {/* -------------------------------------------------- */}
      {/* ROW 3: HEATMAP + HEIGHT */}
      {/* -------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Weekly Heatmap */}
        <Card title="Weekly Heatmap (Last 28 Days)">
          <HeatmapGrid days={data.weeklyQuality} />
        </Card>

        {/* Height Trend */}
        <Card title="Height Growth Trend (Last 3 Days)">
          <ul className="text-sm">
            {data.recentGrowth.map((g, i) => (
              <li key={i} className="flex justify-between py-1 border-b border-gray-200">
                <span>{g.date}</span>
                <span>{g.weight} cm</span>
              </li>
            ))}
          </ul>
        </Card>

      </div>

      {/* -------------------------------------------------- */}
      {/* ROW 4: MONTHLY SUMMARY */}
      {/* -------------------------------------------------- */}
      <Card title="Monthly Summary">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Summary label="Avg Health Score" value={data.monthlySummary.avgHealthScore} />
          <Summary label="Healthy Days" value={data.monthlySummary.healthyDays} />
          <Summary label="Junk Days" value={data.monthlySummary.junkDays} />
          <Summary label="Avg Sleep (hrs)" value={data.monthlySummary.avgSleep} />
        </div>
      </Card>

    </div>
  );
}

/* -------------------------------------------------- */
/* UI COMPONENTS */
/* -------------------------------------------------- */

function Card({ title, children, className = "" }) {
  return (
    <div className={`bg-white border border-gray-300 rounded-lg p-4 shadow-sm ${className}`}>
      <h2 className="text-lg font-medium text-gray-800 mb-3">{title}</h2>
      {children}
    </div>
  );
}

function Summary({ label, value }) {
  return (
    <div className="border border-gray-300 rounded-lg p-3 bg-white text-center">
      <div className="text-sm text-gray-600">{label}</div>
      <div className="text-xl font-semibold text-green-700">{value}</div>
    </div>
  );
}

function HeatmapGrid({ days }) {
  return (
    <div className="grid grid-cols-7 gap-1">
      {days.map((d, i) => (
        <div
          key={i}
          title={`${d.date} • ${d.quality}`}
          className={`h-8 w-8 rounded-md flex items-center justify-center text-xs
            ${
              d.quality === "good"
                ? "bg-green-200 text-green-700"
                : d.quality === "mixed"
                ? "bg-yellow-200 text-yellow-700"
                : "bg-red-200 text-red-700"
            }
          `}
        >
          {new Date(d.date).getDate()}
        </div>
      ))}
    </div>
  );
}

function RadarLogic() {
  return (
    <div className="text-lg space-y-4 text-gray-700">

      <p><b>Diet:</b> Direct wellness score (0–100).</p>

      <p>
        <b>Sleep:</b> sleep_hours × 10  
        <br />Example: 7 hours → 70
      </p>

      <p>
        <b>Energy:</b> Fixed at 50 (combined metric).
      </p>

      <p>
        <b>Activity:</b> exercise_hours × 20  
        <br />Example: 1 hr → 20
      </p>

      <p>
        <b>Mood:</b> Happy → 80, Neutral → 50,  
        Sad → 30, Stressed → 20, Angry → 25
      </p>

    </div>
  );
}

/* -------------------------------------------------- */
/* CHART CONFIG */
/* -------------------------------------------------- */

function radarConfig(d) {
  return {
    labels: ["Diet", "Sleep", "Energy", "Activity", "Mood"],
    datasets: [
      {
        label: "Today",
        data: [d.diet, d.sleep, d.energy, d.activity, d.mood],
        borderColor: "#16a34a",
        backgroundColor: "rgba(34,197,94,0.25)",
        borderWidth: 2,
      },
    ],
  };
}

function pieConfig(p) {
  return {
    labels: ["Healthy", "Balanced", "Junk"],
    datasets: [
      {
        data: [p.healthy, p.balanced, p.junk],
        backgroundColor: ["#16a34a", "#facc15", "#dc2626"],
      },
    ],
  };
}

function lineConfig(trends) {
  return {
    labels: trends.map((t) => t.date),
    datasets: [
      {
        label: "Energy",
        data: trends.map((x) => x.energy),
        borderColor: "#16a34a",
        borderWidth: 2,
        tension: 0.4,
      },
      {
        label: "Mood",
        data: trends.map((x) => x.mood),
        borderColor: "#0ea5e9",
        borderWidth: 2,
        tension: 0.4,
      },
    ],
  };
}
