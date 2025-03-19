"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Mic, Play, Square, RefreshCw, Volume2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { analyzeAudio } from "@/lib/speech-analysis"

export function GameInterface() {
  const [status, setStatus] = useState<"idle" | "recording" | "processing" | "feedback">("idle")
  const [prompt, setPrompt] = useState("Describe your favorite vacation destination and why you enjoy it.")
  const [timeLeft, setTimeLeft] = useState(20)
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<any>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const { toast } = useToast()

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

      toast({
        title: "Recording started",
        description: "Speak clearly into your microphone",
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
      // Simulate AI processing with a delay
      setTimeout(() => {
        const result = analyzeAudio()
        setFeedback(result)
        setStatus("feedback")
      }, 2000)
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

  const resetGame = () => {
    setStatus("idle")
    setTimeLeft(20)
    setAudioBlob(null)
    setAudioUrl(null)
    setFeedback(null)

    // Generate a new random prompt
    const prompts = [
      "Talk about a skill you would like to learn and why.",
      "Describe your ideal job or career path.",
      "Explain what you do to stay healthy.",
      "Discuss a recent movie or book you enjoyed.",
      "Describe your morning routine.",
    ]
    setPrompt(prompts[Math.floor(Math.random() * prompts.length)])
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
        <CardTitle className="flex items-center justify-between">
          <span>Level 3: The Quick Thinker</span>
          {status === "recording" && (
            <Badge variant="outline" className="animate-pulse bg-red-500/10 text-red-500">
              Recording
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Prompt Section */}
        <div className="rounded-lg border bg-muted/50 p-4">
          <h3 className="mb-2 font-medium">Your Prompt:</h3>
          <p className="text-lg">{prompt}</p>
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
            <p className="text-center text-muted-foreground">Analyzing your speech...</p>
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

              <div>
                <h4 className="mb-2 font-medium">Areas for Improvement</h4>
                <ul className="list-inside list-disc space-y-1 text-muted-foreground">
                  {feedback.improvements.map((item: string, index: number) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        {status === "idle" && (
          <Button onClick={startRecording} className="gap-1.5">
            <Mic className="h-4 w-4" /> Start Recording
          </Button>
        )}
        {status === "recording" && (
          <Button variant="destructive" onClick={stopRecording} className="gap-1.5">
            <Square className="h-4 w-4" /> Stop Recording
          </Button>
        )}
        {(status === "processing" || status === "feedback") && (
          <Button variant="outline" onClick={resetGame} className="gap-1.5">
            <RefreshCw className="h-4 w-4" /> Try Another Prompt
          </Button>
        )}
        {status === "feedback" && (
          <Button className="gap-1.5">
            <Play className="h-4 w-4" /> Next Challenge
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}

