"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Mic, Square, RefreshCw, ArrowRight, Volume2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import type { LevelType } from "@/lib/game-data"
import { analyzeSpeech } from "@/lib/speech-services"

interface QuickThinkerGameProps {
  level: LevelType
  onComplete: (score: number) => void
}

export function QuickThinkerGame({ level, onComplete }: QuickThinkerGameProps) {
  const [status, setStatus] = useState<"idle" | "recording" | "processing" | "feedback">("idle")
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0)
  const [timeLeft, setTimeLeft] = useState(20)
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<any>(null)
  const [completedPrompts, setCompletedPrompts] = useState(0)
  const [progress, setProgress] = useState(0)
  const [scores, setScores] = useState<number[]>([])
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const { toast } = useToast()

  // Sample prompts for the Quick Thinker level
  const prompts = [
    "Describe your favorite vacation destination and why you enjoy it.",
    "Talk about a skill you would like to learn and why.",
    "Describe your ideal job or career path.",
    "Explain what you do to stay healthy.",
    "Discuss a recent movie or book you enjoyed.",
    "Describe your morning routine.",
    "Talk about a challenge you've overcome.",
    "Explain how technology has changed your life.",
    "Describe your hometown and what makes it special.",
    "Talk about your favorite hobby and why you enjoy it.",
  ]

  const currentPrompt = prompts[currentPromptIndex]

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
    // Update progress when completedPrompts changes
    setProgress((completedPrompts / 5) * 100)

    // Check if level is complete (5 prompts with low hesitation)
    if (completedPrompts >= 5) {
      const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length
      onComplete(averageScore)
      toast({
        title: "Level Complete!",
        description: `You've successfully completed Level 3 with an average score of ${Math.round(averageScore)}%`,
      })
    }
  }, [completedPrompts, scores, onComplete, toast])

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
      setTimeLeft(20)

      toast({
        title: "Recording started",
        description: "Speak clearly and fluently for 20 seconds",
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
      // Use our speech analysis service
      const result = await analyzeSpeech(blob, currentPrompt, "fluency")

      // Add score to scores array
      setScores((prev) => [...prev, result.metrics.fluency.score])

      // Increment completed prompts counter if fluency score is high enough
      if (result.metrics.fluency.score >= 70) {
        setCompletedPrompts((prev) => prev + 1)
      }

      setFeedback(result)
      setStatus("feedback")
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

  const nextPrompt = () => {
    // Move to next prompt or loop back to beginning if we've gone through all prompts
    setCurrentPromptIndex((prev) => (prev + 1) % prompts.length)
    setStatus("idle")
    setAudioBlob(null)
    setAudioUrl(null)
    setFeedback(null)
  }

  const playAudio = () => {
    if (audioUrl) {
      const audio = new Audio(audioUrl)
      audio.play()
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Level 3: The Quick Thinker</CardTitle>
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
            <span className="text-sm font-medium">Progress: {completedPrompts}/5 prompts</span>
            <span className="text-sm font-medium">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Current Prompt */}
        <div className="rounded-lg border bg-muted/50 p-6">
          <h3 className="mb-2 font-medium">Your Prompt:</h3>
          <p className="text-lg">{currentPrompt}</p>
        </div>

        {/* Timer Section */}
        {(status === "idle" || status === "recording") && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Time Remaining</span>
              <span className={cn("text-sm font-medium", timeLeft < 5 && "text-red-500")}>{timeLeft} seconds</span>
            </div>
            <Progress value={(timeLeft / 20) * 100} className="h-2" />
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
            <p className="text-center text-muted-foreground">Analyzing your fluency...</p>
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

              {feedback.transcribedText && (
                <div className="mt-4">
                  <h4 className="mb-2 font-medium">What We Heard</h4>
                  <p className="text-sm text-muted-foreground italic">"{feedback.transcribedText}"</p>
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
        {status === "feedback" && (
          <>
            <Button variant="outline" onClick={startRecording}>
              <RefreshCw className="mr-2 h-4 w-4" /> Try Again
            </Button>
            <Button onClick={nextPrompt}>
              Next Prompt <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  )
}

