"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Mic, Square, RefreshCw, Volume2, Check, X, ArrowRight } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import type { LevelType } from "@/lib/game-data"
// Update the imports to use the OpenAI-only speech services
import { analyzeSpeech } from "@/lib/speech-services"

interface EchoGameProps {
  level: LevelType
  onComplete: (score: number) => void
}

export function EchoGame({ level, onComplete }: EchoGameProps) {
  const [status, setStatus] = useState<"idle" | "listening" | "recording" | "processing" | "feedback">("idle")
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<any>(null)
  const [attempts, setAttempts] = useState(0)
  const [correctWords, setCorrectWords] = useState(0)
  const [progress, setProgress] = useState(0)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const { toast } = useToast()
  const [scores, setScores] = useState<number[]>([])
  const [completedWords, setCompletedWords] = useState(0)

  // Sample words for the Echo Chamber level
  const words = [
    { word: "Pronunciation", difficulty: "medium" },
    { word: "Vocabulary", difficulty: "medium" },
    { word: "Conversation", difficulty: "medium" },
    { word: "Opportunity", difficulty: "hard" },
    { word: "Development", difficulty: "medium" },
    { word: "Communication", difficulty: "hard" },
    { word: "Understanding", difficulty: "medium" },
    { word: "International", difficulty: "medium" },
    { word: "Responsibility", difficulty: "hard" },
    { word: "Congratulations", difficulty: "hard" },
  ]

  const currentWord = words[currentWordIndex]

  useEffect(() => {
    // Update progress when correctWords changes
    setProgress((correctWords / 5) * 100)

    // Check if level is complete (5 correct words)
    if (correctWords >= 5) {
      const finalScore = Math.round((correctWords / attempts) * 100)
      onComplete(finalScore)
      toast({
        title: "Level Complete!",
        description: `You've successfully completed Level 1 with a score of ${finalScore}%`,
      })
    }
  }, [correctWords, attempts, onComplete, toast])

  const playWord = () => {
    setStatus("listening")

    // In a real implementation, this would use the Web Speech API or a TTS service
    // For demo purposes, we'll simulate playing the word
    const utterance = new SpeechSynthesisUtterance(currentWord.word)
    utterance.rate = 0.8 // Slightly slower for clarity
    utterance.onend = () => {
      // After the word is spoken, wait a moment before allowing recording
      setTimeout(() => {
        setStatus("idle")
      }, 500)
    }

    speechSynthesis.speak(utterance)
  }

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

      // Automatically stop recording after 3 seconds
      setTimeout(() => {
        if (mediaRecorder.state !== "inactive") {
          stopRecording()
        }
      }, 3000)

      toast({
        title: "Recording started",
        description: "Repeat the word clearly",
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

      // Stop all audio tracks
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop())
    }
  }

  // Replace the processAudio function with this OpenAI-only version
  const processAudio = async (blob: Blob) => {
    try {
      // Use our OpenAI speech analysis service
      const result = await analyzeSpeech(blob, currentWord.word, "pronunciation")

      // Add score to scores array
      setScores((prev) => [...prev, result.overallScore])

      // Increment completed words counter
      setCompletedWords((prev) => prev + 1)

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

  const nextWord = () => {
    // Move to next word or loop back to beginning if we've gone through all words
    setCurrentWordIndex((prev) => (prev + 1) % words.length)
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
          <CardTitle>Level 1: The Echo Chamber</CardTitle>
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
            <span className="text-sm font-medium">Progress: {correctWords}/5 words</span>
            <span className="text-sm font-medium">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Current Word */}
        <div className="rounded-lg border bg-muted/50 p-6 text-center">
          <h3 className="mb-2 font-medium">Repeat this word:</h3>
          <p className="text-3xl font-bold">{currentWord.word}</p>
          <div className="mt-2 flex justify-center">
            <Badge variant="outline">
              {currentWord.difficulty === "easy" ? "Easy" : currentWord.difficulty === "medium" ? "Medium" : "Hard"}
            </Badge>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={playWord}
            disabled={status === "listening" || status === "recording" || status === "processing"}
          >
            <Volume2 className="mr-2 h-4 w-4" /> Listen
          </Button>
        </div>

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
            <p className="text-center text-muted-foreground">Analyzing your pronunciation...</p>
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

            <div className="rounded-lg border p-4">
              <div className="flex items-center justify-center mb-4">
                {feedback.metrics.pronunciation.score >= 70 ? (
                  <div className="flex items-center justify-center h-16 w-16 rounded-full bg-green-100 text-green-600">
                    <Check className="h-8 w-8" />
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-16 w-16 rounded-full bg-red-100 text-red-600">
                    <X className="h-8 w-8" />
                  </div>
                )}
              </div>

              <div className="text-center mb-4">
                <h4 className="text-lg font-medium">
                  {feedback.metrics.pronunciation.score >= 70 ? "Great job!" : "Try again!"}
                </h4>
                <p className="text-muted-foreground">
                  {feedback.metrics.pronunciation.score >= 70
                    ? "Your pronunciation was clear and accurate."
                    : "Your pronunciation needs some improvement."}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Pronunciation Score</span>
                  <Badge variant={feedback.metrics.pronunciation.score >= 70 ? "default" : "outline"}>
                    {feedback.metrics.pronunciation.score}%
                  </Badge>
                </div>
                <Progress
                  value={feedback.metrics.pronunciation.score}
                  className={cn("h-2", feedback.metrics.pronunciation.score >= 70 ? "bg-green-500" : "bg-red-500")}
                />
              </div>

              <div className="mt-4">
                <h4 className="mb-2 font-medium">Feedback</h4>
                <p className="text-muted-foreground">{feedback.feedback}</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        {status === "idle" && (
          <>
            <Button variant="outline" onClick={playWord}>
              <Volume2 className="mr-2 h-4 w-4" /> Listen
            </Button>
            <Button onClick={startRecording} disabled={status === "listening"}>
              <Mic className="mr-2 h-4 w-4" /> Record
            </Button>
          </>
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
            <Button onClick={nextWord}>
              Next Word <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  )
}

