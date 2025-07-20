const KeywordCloud = ({ keywords, maxFontSize = 24, minFontSize = 12 }) => {
  if (!keywords || keywords.length === 0) {
    return <p className="text-gray-500 dark:text-gray-400 text-sm">No keywords available.</p>
  }

  // Simple weighting: more frequent keywords get larger font size
  const keywordCounts = keywords.reduce((acc, keyword) => {
    acc[keyword] = (acc[keyword] || 0) + 1
    return acc
  }, {})

  const sortedKeywords = Object.entries(keywordCounts).sort(([, countA], [, countB]) => countB - countA)

  const maxCount = sortedKeywords[0][1]
  const minCount = sortedKeywords[sortedKeywords.length - 1][1]

  const getFontSize = (count) => {
    if (maxCount === minCount) return maxFontSize // All keywords have same count
    const ratio = (count - minCount) / (maxCount - minCount)
    return minFontSize + ratio * (maxFontSize - minFontSize)
  }

  return (
    <div className="flex flex-wrap gap-2 justify-center p-4">
      {sortedKeywords.map(([keyword, count], index) => (
        <span
          key={index}
          style={{ fontSize: `${getFontSize(count)}px` }}
          className="font-semibold text-gray-700 dark:text-gray-200 transition-all duration-300 hover:scale-105"
        >
          {keyword}
        </span>
      ))}
    </div>
  )
}

export default KeywordCloud;
