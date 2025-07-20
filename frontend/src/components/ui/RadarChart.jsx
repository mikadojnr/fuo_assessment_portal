import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from "recharts"

const CustomRadarChart = ({
  data,
  dataKey,
  valueKey,
  domain = [0, 100],
  strokeColor = "#00BFA5",
  fillColor = "rgba(0, 191, 165, 0.6)",
}) => {
  if (!data || data.length === 0) {
    return <p className="text-gray-500 dark:text-gray-400 text-sm text-center">No data for radar chart.</p>
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
        <PolarGrid stroke="#e0e0e0" className="dark:stroke-gray-700" />
        <PolarAngleAxis dataKey={dataKey} tick={{ fill: "var(--text-color-primary)" }} />
        <PolarRadiusAxis
          domain={domain}
          tickFormatter={(value) => `${value}%`}
          tick={{ fill: "var(--text-color-secondary)" }}
        />
        <Radar name="Your Performance" dataKey={valueKey} stroke={strokeColor} fill={fillColor} fillOpacity={0.6} />
        <Tooltip />
      </RadarChart>
    </ResponsiveContainer>
  )
}

export default CustomRadarChart
