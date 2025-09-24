import { useState } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

const HydrogeologicalAnalysisChart = () => {
  const [activeSeries, setActiveSeries] = useState("all"); // 'all' is the default view

  const data = [
    {
      month: "Apr",
      extraction: 5300,
      recharge: 3108,
      waterQuality: 92,
      declineRate: 0.25,
    },
    {
      month: "May",
      extraction: 6150,
      recharge: 1800,
      waterQuality: 89,
      declineRate: 0.31,
    },
    {
      month: "Jun",
      extraction: 5800,
      recharge: 4500,
      waterQuality: 87,
      declineRate: 0.28,
    },
    {
      month: "Jul",
      extraction: 4700,
      recharge: 8200,
      waterQuality: 91,
      declineRate: 0.18,
    },
    {
      month: "Aug",
      extraction: 4100,
      recharge: 7800,
      waterQuality: 90,
      declineRate: 0.15,
    },
    {
      month: "Sep",
      extraction: 3900,
      recharge: 6500,
      waterQuality: 88,
      declineRate: 0.22,
    },
  ].map((d) => ({ ...d, netBalance: d.recharge - d.extraction }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-3 bg-white/90 backdrop-blur-sm border border-slate-200 rounded-xl shadow-lg w-64 font-sans">
          <p className="font-bold text-slate-800 text-lg mb-2">
            {label} 2025 Summary
          </p>
          <div className="space-y-2">
            {payload.map((pld: any) => (
              <div
                key={pld.dataKey}
                className="flex items-center justify-between text-sm"
              >
                <div className="flex items-center">
                  <div
                    className="w-2 h-2 rounded-full mr-2"
                    style={{ backgroundColor: pld.stroke || pld.fill }}
                  ></div>
                  <span className="text-slate-600">{pld.name}:</span>
                </div>
                <span className="font-semibold text-slate-800">{`${pld.value.toLocaleString()}${
                  pld.unit || ""
                }`}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  // --- Replace the entire return statement of your HydrogeologicalAnalysisChart with this new version ---
  // --- Replace the entire return statement of your HydrogeologicalAnalysisChart with this new version ---
  return (
    // --- CHANGE 1: Added `relative` and `overflow-hidden` to the main container ---
    <div className="relative overflow-hidden w-full bg-white/80 p-6 rounded-2xl border my-4 backdrop-blur-md shadow-xl font-sans">
      {/* --- CHANGE 2: Added the absolutely positioned top border --- */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-purple-500 to-purple-800"></div>

      {/* Title and Subtitle Section (no changes here) */}
      <div>
        <h3 className="font-bold text-xl text-slate-800 mb-1 ml-2">
          Interactive Financial Analysis
        </h3>
        <p className="text-sm text-slate-500 mb-4 ml-2">
          Six Month Summary (2025)
        </p>
      </div>

      {/* Interactive Filter Buttons (no changes here) */}
      <div className="flex items-center justify-center gap-2 mb-4 p-1 bg-slate-100 rounded-full">
        <button
          onClick={() => setActiveSeries("all")}
          className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-colors duration-200 ${
            activeSeries === "all"
              ? "bg-slate-800 text-white shadow"
              : "text-slate-600 hover:bg-slate-200"
          }`}
        >
          All
        </button>
        <button
          onClick={() => setActiveSeries("extraction")}
          className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-colors duration-200 ${
            activeSeries === "extraction"
              ? "bg-red-500 text-white shadow"
              : "text-red-700 hover:bg-red-100"
          }`}
        >
          Extraction
        </button>
        <button
          onClick={() => setActiveSeries("recharge")}
          className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-colors duration-200 ${
            activeSeries === "recharge"
              ? "bg-green-500 text-white shadow"
              : "text-green-700 hover:bg-green-100"
          }`}
        >
          Recharge
        </button>
        <button
          onClick={() => setActiveSeries("netBalance")}
          className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-colors duration-200 ${
            activeSeries === "netBalance"
              ? "bg-amber-600 text-white shadow"
              : "text-amber-700 hover:bg-amber-100"
          }`}
        >
          Net Balance
        </button>
        <button
          onClick={() => setActiveSeries("waterQuality")}
          className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-colors duration-200 ${
            activeSeries === "waterQuality"
              ? "bg-purple-500 text-white shadow"
              : "text-purple-700 hover:bg-purple-100"
          }`}
        >
          Profit Margin
        </button>
      </div>

      {/* The Chart Itself (no changes here) */}
      <div className="w-full h-[500px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{ top: 5, right: 20, left: -10, bottom: 10 }}
          >
            <defs>
              <linearGradient id="colorExtraction" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorRecharge" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorNetBalance" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#d97706" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#d97706" stopOpacity={0} />
              </linearGradient>
              <linearGradient
                id="colorWaterQuality"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#e2e8f0"
              vertical={false}
            />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              dy={10}
              tick={{ fill: "#64748b", fontSize: 12 }}
            />
            <YAxis
              yAxisId="left"
              unit=" m³"
              width={80}
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#64748b" }}
              tickFormatter={(value) =>
                new Intl.NumberFormat("en-US", {
                  notation: "compact",
                  compactDisplay: "short",
                }).format(value)
              }
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              unit="%"
              domain={[80, 100]}
              width={50}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#64748b", fontSize: 12 }}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: "rgba(241, 245, 249, 0.7)" }}
            />

            {(activeSeries === "all" || activeSeries === "extraction") && (
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="extraction"
                name="Extraction"
                unit=" m³"
                fill="url(#colorExtraction)"
                stroke="#ef4444"
                strokeWidth={3}
              />
            )}
            {(activeSeries === "all" || activeSeries === "recharge") && (
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="recharge"
                name="Recharge"
                unit=" m³"
                fill="url(#colorRecharge)"
                stroke="#22c55e"
                strokeWidth={3}
              />
            )}
            {(activeSeries === "all" || activeSeries === "netBalance") && (
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="netBalance"
                name="Net Balance"
                unit=" m³"
                fill="url(#colorNetBalance)"
                stroke="#d97706"
                strokeWidth={3}
              />
            )}
            {(activeSeries === "all" || activeSeries === "waterQuality") && (
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="waterQuality"
                name="Profit Margin"
                unit="%"
                stroke="#8b5cf6"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default HydrogeologicalAnalysisChart;
