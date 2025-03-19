"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Mic, Square, RefreshCw, ArrowRight, BookOpen, Volume2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import type { LevelType } from "@/lib/game-data"
import { evaluateStory } from "@/lib/speech-services"

interface StorytellerGameProps {
  level: LevelType
  onComplete: (score: number) => void
}

export function StorytellerGame({ level, onComplete }: StorytellerGameProps) {
  const [status, setStatus] = useState<"idle" | "recording" | "processing" | "feedback">("idle")
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<any>(null)
  const [completedStories, setCompletedStories] = useState(0)
  const [progress, setProgress] = useState(0)
  const [scores, setScores] = useState<number[]>([])
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const { toast } = useToast()

  // Sample story prompts
  const storyPrompts = [
    {
      title: "The Mysterious Package",
      start:
        "Sarah was about to leave for work when she noticed a strange package on her doorstep. There was no return address or delivery information. Cautiously, she picked it up and...",
      hints: [
        "What was in the package?",
        "How did Sarah react?",
        "Where did the package come from?",
        "How does the story end?",
      ],
    },
    {
      title: "The Job Interview",
      start:
        "Alex had prepared for weeks for this job interview. It was his dream company, and he really wanted to make a good impression. As he walked into the office building...",
      hints: [
        "What challenges did Alex face?",
        "Who did he meet?",
        "What unexpected thing happened?",
        "Did he get the job?",
      ],
    },
    {
      title: "The Adventure in the Forest",
      start:
        "Maya and her friends decided to go camping in the forest for the weekend. They set up their tents and enjoyed a barbecue dinner. But in the middle of the night, they heard a strange noise...",
      hints: [
        "What was the noise?",
        "How did they react?",
        "What adventure did they have?",
        "How did they resolve the situation?",
      ],
    },
  ]

  const currentStory = storyPrompts[currentStoryIndex]

  useEffect(() => {
    // Update progress when completedStories changes
    setProgress((completedStories / 3) * 100)

    // Check if level is complete (3 stories)
    if (completedStories >= 3) {
      const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length
      onComplete(averageScore)
      toast({
        title: "Level Complete!",
        description: `You've successfully completed Level 6 with an average score of ${Math.round(averageScore)}%`,
      })
    }
  }, [completedStories, scores, onComplete, toast])

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

      // Automatically stop recording after 3 minutes
      setTimeout(() => {
        if (mediaRecorder.state !== "inactive") {
          stopRecording()
        }
      }, 180000)

      toast({
        title: "Recording started",
        description: "Continue the story for 2-3 minutes",
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

  const processAudio = async (blob: Blob) => {
    try {
      // Use our story evaluation service
      const criteria = [
        "Coherence and structure",
        "Creativity and originality",
        "Use of descriptive language",
        "Character development",
        "Narrative flow",
      ]

      const result = await evaluateStory(blob, currentStory.start, criteria)

      // Add score to scores array
      setScores((prev) => [...prev, result.overallScore])

      // Increment completed stories counter
      const newCompletedStories = completedStories + 1
      setCompletedStories(newCompletedStories)
      setProgress((newCompletedStories / 3) * 100)

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

  const nextStory = () => {
    // Move to next story or loop back to beginning if we've gone through all stories
    setCurrentStoryIndex((prev) => (prev + 1) % storyPrompts.length)
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
          <CardTitle>Level 6: The Storyteller's Quest</CardTitle>
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
            <span className="text-sm font-medium">Progress: {completedStories}/3 stories</span>
            <span className="text-sm font-medium">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Current Story */}
        <div className="rounded-lg border bg-muted/50 p-6">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="h-5 w-5 text-primary" />
            <h3 className="font-medium">{currentStory.title}</h3>
          </div>

          <div className="mb-4">
            <p className="text-lg">{currentStory.start}</p>
          </div>

          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2">Story Hints:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              {currentStory.hints.map((hint, index) => (
                <li key={index}>{hint}</li>
              ))}
            </ul>
          </div>

          <div className="mt-4">
            <h4 className="text-sm font-medium">Your Task:</h4>
            <p className="text-sm text-muted-foreground">
              Continue this story for 2-3 minutes. Create a coherent narrative with a clear beginning, middle, and end.
              Use descriptive language and at least 5 complex sentences.
            </p>
          </div>
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
            <p className="text-center text-muted-foreground">Analyzing your storytelling...</p>
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
                      <span className="text-sm font-medium">{key.replace(/_/g, " ")}</span>
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
                  <h4 className="mb-2 font-medium">Your Story</h4>
                  <div className="bg-muted/30 p-3 rounded-md">
                    <p className="text-sm text-muted-foreground italic">{currentStory.start}</p>
                    <p className="text-sm mt-2">{feedback.transcribedText}</p>
                  </div>
                </div>
              )}

              <div>
                <h4 className="mb-2 font-medium">Feedback</h4>
                <p className="text-muted-foreground">{feedback.feedback}</p>
              </div>

              {feedback.strengths && feedback.strengths.length > 0 && (
                <div>
                  <h4 className="mb-2 font-medium">Strengths</h4>
                  <ul className="list-inside list-disc space-y-1 text-muted-foreground">
                    {feedback.strengths.map((item: string, index: number) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

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
        {status === "feedback" && (
          <>
            <Button variant="outline" onClick={startRecording}>
              <RefreshCw className="mr-2 h-4 w-4" /> Try Again
            </Button>
            <Button onClick={nextStory}>
              Next Story <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  )
}

