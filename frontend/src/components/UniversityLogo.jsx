const UniversityLogo = ({ className }) => {
  return (
    <div className={`${className || ""}`}>
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="45" fill="url(#gradient)" />
        <path d="M50 20L80 40V42H20V40L50 20Z" fill="white" />
        <rect x="25" y="45" width="50" height="30" fill="white" />
        <rect x="45" y="45" width="10" height="30" fill="url(#gradient)" />
        <rect x="30" y="50" width="5" height="10" fill="url(#gradient)" />
        <rect x="65" y="50" width="5" height="10" fill="url(#gradient)" />
        <rect x="30" y="65" width="5" height="5" fill="url(#gradient)" />
        <rect x="65" y="65" width="5" height="5" fill="url(#gradient)" />
        <defs>
          <linearGradient id="gradient" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#2A5C82" />
            <stop offset="1" stopColor="#00BFA5" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  )
}

export default UniversityLogo
