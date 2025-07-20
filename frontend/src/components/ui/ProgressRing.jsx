const ProgressRing = ({ radius, stroke, progress, color = "#00BFA5", backgroundColor = "#e0e0e0" }) => {
  const normalizedRadius = radius - stroke * 2
  const circumference = normalizedRadius * 2 * Math.PI
  const strokeDashoffset = circumference - (progress / 100) * circumference

  return (
    <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
      <circle
        stroke={backgroundColor}
        fill="transparent"
        strokeWidth={stroke}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
      />
      <circle
        stroke={color}
        fill="transparent"
        strokeDasharray={circumference + " " + circumference}
        style={{ strokeDashoffset }}
        strokeWidth={stroke}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
        className="transition-all duration-500 ease-in-out"
      />
    </svg>
  )
}

export default ProgressRing;
