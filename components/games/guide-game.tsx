"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Volume2, Mic, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import type { LevelType } from "@/lib/game-data"

interface GuideGameProps {
  level: LevelType
  onComplete: (score: number) => void
}

export function GuideGame({ level, onComplete }: GuideGameProps) {
  const [currentLearnerIndex, setCurrentLearnerIndex] = useState(0)
  const [selectedErrors, setSelectedErrors] = useState<string[]>([])
  const [explanations, setExplanations] = useState<Record<string, string>>({})
  const [completedLearners, setCompletedLearners] = useState(0)
  const [progress, setProgress] = useState(0)
  const [recordingError, setRecordingError] = useState<string | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const { toast } = useToast()

  // Sample learner recordings for the Guide level
  const learnerRecordings = [
    {
      name: "Miguel (Level 3)",
      audio: "/placeholder.svg?height=50&width=300",
      transcript:
        "Yesterday I go to the store and buyed some food. I like very much the fruits and vegetables. They are more healthier than fast food. When I coming back home, I see my friend and we talk about the weekend.",
      errors: [
        { id: "past-tense", text: "Incorrect past tense: 'I go' instead of 'I went'" },
        { id: "irregular-verb", text: "Incorrect irregular verb: 'buyed' instead of 'bought'" },
        { id: "comparative", text: "Incorrect comparative: 'more healthier' is a double comparative" },
        { id: "continuous", text: "Incorrect continuous form: 'I coming' instead of 'I was coming'" },
        { id: "article", text: "Missing article: 'the weekend' instead of just 'weekend'" },
      ],
    },
    {
      name: "Yuki (Level 2)",
      audio: "/placeholder.svg?height=50&width=300",
      transcript:
        "I living in small apartment near the station. Every day I walking to work because it very close. In my free time, I like read books and watching movies. Sometimes I cooking dinner for my friends.",
      errors: [
        { id: "be-verb", text: "Missing 'am': 'I living' instead of 'I am living'" },
        { id: "be-verb2", text: "Missing 'am': 'I walking' instead of 'I am walking'" },
        { id: "be-verb3", text: "Missing 'is': 'it very close' instead of 'it is very close'" },
        { id: "gerund", text: "Inconsistent verb form: 'like read' instead of 'like reading'" },
        { id: "be-verb4", text: "Missing 'am': 'I cooking' instead of 'I am cooking'" },
      ],
    },
    {
      name: "Sofia (Level 3)",
      audio: "/placeholder.svg?height=50&width=300",
      transcript:
        "Last summer, I travel to France with my family. We stay in Paris for one week. The weather is very nice and we visit many famous places. I take many photos of the Eiffel Tower and eat delicious food.",
      errors: [
        { id: "past-tense1", text: "Incorrect tense: 'I travel' instead of 'I traveled'" },
        { id: "past-tense2", text: "Incorrect tense: 'We stay' instead of 'We stayed'" },
        { id: "past-tense3", text: "Incorrect tense: 'is very nice' instead of 'was very nice'" },
        { id: "past-tense4", text: "Incorrect tense: 'we visit' instead of 'we visited'" },
        { id: "past-tense5", text: "Incorrect tense: 'I take' instead of 'I took'" },
      ],
    },
  ]

  const currentLearner = learnerRecordings[currentLearnerIndex]

  const toggleError = (errorId: string) => {
    if (selectedErrors.includes(errorId)) {
      setSelectedErrors(selectedErrors.filter((id) => id !== errorId))
    } else {
      setSelectedErrors([...selectedErrors, errorId])
    }
  }

  const handleExplanationChange = (errorId: string, explanation: string) => {
    setExplanations({
      ...explanations,
      [errorId]: explanation,
    })
  }

  const startRecording = (errorId: string) => {
    setRecordingError(errorId)
    setIsRecording(true)

    // In a real implementation, this would start recording
    toast({
      title: "Recording started",
      description: "Explain the error clearly and provide a correction",
    })

    // Simulate recording for 10 seconds
    setTimeout(() => {
      stopRecording()
    }, 10000)
  }

  const stopRecording = () => {
    setIsRecording(false)

    // In a real implementation, this would stop recording and process the audio
    toast({
      title: "Recording stopped",
      description: "Your explanation has been saved",
    })
  }

  const playAudio = () => {
    // In a real implementation, this would play the audio recording
    toast({
      title: "Playing audio",
      description: "This is a demo. In a real implementation, this would play the audio recording.",
    })
  }

  const submitFeedback = () => {
    // Check if feedback meets criteria
    const hasEnoughErrors = selectedErrors.length >= 3
    const hasExplanations = selectedErrors.every(
      (errorId) => explanations[errorId] && explanations[errorId].length >= 20,
    )

    if (!hasEnoughErrors || !hasExplanations) {
      toast({
        variant: "destructive",
        title: "Incomplete feedback",
        description: "Please identify at least 3 errors and provide explanations for all selected errors.",
      })
      return
    }

    // Calculate score based on correct error identification
    const correctErrors = selectedErrors.filter((errorId) =>
      currentLearner.errors.some((error) => error.id === errorId),
    ).length

    const score = (correctErrors / 3) * 100

    // Increment completed learners
    const newCompletedLearners = completedLearners + 1
    setCompletedLearners(newCompletedLearners)
    setProgress((newCompletedLearners / 3) * 100)

    // Check if level is complete
    if (newCompletedLearners >= 3) {
      onComplete(score)
      toast({
        title: "Level Complete!",
        description: `You've successfully completed Level 7 with a score of ${Math.round(score)}%`,
      })
    } else {
      // Move to next learner
      nextLearner()
    }
  }

  const nextLearner = () => {
    setCurrentLearnerIndex((prev) => (prev + 1) % learnerRecordings.length)
    setSelectedErrors([])
    setExplanations({})
    setRecordingError(null)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Level 7: The Guide</CardTitle>
          <Badge>{completedLearners}/3 Learners</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Progress: {completedLearners}/3 learners</span>
            <span className="text-sm font-medium">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Current Learner */}
        <div className="rounded-lg border bg-muted/50 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-medium">{currentLearner.name}'s Recording</h3>
            </div>
            <Button variant="outline" size="sm" onClick={playAudio}>
              <Volume2 className="mr-2 h-4 w-4" /> Play Recording
            </Button>
          </div>

          <div className="rounded-lg border bg-background p-4 mb-4">
            <h4 className="text-sm font-medium mb-2">Transcript:</h4>
            <p className="text-sm text-muted-foreground">{currentLearner.transcript}</p>
          </div>

          <div className="mt-4">
            <h4 className="text-sm font-medium">Your Task:</h4>
            <p className="text-sm text-muted-foreground">
              Identify at least 3 grammar or pronunciation errors in the recording. Provide clear explanations and
              corrections for each error.
            </p>
          </div>
        </div>

        {/* Error Identification */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Identify Errors</h3>
          <div className="space-y-3">
            {currentLearner.errors.map((error) => (
              <div
                key={error.id}
                className={cn(
                  "rounded-lg border p-4 cursor-pointer transition-colors",
                  selectedErrors.includes(error.id)
                    ? "border-primary bg-primary/5"
                    : "hover:border-muted-foreground/50",
                )}
                onClick={() => toggleError(error.id)}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      "mt-0.5 h-5 w-5 rounded-full border flex items-center justify-center",
                      selectedErrors.includes(error.id) ? "border-primary text-primary" : "border-muted-foreground/30",
                    )}
                  >
                    {selectedErrors.includes(error.id) && <CheckCircle className="h-4 w-4" />}
                  </div>
                  <div>
                    <p className="font-medium">{error.text}</p>

                    {selectedErrors.includes(error.id) && (
                      <div className="mt-3 space-y-3">
                        <div>
                          <label className="text-sm font-medium">Your Explanation:</label>
                          <textarea
                            className="w-full min-h-[80px] mt-1 p-2 rounded-md border border-input bg-background"
                            placeholder="Explain why this is an error and how to correct it..."
                            value={explanations[error.id] || ""}
                            onChange={(e) => handleExplanationChange(error.id, e.target.value)}
                          />
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              startRecording(error.id)
                            }}
                            disabled={isRecording}
                          >
                            <Mic className="mr-2 h-4 w-4" />
                            Record Explanation
                          </Button>

                          {recordingError === error.id && isRecording && (
                            <Badge variant="outline" className="animate-pulse bg-red-500/10 text-red-500">
                              Recording...
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={nextLearner}>
          Skip Learner
        </Button>
        <Button onClick={submitFeedback}>
          Submit Guidance <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  )
}

