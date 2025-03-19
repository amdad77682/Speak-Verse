"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Mic, Square, RefreshCw, ArrowRight } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import type { LevelType } from "@/lib/game-data"
import { analyzeAudio } from "@/lib/speech-analysis"

interface UltimateSpeakerGameProps {
  level: LevelType
  onComplete: (score: number) => void
}

export function UltimateSpeakerGame({ level, onComplete }: UltimateSpeakerGameProps) {
  const [activeTab, setActiveTab] = useState("part1")
  const [status, setStatus] = useState<"idle" | "recording" | "processing" | "feedback">("idle")
  const [timeLeft, setTimeLeft] = useState(60)
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<any>(null)
  const [scores, setScores] = useState({
    part1: 0,
    part2: 0,
    part3: 0,
  })
  const [progress, setProgress] = useState(0)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const { toast } = useToast()

  // IELTS Speaking Test content
  const ieltsContent = {
    part1: {
      title: "Part 1: Introduction and Interview",
      description:
        "In this part, the examiner introduces themselves and asks you to introduce yourself and confirm your identity. The examiner asks you general questions on familiar topics such as home, family, work, studies, and interests.",
      questions: [
        "Can you tell me about where you live?",
        "Do you work or are you a student?",
        "What do you enjoy doing in your free time?",
        "Do you prefer indoor or outdoor activities?",
        "What type of music do you enjoy listening to?",
      ],
      duration: 60, // seconds
    },
    part2: {
      title: "Part 2: Individual Long Turn",
      description:
        "The examiner gives you a task card which asks you to talk about a particular topic, including points to include in your talk. You have one minute to prepare and make notes. You then talk for 1-2 minutes on the topic.",
      taskCard: {
        topic: "Describe a person who has had a significant influence on your life.",
        points: ["Who this person is", "How you know them", "What qualities they have", "Why they have influenced you"],
      },
      duration: 120, // seconds
    },
    part3: {
      title: "Part 3: Two-way Discussion",
      description:
        "The examiner asks further questions which are connected to the topic of Part 2. These questions give you an opportunity to discuss more abstract issues and ideas.",
      questions: [
        "Do you think people are more influenced by their family or by their friends?",
        "How do role models influence young people in society today?",
        "Do you think that the influence of celebrities on young people is generally positive or negative?",
        "How has the way people influence each other changed with the rise of social media?",
        "What qualities make someone a good role model?",
      ],
      duration: 180, // seconds
    },
  }

  // Get current content based on active tab
  const currentContent = ieltsContent[activeTab as keyof typeof ieltsContent]

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
    // Update progress based on completed parts
    const completedParts = Object.values(scores).filter((score) => score > 0).length
    setProgress((completedParts / 3) * 100)

    // Check if all parts are complete with score >= 7.5
    const allPartsComplete = Object.values(scores).every((score) => score >= 7.5)
    if (allPartsComplete) {
      const averageScore = (scores.part1 + scores.part2 + scores.part3) / 3
      onComplete(averageScore * 10) // Convert to percentage
      toast({
        title: "Level Complete!",
        description: `You've successfully completed the IELTS Speaking Test with an average band score of ${averageScore.toFixed(1)}`,
      })
    }
  }, [scores, onComplete, toast])

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
      setTimeLeft(currentContent.duration)

      toast({
        title: "Recording started",
        description: `Speak clearly for ${currentContent.duration / 60} minutes`,
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
        // For demo purposes, we'll use a random score with higher probability of success
        const result = analyzeAudio("ielts", activeTab)

        // Convert overall score to IELTS band (0-9)
        const ieltsBand = (result.overallScore / 100) * 9

        // Update scores for the current part
        setScores((prev) => ({
          ...prev,
          [activeTab]: ieltsBand,
        }))

        setFeedback({
          ...result,
          ieltsBand,
        })
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

  const resetPart = () => {
    setStatus("idle")
    setAudioBlob(null)
    setAudioUrl(null)
    setFeedback(null)
  }

  const moveToNextPart = () => {
    if (activeTab === "part1") {
      setActiveTab("part2")
    } else if (activeTab === "part2") {
      setActiveTab("part3")
    }
    resetPart()
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
          <CardTitle>Level 10: The Ultimate Speaker (IELTS Test)</CardTitle>
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
            <span className="text-sm font-medium">Test Progress</span>
            <span className="text-sm font-medium">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* IELTS Parts Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="part1" disabled={status !== "idle" && status !== "feedback"}>
              Part 1 {scores.part1 > 0 && `(${scores.part1.toFixed(1)})`}
            </TabsTrigger>
            <TabsTrigger value="part2" disabled={(status !== "idle" && status !== "feedback") || scores.part1 === 0}>
              Part 2 {scores.part2 > 0 && `(${scores.part2.toFixed(1)})`}
            </TabsTrigger>
            <TabsTrigger value="part3" disabled={(status !== "idle" && status !== "feedback") || scores.part2 === 0}>
              Part 3 {scores.part3 > 0 && `(${scores.part3.toFixed(1)})`}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="part1" className="space-y-4">
            <div className="rounded-lg border bg-muted/50 p-6">
              <h3 className="text-lg font-medium mb-2">{ieltsContent.part1.title}</h3>
              <p className="text-muted-foreground mb-4">{ieltsContent.part1.description}</p>

              <div className="space-y-4">
                <h4 className="font-medium">Sample Questions:</h4>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  {ieltsContent.part1.questions.map((question, index) => (
                    <li key={index}>{question}</li>
                  ))}
                </ul>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="part2" className="space-y-4">
            <div className="rounded-lg border bg-muted/50 p-6">
              <h3 className="text-lg font-medium mb-2">{ieltsContent.part2.title}</h3>
              <p className="text-muted-foreground mb-4">{ieltsContent.part2.description}</p>

              <div className="rounded-lg border p-4 bg-background">
                <h4 className="font-medium mb-2">Task Card:</h4>
                <p className="font-medium">{ieltsContent.part2.taskCard.topic}</p>
                <p className="text-sm text-muted-foreground mt-2 mb-1">You should say:</p>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  {ieltsContent.part2.taskCard.points.map((point, index) => (
                    <li key={index}>{point}</li>
                  ))}
                </ul>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="part3" className="space-y-4">
            <div className="rounded-lg border bg-muted/50 p-6">
              <h3 className="text-lg font-medium mb-2">{ieltsContent.part3.title}</h3>
              <p className="text-muted-foreground mb-4">{ieltsContent.part3.description}</p>

              <div className="space-y-4">
                <h4 className="font-medium">Discussion Questions:</h4>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  {ieltsContent.part3.questions.map((question, index) => (
                    <li key={index}>{question}</li>
                  ))}
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Timer Section */}
        {(status === "idle" || status === "recording") && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Time Remaining</span>
              <span className={cn("text-sm font-medium", timeLeft < 30 && "text-red-500")}>{formatTime(timeLeft)}</span>
            </div>
            <Progress value={(timeLeft / currentContent.duration) * 100} className="h-2" />
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
            <p className="text-center text-muted-foreground">Analyzing your IELTS speaking performance...</p>
          </div>
        )}

        {/* Feedback Section */}
        {status === "feedback" && feedback && (
          <div className="space-y-4">
            <div className="space-y-4 rounded-lg border p-4">
              <div className="text-center mb-4">
                <h3 className="text-xl font-bold">IELTS Band Score: {feedback.ieltsBand.toFixed(1)}</h3>
                <p className="text-muted-foreground">
                  {feedback.ieltsBand >= 7.5
                    ? "Excellent! You've achieved a very good score."
                    : "Good attempt. With more practice, you can improve your score."}
                </p>
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
                <h4 className="mb-2 font-medium">Examiner Feedback</h4>
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
          <Button onClick={startRecording} className="w-full">
            <Mic className="mr-2 h-4 w-4" /> Start{" "}
            {activeTab === "part1" ? "Part 1" : activeTab === "part2" ? "Part 2" : "Part 3"}
          </Button>
        )}
        {status === "recording" && (
          <Button variant="destructive" onClick={stopRecording} className="w-full">
            <Square className="mr-2 h-4 w-4" /> Stop Recording
          </Button>
        )}
        {status === "feedback" && (
          <>
            <Button variant="outline" onClick={resetPart}>
              <RefreshCw className="mr-2 h-4 w-4" /> Try Again
            </Button>
            {activeTab !== "part3" ? (
              <Button onClick={moveToNextPart}>
                Next Part <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={resetPart}>
                Complete Test <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </>
        )}
      </CardFooter>
    </Card>
  )
}

