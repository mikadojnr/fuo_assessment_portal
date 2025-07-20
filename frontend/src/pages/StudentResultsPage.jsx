"use client"

import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { fetchSubmissionDetails } from "../services/assessmentService"
import { toast } from "react-toastify"
import {
  FiArrowLeft,
  FiDownload,
  FiRefreshCw,
  FiShare2,
  FiCheckCircle,
  FiAlertTriangle,
  FiBookOpen,
  FiTarget,
  FiAward,
  FiSmile,
  FiFrown,
  FiVolume2, // For voice note playback placeholder
  FiPaperclip, // For attachments placeholder
  FiRepeat, // For retake assessment
} from "react-icons/fi"
import ProgressRing from "../components/ui/ProgressRing"
import KeywordCloud from "../components/ui/KeywordCloud"
import CustomRadarChart from "../components/ui/RadarChart"
import CustomHistogram from "../components/ui/Histogram"
import Confetti from "../components/ui/Confetti"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs" // Assuming shadcn tabs are available

const StudentResultsPage = () => {
  const { submissionId } = useParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [submissionDetails, setSubmissionDetails] = useState(null)
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    document.title = "Assessment Results"
    const loadResults = async () => {
      if (!submissionId) {
        setError("No submission ID provided.")
        setLoading(false)
        return
      }
      try {
        setLoading(true)
        const details = await fetchSubmissionDetails(submissionId)
        setSubmissionDetails(details)

        // Trigger confetti if score > 85%
        if (details?.submission?.grade && details.submission?.totalMarks) {
          const percentage = (details.submission.grade / details.submission.totalMarks) * 100
          if (percentage > 85) {
            setShowConfetti(true)
            setTimeout(() => setShowConfetti(false), 5000) // Hide confetti after 5 seconds
          }
        }
      } catch (err) {
        console.error("Error loading results:", err)
        setError("Failed to load assessment results. Please try again.")
        toast.error("Failed to load assessment results.")
      } finally {
        setLoading(false)
      }
    }
    loadResults()
  }, [submissionId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-700 dark:text-gray-300">Loading results...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center flex-col">
        <p className="text-red-500 text-lg">{error}</p>
        <Link to="/student/submissions" className="mt-4 text-[#2A5C82] dark:text-[#00BFA5] hover:underline">
          Back to All Results
        </Link>
      </div>
    )
  }

  if (!submissionDetails) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center flex-col">
        <p className="text-gray-700 dark:text-gray-300">No submission details found.</p>
        <Link to="/student/submissions" className="mt-4 text-[#2A5C82] dark:text-[#00BFA5] hover:underline">
          Back to All Results
        </Link>
      </div>
    )
  }

  const {
    submission,
    studentAnswers,
    plagiarismReport,
    assessmentDetails,
    nlpInsights,
    assessmentAnalytics,
    topicMasteryData,
  } = submissionDetails
  const overallScore = submission.grade || 0 // Use submission.grade
  const totalMarks = submission.totalMarks || 1 // Use submission.totalMarks
  const scorePercentage = (overallScore / totalMarks) * 100
  const classAverage = assessmentAnalytics?.classAverage || 0
  const passed = scorePercentage >= 50 // Assuming 50% is passing
  const plagiarismClean = (plagiarismReport?.similarityScore || 0) < 20 // Assuming <20% is clean

  // Find student's position in score distribution
  const scoreDistributionLabels = assessmentAnalytics?.scoreDistribution?.labels || []
  const scoreDistributionData = assessmentAnalytics?.scoreDistribution?.data || []
  let studentScoreBinIndex = -1
  if (scoreDistributionLabels.length > 0) {
    const binRanges = scoreDistributionLabels.map((label) => {
      const parts = label.split("-").map((s) => Number.parseInt(s.replace("%", "")))
      return [parts[0], parts[1]]
    })
    for (let i = 0; i < binRanges.length; i++) {
      if (scorePercentage >= binRanges[i][0] && scorePercentage <= binRanges[i][1]) {
        studentScoreBinIndex = i
        break
      }
    }
  }

  // Function to apply color-coding to essay text based on NLP insights
  const colorCodeEssay = (text, nlpAnalysis) => {
    if (!text || !nlpAnalysis) return text

    let highlightedText = text
    const matchedKeywords = nlpAnalysis.matchedKeywords || []
    const missingKeywords = nlpAnalysis.missingKeywords || []
    const allKeywords = [...matchedKeywords, ...missingKeywords]

    // Sort keywords by length descending to avoid partial matches (e.g., "data" before "database")
    allKeywords.sort((a, b) => b.length - a.length)

    allKeywords.forEach((keyword) => {
      const regex = new RegExp(`\\b(${keyword})\\b`, "gi") // Whole word match, case-insensitive
      if (matchedKeywords.includes(keyword)) {
        highlightedText = highlightedText.replace(
          regex,
          `<span class="text-green-600 dark:text-green-400 font-semibold">$1</span>`,
        )
      } else if (missingKeywords.includes(keyword)) {
        // This part is tricky for "missing" keywords as they won't be in the text.
        // For demonstration, let's just highlight if they were *expected* but not found.
        // A more advanced NLP would identify concepts, not just exact missing keywords.
        // For now, we'll focus on highlighting matched/partial.
      }
    })

    // Simple mock for partial matches (e.g., if a keyword is "database" but student wrote "data")
    // This would require more sophisticated NLP (e.g., stemming, lemmatization, semantic similarity)
    // For now, we'll just use a generic yellow for some words if no exact match.
    // This is a placeholder for actual partial match logic.
    const partialMatchWords = ["concept", "property", "system"] // Example words to mock partial
    partialMatchWords.forEach((word) => {
      const regex = new RegExp(`\\b(${word})\\b`, "gi")
      if (
        !matchedKeywords.some((k) => k.toLowerCase().includes(word.toLowerCase())) &&
        !missingKeywords.some((k) => k.toLowerCase().includes(word.toLowerCase()))
      ) {
        highlightedText = highlightedText.replace(regex, `<span class="text-yellow-600 dark:text-yellow-400">$1</span>`)
      }
    })

    return highlightedText
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 relative">
      
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Link
              to="/student/submissions" // Link back to the list page
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-[#2A5C82] to-[#00BFA5] hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              <FiArrowLeft className="mr-2" />
              Back to All Results
            </Link>
          </div>
            
        </div>
      </header>
      
      {showConfetti && <Confetti show={showConfetti} />}

      <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Results Summary Header */}
        <Card className="mb-8 relative overflow-hidden bg-gradient-to-r from-[#2A5C82] to-[#00BFA5] text-white shadow-lg">
          <CardHeader className="flex flex-col md:flex-row justify-between items-start md:items-center p-6">
            <div>
              <CardDescription className="text-white text-opacity-80 text-sm">
                {assessmentDetails.courseCode || "N/A"} - {new Date(submission.submittedAt).toLocaleDateString()}
              </CardDescription>
              <CardTitle className="text-3xl md:text-4xl font-bold mt-1">
                {assessmentDetails.title || "Assessment Results"}
              </CardTitle>
            </div>
            <div className="flex items-center mt-4 md:mt-0">
              <div className="relative w-28 h-28 mr-6">
                <ProgressRing
                  radius={50}
                  stroke={10}
                  progress={scorePercentage}
                  color={passed ? "#6BCB77" : "#FF6B6B"}
                  backgroundColor="rgba(255,255,255,0.3)"
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold">{Math.round(scorePercentage)}%</span>
                  <span className="text-xs text-white text-opacity-80">Score</span>
                </div>
              </div>
              <div className="flex flex-col items-start">
                <span className="text-base text-white text-opacity-90">Class Avg: {Math.round(classAverage)}%</span>
                <div
                  className={`px-3 py-1 rounded-full text-sm font-semibold mt-2 ${
                    passed ? "bg-[#6BCB77] text-white" : "bg-[#FF6B6B] text-white"
                  }`}
                >
                  {passed ? "Passed" : "Failed"}
                </div>
                <div
                  className={`px-3 py-1 rounded-full text-sm font-semibold mt-2 ${
                    plagiarismClean ? "bg-[#6BCB77] text-white" : "bg-[#FFD93D] text-gray-900"
                  }`}
                >
                  Plagiarism Check: {plagiarismClean ? "✅ Clean" : "⚠️ High Similarity"}
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="mt-8 mb-8">
          
        </div>

        {/* Performance Breakdown Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
          {/* Left: Feedback & NLP Insights */}
          <Card className="lg:col-span-1 shadow-md">
            <CardHeader>
              <CardTitle>Feedback & NLP Insights</CardTitle>
              <CardDescription>Automated analysis and lecturer comments.</CardDescription>
            </CardHeader>
            <CardContent>
              <h3 className="font-semibold text-lg mb-3 text-gray-800 dark:text-white">Automated Feedback</h3>
              {nlpInsights && (
                <div className="space-y-2 mb-4 text-sm text-gray-700 dark:text-gray-300">
                  {nlpInsights.overallMatchPercentage > 70 && (
                    <p className="flex items-center text-green-600 dark:text-green-400">
                      <FiCheckCircle className="mr-2" /> Strong grasp of concepts (
                      {Math.round(nlpInsights.overallMatchPercentage)}% match)
                    </p>
                  )}
                  {nlpInsights.missingKeywords && nlpInsights.missingKeywords.length > 0 && (
                    <p className="flex items-center text-orange-600 dark:text-orange-400">
                      <FiAlertTriangle className="mr-2" /> Consider expanding on:{" "}
                      <span className="font-medium">{nlpInsights.missingKeywords.join(", ")}</span>
                    </p>
                  )}
                  {nlpInsights.sentiment === "negative" && (
                    <p className="flex items-center text-red-600 dark:text-red-400">
                      <FiFrown className="mr-2" /> Your answer might benefit from more positive framing.
                    </p>
                  )}
                  <p>Readability Score: {Math.round(nlpInsights.readabilityScore)}</p>
                </div>
              )}
              <h3 className="font-semibold text-lg mb-3 text-gray-800 dark:text-white">Keywords</h3>
              <KeywordCloud keywords={nlpInsights?.matchedKeywords || []} />
              <h3 className="font-semibold text-lg mb-3 mt-6 text-gray-800 dark:text-white">Lecturer Comments</h3>
              <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-md text-sm text-gray-700 dark:text-gray-300">
                {submission.lecturerComments || "No specific comments from lecturer yet."}
                {/* Placeholder for voice note playback */}
                {submission.voice_note_url && (
                  <Button variant="ghost" size="sm" className="mt-2 text-[#4D96FF] dark:text-blue-300">
                    <FiVolume2 className="mr-2" /> Play Voice Note
                  </Button>
                )}
                {/* Placeholder for attachments */}
                {submission.attachments && submission.attachments.length > 0 && (
                  <div className="mt-2">
                    {submission.attachments.map((attachment, idx) => (
                      <Button key={idx} variant="ghost" size="sm" className="text-[#4D96FF] dark:text-blue-300">
                        <FiPaperclip className="mr-2" /> {attachment.name}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
              <div className="mt-6 space-y-3">
                <Button
                  variant="outline"
                  className="w-full text-[#2A5C82] dark:text-[#00BFA5] border-[#2A5C82] dark:border-[#00BFA5] bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <FiBookOpen className="mr-2" /> Review Resources
                </Button>
                <Button
                  variant="outline"
                  className="w-full text-[#2A5C82] dark:text-[#00BFA5] border-[#2A5C82] dark:border-[#00BFA5] bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <FiTarget className="mr-2" /> Practice Similar Questions
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Center: Answer Comparison */}
          <Card className="lg:col-span-1 shadow-md">
            <CardHeader>
              <CardTitle>Answer Comparison</CardTitle>
              <CardDescription>Compare your answers with the model solutions.</CardDescription>
            </CardHeader>
            <CardContent>
              {studentAnswers.length > 0 ? (
                studentAnswers.map((qa, index) => (
                  <div key={index} className="mb-6 border-b pb-4 last:border-b-0 last:pb-0">
                    <h3 className="font-semibold text-lg mb-2 text-gray-800 dark:text-white">
                      Q{index + 1}: {qa.questionText} ({qa.maxMark} Marks)
                    </h3>
                    {qa.type === "mcq" && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Your Answer:</h4>
                          <p
                            className={`bg-gray-100 dark:bg-gray-700 p-3 rounded-md text-sm ${qa.isCorrect ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300"}`}
                          >
                            {qa.studentAnswer?.selectedOptionText || "No answer provided"}
                          </p>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Correct Answer:</h4>
                          <p className="bg-green-100 dark:bg-green-900/20 p-3 rounded-md text-sm text-green-800 dark:text-green-300">
                            {qa.modelAnswer || "N/A"}
                          </p>
                        </div>
                      </div>
                    )}
                    {qa.type === "essay" && (
                      <Tabs defaultValue="yourAnswer" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="yourAnswer">Your Answer</TabsTrigger>
                          <TabsTrigger value="modelAnswer">Model Answer</TabsTrigger>
                        </TabsList>
                        <TabsContent value="yourAnswer">
                          <Card>
                            <CardContent className="p-3">
                              <div
                                className="bg-gray-100 dark:bg-gray-700 p-3 rounded-md text-sm prose dark:prose-invert max-h-60 overflow-y-auto"
                                dangerouslySetInnerHTML={{
                                  __html:
                                    colorCodeEssay(qa.studentAnswer?.content, qa.nlpAnalysis) || "No answer provided",
                                }}
                              />
                            </CardContent>
                          </Card>
                        </TabsContent>
                        <TabsContent value="modelAnswer">
                          <Card>
                            <CardContent className="p-3">
                              <div
                                className="bg-green-100 dark:bg-green-900/20 p-3 rounded-md text-sm prose dark:prose-invert max-h-60 overflow-y-auto text-green-800 dark:text-green-300"
                                dangerouslySetInnerHTML={{ __html: qa.modelAnswer || "N/A" }}
                              />
                              {qa.modelAnswerWeight && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                  Weight: {qa.modelAnswerWeight} of score
                                </p>
                              )}
                            </CardContent>
                          </Card>
                        </TabsContent>
                      </Tabs>
                    )}
                    {qa.type === "file" && (
                      <div>
                        <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Your Submission:</h4>
                        <p className="bg-gray-100 dark:bg-gray-700 p-3 rounded-md text-sm">
                          {qa.studentAnswer?.fileName || "No file submitted"}
                          {qa.studentAnswer?.fileSize && ` (${(qa.studentAnswer.fileSize / 1024).toFixed(2)} KB)`}
                        </p>
                        {qa.studentAnswer?.fileUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-2 text-[#4D96FF] dark:text-blue-300 bg-transparent"
                          >
                            <FiDownload className="mr-2" /> View Original Submission
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-sm">No answers to display.</p>
              )}
            </CardContent>
          </Card>

          {/* Right: Class Analytics */}
          <Card className="lg:col-span-1 shadow-md">
            <CardHeader>
              <CardTitle>Class Analytics</CardTitle>
              <CardDescription>How you compare to your peers.</CardDescription>
            </CardHeader>
            <CardContent>
              <h3 className="font-semibold text-lg mb-3 text-gray-800 dark:text-white">Score Distribution</h3>
              <CustomHistogram
                data={scoreDistributionData}
                labels={scoreDistributionLabels}
                highlightIndex={studentScoreBinIndex}
                barColor="#2A5C82"
                highlightColor="#00BFA5"
              />
              <div className="text-center mt-4 text-sm text-gray-700 dark:text-gray-300">
                {assessmentAnalytics?.percentileBadge && (
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 rounded-full font-medium">
                    {assessmentAnalytics.percentileBadge}
                  </span>
                )}
                <p className="mt-2">
                  You scored {Math.round(scorePercentage)}%, class average was {Math.round(classAverage)}%.
                </p>
                {scorePercentage > classAverage ? (
                  <p className="text-green-600 dark:text-green-400 flex items-center justify-center mt-1">
                    <FiSmile className="mr-1" /> Great job, you're above average!
                  </p>
                ) : (
                  <p className="text-orange-600 dark:text-orange-400 flex items-center justify-center mt-1">
                    <FiFrown className="mr-1" /> Keep practicing, you're almost there!
                  </p>
                )}
              </div>

              <h3 className="font-semibold text-lg mb-3 mt-6 text-gray-800 dark:text-white">Topic Mastery</h3>
              <CustomRadarChart
                data={topicMasteryData}
                dataKey="topic"
                valueKey="score"
                domain={[0, 100]}
                strokeColor="#00BFA5"
                fillColor="rgba(0, 191, 165, 0.6)"
              />

              <h3 className="font-semibold text-lg mb-3 mt-6 text-gray-800 dark:text-white">Effort Recognition</h3>
              <div className="flex flex-wrap gap-2 justify-center">
                {scorePercentage > 80 && (
                  <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300 rounded-full text-sm flex items-center">
                    <FiAward className="mr-1" /> Top Performer
                  </span>
                )}
                {plagiarismClean && (
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 rounded-full text-sm flex items-center">
                    <FiCheckCircle className="mr-1" /> Detail-Oriented
                  </span>
                )}
                {scorePercentage > classAverage + 10 && ( // Example for "Most Improved"
                  <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300 rounded-full text-sm flex items-center">
                    <FiAward className="mr-1" /> Exceeded Expectations
                  </span>
                )}
              </div>
              {/* Placeholder for XP progress bar */}
              <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
                <p>XP Progress: 750/1000 to next Knowledge Badge</p>
                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mt-2">
                  <div className="bg-[#00BFA5] h-2.5 rounded-full" style={{ width: "75%" }}></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Bar */}
        <div className="mt-8 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md flex flex-wrap justify-center gap-4">
          <Button className="bg-[#2A5C82] hover:bg-[#1e4460] text-white">
            <FiDownload className="mr-2" /> Download Report
          </Button>
          <Button
            variant="outline"
            className="text-[#2A5C82] dark:text-[#00BFA5] border-[#2A5C82] dark:border-[#00BFA5] bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <FiRefreshCw className="mr-2" /> Request Regrade
          </Button>
          {/* Only show retake if allowed by assessment settings (mocked) */}
          {assessmentDetails.allow_retake && (
            <Button
              variant="outline"
              className="text-[#2A5C82] dark:text-[#00BFA5] border-[#2A5C82] dark:border-[#00BFA5] bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <FiRepeat className="mr-2" /> Retake Assessment
            </Button>
          )}
          <Button
            variant="outline"
            className="text-[#2A5C82] dark:text-[#00BFA5] border-[#2A5C82] dark:border-[#00BFA5] bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <FiShare2 className="mr-2" /> Share Achievement
          </Button>
        </div>

        {/* Stress Reduction / Advisor Options */}
        <div className="mt-8 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md flex flex-wrap justify-center gap-4 text-center">
          <p className="text-gray-700 dark:text-gray-300 w-full mb-3">Feeling overwhelmed or need guidance?</p>
          <Button
            variant="outline"
            className="text-[#4D96FF] dark:text-blue-300 border-[#4D96FF] dark:border-blue-300 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Breathing Exercise
          </Button>
          <Button
            variant="outline"
            className="text-[#4D96FF] dark:text-blue-300 border-[#4D96FF] dark:border-blue-300 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Talk to Advisor
          </Button>
        </div>

        <div className="mt-8 text-center">
          <Link
            to="/student/submissions" // Link back to the list page
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            <FiArrowLeft className="mr-2" />
            Back to All Results
          </Link>
        </div>
      </main>
    </div>
  )
}

export default StudentResultsPage
