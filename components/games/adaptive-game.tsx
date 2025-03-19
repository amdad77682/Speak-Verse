"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowRight, BarChart2, Mic, Square, Volume2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import type { LevelType } from "@/lib/game-data"

interface AdaptiveGameProps {
  level: LevelType
  onComplete: (score: number) => void
}

export function AdaptiveGame({ level, onComplete }: AdaptiveGameProps) {
  const [activeTab, setActiveTab] = useState("pronunciation")
  const [status, setStatus] = useState<"idle" | "recording" | "processing" | "feedback">("idle")
  const [completedChallenges, setCompletedChallenges] = useState(0)
  const [progress, setProgress] = useState(0)
  const [scores, setScores] = useState({
    pronunciation: 0,
    fluency: 0,
    grammar: 0,
  })
  const { toast } = useToast()

  // Sample personalized challenges based on weak areas
  const challenges = {
    pronunciation: {
      title: "Pronunciation Challenge",
      description: "Based on your previous performance, you need to work on these specific sounds.",
      exercises: [
        {
          title: "The 'th' Sound",
          instructions: "Practice saying these words with the 'th' sound: think, three, through, thank, theory",
          example: "The three thieves thought they could escape through the thick forest.",
        },
        {
          title: "The 'r' Sound",
          instructions: "Practice saying these words with the 'r' sound: red, right, around, very, problem",
          example: "The red car drove around the corner very rapidly.",
        },
        {
          title: "Vowel Distinction",
          instructions: "Practice distinguishing between these vowel sounds: ship/sheep, bit/beat, pull/pool",
          example: "I can see the sheep on the ship from the beach.",
        },
      ],
    },
    fluency: {
      title: "Fluency Challenge",
      description: "Based on your previous performance, you need to work on reducing hesitations and filler words.",
      exercises: [
        {
          title: "Continuous Speaking",
          instructions: "Speak for 1 minute without pausing on this topic: Your favorite hobby",
          example: "My favorite hobby is photography. I started taking photos when I was a teenager...",
        },
        {
          title: "Reducing Filler Words",
          instructions: "Describe your daily routine without using 'um', 'uh', or 'like'",
          example: "I wake up at 7 AM every morning. First, I brush my teeth and take a shower...",
        },
        {
          title: "Connecting Ideas",
          instructions:
            "Use these transition words to connect your ideas: however, therefore, in addition, consequently",
          example: "I wanted to go to the beach; however, it started raining. Therefore, I decided to stay home.",
        },
      ],
    },
    grammar: {
      title: "Grammar Challenge",
      description: "Based on your previous performance, you need to work on these grammar structures.",
      exercises: [
        {
          title: "Past Perfect Tense",
          instructions: "Create sentences using the past perfect tense with these verbs: go, see, eat, finish, start",
          example: "By the time I arrived at the party, most people had already left.",
        },
        {
          title: "Conditional Sentences",
          instructions:
            "Create 'if' conditional sentences (types 1, 2, and 3) about these topics: travel, education, career",
          example: "If I had studied harder, I would have passed the exam.",
        },
        {
          title: "Reported Speech",
          instructions:
            "Convert these direct quotes to reported speech: 'I am tired', 'I will call you tomorrow', 'Have you seen my keys?'",
          example: "She said that she was tired. He told me that he would call me the next day.",
        },
      ],
    },
  }

  const currentChallenge = challenges[activeTab as keyof typeof challenges]
  const currentExerciseIndex = Math.min(completedChallenges % 3, 2)
  const currentExercise = currentChallenge.exercises[currentExerciseIndex]

  const startRecording = () => {
    setStatus("recording")

    // In a real implementation, this would start recording
    toast({
      title: "Recording started",
      description: "Complete the exercise as instructed",
    })

    // Simulate recording for 30 seconds
    setTimeout(() => {
      stopRecording()
    }, 30000)
  }

  const stopRecording = () => {
    setStatus("processing")

    // In a real implementation, this would stop recording and process the audio
    setTimeout(() => {
      // Simulate processing result
      const score = Math.floor(Math.random() * 20) + 70 // 70-90 score

      // Update scores for the current area
      setScores((prev) => ({
        ...prev,
        [activeTab]: score,
      }))

      // Increment completed challenges
      const newCompletedChallenges = completedChallenges + 1
      setCompletedChallenges(newCompletedChallenges)

      // Calculate overall progress (9 total challenges - 3 in each area)
      setProgress((newCompletedChallenges / 9) * 100)

      setStatus("feedback")

      // Check if all challenges are complete
      if (newCompletedChallenges >= 9) {
        const averageScore = (scores.pronunciation + scores.fluency + scores.grammar + score) / 4
        onComplete(averageScore)
        toast({
          title: "Level Complete!",
          description: `You've successfully completed Level 8 with an average score of ${Math.round(averageScore)}%`,
        })
      }
    }, 2000)
  }

  const playExample = () => {
    // In a real implementation, this would play the audio example
    const utterance = new SpeechSynthesisUtterance(currentExercise.example)
    speechSynthesis.speak(utterance)
  }

  const nextExercise = () => {
    // If we've completed all exercises in this area, move to the next area
    if (currentExerciseIndex === 2) {
      if (activeTab === "pronunciation") {
        setActiveTab("fluency")
      } else if (activeTab === "fluency") {
        setActiveTab("grammar")
      } else {
        setActiveTab("pronunciation")
      }
    }

    setStatus("idle")
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Level 8: The Adaptive Zone</CardTitle>
          <Badge>{completedChallenges}/9 Challenges</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Progress: {completedChallenges}/9 challenges</span>
            <span className="text-sm font-medium">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Weak Areas Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pronunciation" disabled={status !== "idle" && status !== "feedback"}>
              Pronunciation {scores.pronunciation > 0 && `(${scores.pronunciation}%)`}
            </TabsTrigger>
            <TabsTrigger value="fluency" disabled={status !== "idle" && status !== "feedback"}>
              Fluency {scores.fluency > 0 && `(${scores.fluency}%)`}
            </TabsTrigger>
            <TabsTrigger value="grammar" disabled={status !== "idle" && status !== "feedback"}>
              Grammar {scores.grammar > 0 && `(${scores.grammar}%)`}
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
            <div className="rounded-lg border bg-muted/50 p-6">
              <div className="flex items-center gap-2 mb-3">
                <BarChart2 className="h-5 w-5 text-primary" />
                <h3 className="font-medium">{currentChallenge.title}</h3>
              </div>

              <p className="text-muted-foreground mb-4">{currentChallenge.description}</p>

              <div className="rounded-lg border bg-background p-4">
                <h4 className="font-medium mb-2">
                  Exercise {currentExerciseIndex + 1}: {currentExercise.title}
                </h4>
                <p className="text-sm text-muted-foreground mb-3">{currentExercise.instructions}</p>

                <div className="flex items-center gap-2 mt-4">
                  <Button variant="outline" size="sm" onClick={playExample}>
                    <Volume2 className="mr-2 h-4 w-4" /> Listen to Example
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

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
            <p className="text-center text-muted-foreground">Analyzing your performance...</p>
          </div>
        )}

        {/* Feedback Section */}
        {status === "feedback" && (
          <div className="space-y-4 rounded-lg border p-4">
            <div className="text-center mb-4">
              <h3 className="text-xl font-bold">Exercise Complete!</h3>
              <p className="text-muted-foreground">You've completed this exercise. Here's your performance:</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Score
                </span>
                <Badge>{scores[activeTab as keyof typeof scores]}%</Badge>
              </div>
              <Progress
                value={scores[activeTab as keyof typeof scores]}
                className={cn(
                  "h-2",
                  scores[activeTab as keyof typeof scores] >= 80
                    ? "bg-green-500"
                    : scores[activeTab as keyof typeof scores] >= 60
                      ? "bg-yellow-500"
                      : "bg-red-500",
                )}
              />
            </div>

            <div className="mt-4">
              <h4 className="mb-2 font-medium">Feedback</h4>
              <p className="text-muted-foreground">
                {scores[activeTab as keyof typeof scores] >= 80
                  ? `Great job! Your ${activeTab} has improved significantly.`
                  : `Good effort! With more practice, your ${activeTab} will continue to improve.`}
              </p>
            </div>

            <div className="mt-4">
              <h4 className="mb-2 font-medium">Tips for Improvement</h4>
              <ul className="list-inside list-disc space-y-1 text-muted-foreground">
                {activeTab === "pronunciation" && (
                  <>
                    <li>Practice the specific sounds daily for 5-10 minutes</li>
                    <li>Record yourself and compare with native speakers</li>
                    <li>Focus on mouth and tongue position for difficult sounds</li>
                  </>
                )}
                {activeTab === "fluency" && (
                  <>
                    <li>Practice speaking continuously for longer periods</li>
                    <li>Be conscious of filler words and try to reduce them</li>
                    <li>Use transition phrases to connect your ideas smoothly</li>
                  </>
                )}
                {activeTab === "grammar" && (
                  <>
                    <li>Review the grammar rules for this structure</li>
                    <li>Create your own example sentences using this pattern</li>
                    <li>Notice how native speakers use this grammar in context</li>
                  </>
                )}
              </ul>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        {status === "idle" && (
          <Button onClick={startRecording} className="w-full">
            <Mic className="mr-2 h-4 w-4" /> Start Exercise
          </Button>
        )}
        {status === "recording" && (
          <Button variant="destructive" onClick={stopRecording} className="w-full">
            <Square className="mr-2 h-4 w-4" /> Stop Recording
          </Button>
        )}
        {status === "feedback" && (
          <Button onClick={nextExercise} className="w-full">
            Next Exercise <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}

