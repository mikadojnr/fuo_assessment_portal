/**
 * Fisher-Yates shuffle algorithm for array randomization
 */
export const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

/**
 * Generate deterministic seed based on user and assessment IDs
 * This ensures same user sees same order in multiple sessions
 */
export const generateSeed = (userId, assessmentId) => {
  return `${userId}-${assessmentId}`;
};