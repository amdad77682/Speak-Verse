"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Mic, Square, RefreshCw, ArrowRight, MessageCircle, Volume2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import type { LevelType } from "@/lib/game-data"
import { getAIFeedback, generateSpeech } from "@/lib/speech-services"

interface DebateGameProps {
  level: LevelType
  onComplete: (score: number) => void
}

export function DebateGame({ level, onComplete }: DebateGameProps) {
  const [status, setStatus] = useState<"idle" | "recording" | "processing" | "feedback" | "ai-response">("idle")
  const [currentTopicIndex, setCurrentTopicIndex] = useState(0)
  const [timeLeft, setTimeLeft] = useState(180)
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [aiResponseAudioUrl, setAiResponseAudioUrl] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<any>(null)
  const [completedDebates, setCompletedDebates] = useState(0)
  const [progress, setProgress] = useState(0)
  const [scores, setScores] = useState<number[]>([])
  const [aiResponse, setAiResponse] = useState("")
  const [debateRound, setDebateRound] = useState(1)
  const [previousExchanges, setPreviousExchanges] = useState<string[]>([])
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const { toast } = useToast()

  // Sample debate topics
  const topics = [
    {
      topic: "Should social media be regulated by governments?",
      aiPosition: "Social media should be regulated to protect users from harmful content and misinformation.",
      followUpQuestions: [
        "What about freedom of speech concerns?",
        "Who should decide what content is harmful?",
        "How would regulation affect innovation in the tech sector?",
      ],
    },
    {
      topic: "Is remote work better than working in an office?",
      aiPosition: "Remote work offers flexibility and better work-life balance for employees.",
      followUpQuestions: [
        "What about team collaboration and company culture?",
        "Does remote work increase or decrease productivity?",
        "How does remote work affect mental health?",
      ],
    },
    {
      topic: "Should higher education be free for all citizens?",
      aiPosition: "Higher education should be free to ensure equal access to opportunities.",
      followUpQuestions: [
        "How would this be funded?",
        "Would free education devalue degrees?",
        "What about trade schools and vocational training?",
      ],
    },
    {
      topic: "Is artificial intelligence a threat to humanity?",
      aiPosition: "AI poses significant risks that need to be carefully managed.",
      followUpQuestions: [
        "What about the benefits AI brings to society?",
        "How can we ensure AI development remains safe?",
        "Should there be global regulations for AI development?",
      ],
    },
    {
      topic: "Should public transportation be free in major cities?",
      aiPosition: "Free public transportation would reduce traffic and pollution in cities.",
      followUpQuestions: [
        "How would cities fund free public transportation?",
        "Would free transportation lead to overcrowding?",
        "What about the quality of service if it's free?",
      ],
    },
  ]

  const currentTopic = topics[currentTopicIndex]

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1)
      }, 1000)
    } else if (isTimerRunning && timeLeft === 0) {
      stopRecording()
    }

    return () => clearInterval(interval)
  }, [isTimerRunning, timeLeft])

  useEffect(() => {
    // Update progress when completedDebates changes
    setProgress((completedDebates / 1) * 100)

    // Check if level is complete (1 successful debate)
    if (completedDebates >= 1) {
      const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length
      onComplete(averageScore)
      toast({
        title: "Level Complete!",
        description: `You've successfully completed Level 5 with an average score of ${Math.round(averageScore)}%`,
      })
    }
  }, [completedDebates, scores, onComplete, toast])

  // Generate TTS audio for AI response
  useEffect(() => {
    async function loadAiResponseAudio() {
      try {
        if (aiResponse && status === "ai-response") {
          // Clear previous audio URL
          if (aiResponseAudioUrl) {
            URL.revokeObjectURL(aiResponseAudioUrl)
          }

          // Generate new audio
          const audioUrl = await generateSpeech(aiResponse, "alloy")
          setAiResponseAudioUrl(audioUrl)
        }
      } catch (error) {
        console.error("Failed to load AI response audio:", error)
      }
    }

    loadAiResponseAudio()

    // Cleanup function
    return () => {
      if (aiResponseAudioUrl) {
        URL.revokeObjectURL(aiResponseAudioUrl)
      }
    }
  }, [aiResponse, status])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" })
        setAudioBlob(audioBlob)
        const audioUrl = URL.createObjectURL(audioBlob)
        setAudioUrl(audioUrl)
        setStatus("processing")
        processAudio(audioBlob)
      }

      mediaRecorder.start()
      setStatus("recording")
      setIsTimerRunning(true)
      setTimeLeft(180)

      toast({
        title: "Recording started",
        description: "Present your argument clearly and persuasively",
      })
    } catch (error) {
      console.error("Error accessing microphone:", error)
      toast({
        variant: "destructive",
        title: "Microphone access denied",
        description: "Please allow microphone access to use this feature",
      })
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop()
      setIsTimerRunning(false)

      // Stop all audio tracks
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop())
    }
  }

  const processAudio = async (blob: Blob) => {
    try {
      // Use our AI feedback service
      const context = `Debate topic: ${currentTopic.topic}\nAI position: ${currentTopic.aiPosition}\nRound: ${debateRound}`
      const result = await getAIFeedback(blob, currentTopic.topic, context, previousExchanges)

      // Add score to scores array
      setScores((prev) => [...prev, result.overallScore])

      // Update feedback
      setFeedback(result)

      // If this is the first round, move to AI response
      if (debateRound === 1) {
        // Add user's transcribed text to previous exchanges
        setPreviousExchanges([...previousExchanges, `User: ${result.transcribedText}`])

        // Set AI response
        setAiResponse(result.followUpQuestion || currentTopic.followUpQuestions[0])

        // Add AI response to previous exchanges
        setPreviousExchanges((prev) => [
          ...previousExchanges,
          `AI: ${result.followUpQuestion || currentTopic.followUpQuestions[0]}`,
        ])

        setStatus("ai-response")
      } else {
        // Add user's transcribed text to previous exchanges
        setPreviousExchanges([...previousExchanges, `User: ${result.transcribedText}`])

        // If this is the second round and score is high enough, complete the debate
        if (result.overallScore >= 75) {
          setCompletedDebates((prev) => prev + 1)
        }

        setStatus("feedback")
      }
    } catch (error) {
      console.error("Error processing audio:", error)
      toast({
        variant: "destructive",
        title: "Processing error",
        description: "There was an error analyzing your speech",
      })
      setStatus("idle")
    }
  }

  const nextTopic = () => {
    // Move to next topic or loop back to beginning if we've gone through all topics
    setCurrentTopicIndex((prev) => (prev + 1) % topics.length)
    setStatus("idle")
    setAudioBlob(null)
    setAudioUrl(null)
    setFeedback(null)
    setAiResponse("")
    setDebateRound(1)
    setPreviousExchanges([])
  }

  const continueDebate = () => {
    setDebateRound(2)
    setStatus("idle")
  }

  const playAudio = () => {
    if (audioUrl) {
      const audio = new Audio(audioUrl)
      audio.play()
    }
  }

  const playAiResponse = () => {
    if (aiResponseAudioUrl) {
      const audio = new Audio(aiResponseAudioUrl)
      audio.play()
    } else if (aiResponse) {
      // Fallback to browser TTS
      const utterance = new SpeechSynthesisUtterance(aiResponse)
      utterance.rate = 0.9
      speechSynthesis.speak(utterance)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Level 5: The Debate Arena</CardTitle>
          {status === "recording" && (
            <Badge variant="outline" className="animate-pulse bg-red-500/10 text-red-500">
              Recording
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Progress: {completedDebates}/1 debates</span>
            <span className="text-sm font-medium">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Current Topic */}
        <div className="rounded-lg border bg-muted/50 p-6">
          <h3 className="mb-2 font-medium">Debate Topic:</h3>
          <p className="text-lg font-medium">{currentTopic.topic}</p>
          <div className="mt-4">
            <h4 className="text-sm font-medium">AI's Position:</h4>
            <p className="text-sm text-muted-foreground mt-1">{currentTopic.aiPosition}</p>
          </div>
          <div className="mt-4">
            <h4 className="text-sm font-medium">Your Task:</h4>
            <p className="text-sm text-muted-foreground mt-1">
              Present a clear, logical argument either supporting or opposing this topic. Be prepared to defend your
              position against follow-up questions.
            </p>
          </div>
          <div className="mt-4">
            <Badge>{debateRound === 1 ? "Round 1: Initial Argument" : "Round 2: Response to Challenge"}</Badge>
          </div>
        </div>

        {/* AI Response */}
        {status === "ai-response" && (
          <div className="rounded-lg border bg-primary/10 p-6">
            <div className="flex items-center gap-2 mb-3">
              <MessageCircle className="h-5 w-5 text-primary" />
              <h3 className="font-medium">AI Response:</h3>
              <Button variant="ghost" size="sm" onClick={playAiResponse} className="ml-auto">
                <Volume2 className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-muted-foreground">{aiResponse}</p>
          </div>
        )}

        {/* Timer Section */}
        {(status === "idle" || status === "recording") && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Time Remaining</span>
              <span className={cn("text-sm font-medium", timeLeft < 30 && "text-red-500")}>{formatTime(timeLeft)}</span>
            </div>
            <Progress value={(timeLeft / 180) * 100} className="h-2" />
          </div>
        )}

        {/* Recording Visualization */}
        {status === "recording" && (
          <div className="flex h-20 items-center justify-center">
            <div className="flex items-end space-x-1">
              {Array.from({ length: 20 }).map((_, i) => (
                <div
                  key={i}
                  className="w-2 bg-primary"
                  style={{
                    height: `${Math.random() * 100}%`,
                    animation: "pulse 0.5s infinite",
                    animationDelay: `${i * 0.05}s`,
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Processing State */}
        {status === "processing" && (
          <div className="flex flex-col items-center justify-center space-y-4 py-8">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-center text-muted-foreground">Analyzing your argument...</p>
          </div>
        )}

        {/* Feedback Section */}
        {status === "feedback" && feedback && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Your Recording</h3>
              <Button variant="outline" size="sm" onClick={playAudio}>
                <Volume2 className="mr-2 h-4 w-4" /> Play
              </Button>
            </div>

            <div className="space-y-4 rounded-lg border p-4">
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-sm font-medium">Overall Score</span>
                  <Badge>{feedback.overallScore}%</Badge>
                </div>
                <Progress value={feedback.overallScore} className="h-2" />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {Object.entries(feedback.metrics).map(([key, value]: [string, any]) => (
                  <div key={key}>
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-sm font-medium">{key}</span>
                      <Badge variant="outline">{value.score}%</Badge>
                    </div>
                    <Progress
                      value={value.score}
                      className={cn(
                        "h-2",
                        value.score >= 80 ? "bg-green-500" : value.score >= 60 ? "bg-yellow-500" : "bg-red-500",
                      )}
                    />
                  </div>
                ))}
              </div>

              {feedback.transcribedText && (
                <div className="mt-4">
                  <h4 className="mb-2 font-medium">Your Argument</h4>
                  <p className="text-sm text-muted-foreground italic">"{feedback.transcribedText}"</p>
                </div>
              )}

              <div>
                <h4 className="mb-2 font-medium">Feedback</h4>
                <p className="text-muted-foreground">{feedback.feedback}</p>
              </div>

              {feedback.improvements && feedback.improvements.length > 0 && (
                <div>
                  <h4 className="mb-2 font-medium">Areas for Improvement</h4>
                  <ul className="list-inside list-disc space-y-1 text-muted-foreground">
                    {feedback.improvements.map((item: string, index: number) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        {status === "idle" && (
          <Button onClick={startRecording} className="w-full">
            <Mic className="mr-2 h-4 w-4" /> Start Recording
          </Button>
        )}
        {status === "recording" && (
          <Button variant="destructive" onClick={stopRecording} className="w-full">
            <Square className="mr-2 h-4 w-4" /> Stop Recording
          </Button>
        )}
        {status === "ai-response" && (
          <Button onClick={continueDebate} className="w-full">
            Respond to Challenge <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
        {status === "feedback" && (
          <>
            <Button variant="outline" onClick={startRecording}>
              <RefreshCw className="mr-2 h-4 w-4" /> Try Again
            </Button>
            <Button onClick={nextTopic}>
              Next Topic <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  )
}

