import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const CustomHistogram = ({
  data,
  dataKey,
  highlightIndex = null,
  barColor = "#2A5C82",
  highlightColor = "#00BFA5",
}) => {
  if (!data || data.length === 0) {
    return <p className="text-gray-500 dark:text-gray-400 text-sm text-center">No data for histogram.</p>
  }

  const processedData = data.map((value, index) => ({
    name: `Bin ${index + 1}`, // You might want to pass actual bin labels
    value: value,
    fill: index === highlightIndex ? highlightColor : barColor,
  }))

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={processedData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" className="dark:stroke-gray-700" />
        <XAxis dataKey="name" tick={{ fill: "var(--text-color-primary)" }} />
        <YAxis tick={{ fill: "var(--text-color-secondary)" }} />
        <Tooltip />
        <Bar dataKey="value" />
      </BarChart>
    </ResponsiveContainer>
  )
}

export default CustomHistogram
