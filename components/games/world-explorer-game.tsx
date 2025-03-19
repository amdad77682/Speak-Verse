"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Mic, Square, RefreshCw, ArrowRight, Globe, Volume2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import type { LevelType } from "@/lib/game-data"
import { simulateConversation, generateSpeech } from "@/lib/speech-services"

interface WorldExplorerGameProps {
  level: LevelType
  onComplete: (score: number) => void
}

export function WorldExplorerGame({ level, onComplete }: WorldExplorerGameProps) {
  const [status, setStatus] = useState<"idle" | "recording" | "processing" | "feedback">("idle")
  const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0)
  const [completedScenarios, setCompletedScenarios] = useState(0)
  const [progress, setProgress] = useState(0)
  const [scores, setScores] = useState<number[]>([])
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [aiResponseAudioUrl, setAiResponseAudioUrl] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<any>(null)
  const [previousExchanges, setPreviousExchanges] = useState<string[]>([])
  const [isRecording, setIsRecording] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const { toast } = useToast()

  // Sample real-world scenarios
  const scenarios = [
    {
      title: "Restaurant Ordering",
      description: "You're at a restaurant and want to order food. The waiter has just approached your table.",
      context: "Fine dining restaurant",
      roleplay: [
        {
          speaker: "Waiter",
          text: "Good evening! Welcome to La Maison. My name is Jean and I'll be your server tonight. Can I get you started with something to drink?",
        },
        { speaker: "You", text: "..." },
        { speaker: "Waiter", text: "Excellent choice. Would you like to hear about our specials for tonight?" },
        { speaker: "You", text: "..." },
        {
          speaker: "Waiter",
          text: "Our chef's special tonight is pan-seared salmon with a lemon butter sauce, served with seasonal vegetables. We also have a ribeye steak with truffle mashed potatoes.",
        },
        { speaker: "You", text: "..." },
      ],
      vocabulary: ["appetizer", "entrée", "dessert", "recommendation", "allergies", "gluten-free", "vegetarian"],
      expressions: ["I'd like to order...", "Could you recommend...", "I'm allergic to...", "What's your specialty?"],
    },
    {
      title: "Job Interview",
      description: "You're attending a job interview for a position you're very interested in.",
      context: "Corporate office",
      roleplay: [
        {
          speaker: "Interviewer",
          text: "Good morning! Thanks for coming in today. I've had a chance to review your resume. Could you tell me a bit about yourself and why you're interested in this position?",
        },
        { speaker: "You", text: "..." },
        {
          speaker: "Interviewer",
          text: "That's interesting. Can you tell me about a challenging situation you faced in your previous job and how you handled it?",
        },
        { speaker: "You", text: "..." },
        { speaker: "Interviewer", text: "Great. Now, where do you see yourself in five years?" },
        { speaker: "You", text: "..." },
      ],
      vocabulary: [
        "experience",
        "skills",
        "qualifications",
        "team player",
        "problem-solving",
        "deadline",
        "achievement",
      ],
      expressions: [
        "I have extensive experience in...",
        "One of my greatest strengths is...",
        "I'm particularly interested in...",
        "In my previous role, I...",
      ],
    },
    {
      title: "Airport Check-in",
      description: "You're at the airport and need to check in for your international flight.",
      context: "Airport terminal",
      roleplay: [
        { speaker: "Agent", text: "Good afternoon. May I see your passport and booking confirmation, please?" },
        { speaker: "You", text: "..." },
        { speaker: "Agent", text: "Thank you. Are you checking any bags today?" },
        { speaker: "You", text: "..." },
        { speaker: "Agent", text: "I see. Do you have any preference for your seat? Window or aisle?" },
        { speaker: "You", text: "..." },
      ],
      vocabulary: ["boarding pass", "carry-on", "checked baggage", "security", "gate", "departure", "layover"],
      expressions: [
        "I'd like to check in for my flight to...",
        "I have one/two bags to check",
        "I prefer a window/aisle seat",
        "What time is boarding?",
      ],
    },
  ]

  const currentScenario = scenarios[currentScenarioIndex]
  const currentRoleplayIndex = Math.min(completedScenarios % 3, 2) * 2 // 0, 2, or 4

  useEffect(() => {
    // Update progress when completedScenarios changes
    setProgress((completedScenarios / 3) * 100)

    // Check if level is complete (3 scenarios)
    if (completedScenarios >= 3) {
      const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length
      onComplete(averageScore)
      toast({
        title: "Level Complete!",
        description: `You've successfully completed Level 9 with an average score of ${Math.round(averageScore)}%`,
      })
    }
  }, [completedScenarios, scores, onComplete, toast])

  // Generate TTS audio for AI response when feedback is received
  useEffect(() => {
    async function loadAiResponseAudio() {
      try {
        if (feedback && feedback.aiResponse) {
          // Clear previous audio URL
          if (aiResponseAudioUrl) {
            URL.revokeObjectURL(aiResponseAudioUrl)
          }

          // Generate new audio
          const audioUrl = await generateSpeech(feedback.aiResponse, "nova")
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
  }, [feedback])

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
      setIsRecording(true)
      setStatus("recording")

      // Automatically stop recording after 15 seconds
      setTimeout(() => {
        if (mediaRecorder.state !== "inactive") {
          stopRecording()
        }
      }, 15000)

      toast({
        title: "Recording started",
        description: "Respond to the scenario naturally",
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
      setIsRecording(false)

      // Stop all audio tracks
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop())
    }
  }

  const processAudio = async (blob: Blob) => {
    try {
      // Get the current roleplay exchange
      const currentExchange = currentScenario.roleplay[currentRoleplayIndex]
      const role = currentExchange.speaker === "You" ? "User" : currentExchange.speaker
      const otherRole =
        currentExchange.speaker === "You" ? currentScenario.roleplay[currentRoleplayIndex - 1].speaker : "User"

      // Use our conversation simulation service
      const result = await simulateConversation(
        blob,
        `${currentScenario.title}: ${currentScenario.description}`,
        otherRole,
        previousExchanges,
      )

      // Add the user's response and AI's response to previous exchanges
      const updatedExchanges = [
        ...previousExchanges,
        `User: ${result.transcribedText}`,
        `${otherRole}: ${result.aiResponse}`,
      ]
      setPreviousExchanges(updatedExchanges)

      // Add score to scores array
      setScores((prev) => [...prev, result.overallScore])

      // Increment completed scenarios counter if we've gone through all roleplay steps
      if (currentRoleplayIndex === 4) {
        const newCompletedScenarios = completedScenarios + 1
        setCompletedScenarios(newCompletedScenarios)
        setProgress((newCompletedScenarios / 3) * 100)
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

  const continueScenario = () => {
    // If we've gone through all roleplay steps, move to next scenario
    if (currentRoleplayIndex === 4) {
      setCurrentScenarioIndex((prev) => (prev + 1) % scenarios.length)
      setPreviousExchanges([])
    }

    setStatus("idle")
    setAudioBlob(null)
    setAudioUrl(null)
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
    } else if (feedback && feedback.aiResponse) {
      // Fallback to browser TTS
      const utterance = new SpeechSynthesisUtterance(feedback.aiResponse)
      utterance.rate = 0.9
      speechSynthesis.speak(utterance)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Level 9: The World Explorer</CardTitle>
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
            <span className="text-sm font-medium">Progress: {completedScenarios}/3 scenarios</span>
            <span className="text-sm font-medium">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Current Scenario */}
        <div className="rounded-lg border bg-muted/50 p-6">
          <div className="flex items-center gap-2 mb-3">
            <Globe className="h-5 w-5 text-primary" />
            <h3 className="font-medium">{currentScenario.title}</h3>
          </div>

          <p className="text-muted-foreground mb-4">{currentScenario.description}</p>

          <div className="rounded-lg border bg-background p-4 mb-4">
            <h4 className="text-sm font-medium mb-2">Context: {currentScenario.context}</h4>

            <div className="space-y-4 mt-4">
              {currentScenario.roleplay.slice(0, currentRoleplayIndex + 2).map((exchange, index) => (
                <div
                  key={index}
                  className={cn("p-3 rounded-lg", exchange.speaker === "You" ? "bg-primary/10 ml-8" : "bg-muted mr-8")}
                >
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-xs font-medium">{exchange.speaker}:</p>
                    {exchange.speaker !== "You" && (
                      <Button variant="ghost" size="sm" onClick={playAiResponse} className="h-6 w-6 p-0">
                        <Volume2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                  <p className="text-sm">
                    {exchange.speaker === "You" && index === currentRoleplayIndex + 1
                      ? "Your response here..."
                      : exchange.text}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 mt-4">
            <div>
              <h4 className="text-sm font-medium mb-2">Useful Vocabulary:</h4>
              <div className="flex flex-wrap gap-2">
                {currentScenario.vocabulary.map((word, index) => (
                  <Badge key={index} variant="outline">
                    {word}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-2">Useful Expressions:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                {currentScenario.expressions.map((expression, index) => (
                  <li key={index}>"{expression}"</li>
                ))}
              </ul>
            </div>
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
            <p className="text-center text-muted-foreground">Analyzing your response...</p>
          </div>
        )}

        {/* Feedback Section */}
        {status === "feedback" && feedback && (
          <div className="space-y-4 rounded-lg border p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Your Response</h3>
              <Button variant="outline" size="sm" onClick={playAudio}>
                <Volume2 className="mr-2 h-4 w-4" /> Play
              </Button>
            </div>

            {feedback.transcribedText && (
              <div className="mb-4 bg-muted/30 p-3 rounded-md">
                <p className="text-sm">{feedback.transcribedText}</p>
              </div>
            )}

            {feedback.aiResponse && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">AI Response</h4>
                  <Button variant="outline" size="sm" onClick={playAiResponse}>
                    <Volume2 className="mr-2 h-4 w-4" /> Play
                  </Button>
                </div>
                <div className="bg-primary/10 p-3 rounded-md">
                  <p className="text-sm">{feedback.aiResponse}</p>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Overall Score</span>
                <Badge>{feedback.overallScore}%</Badge>
              </div>
              <Progress
                value={feedback.overallScore}
                className={cn(
                  "h-2",
                  feedback.overallScore >= 80
                    ? "bg-green-500"
                    : feedback.overallScore >= 60
                      ? "bg-yellow-500"
                      : "bg-red-500",
                )}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2 mt-4">
              {Object.entries(feedback.metrics).map(([key, value]: [string, any]) => (
                <div key={key}>
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-sm font-medium">{key.replace(/_/g, " ")}</span>
                    <Badge variant="outline">{value.score}%</Badge>
                  </div>
                  <Progress value={value.score} className="h-2" />
                </div>
              ))}
            </div>

            <div className="mt-4">
              <h4 className="mb-2 font-medium">Feedback</h4>
              <p className="text-muted-foreground">{feedback.feedback}</p>
            </div>

            {feedback.improvements && feedback.improvements.length > 0 && (
              <div className="mt-4">
                <h4 className="mb-2 font-medium">Areas for Improvement</h4>
                <ul className="list-inside list-disc space-y-1 text-muted-foreground">
                  {feedback.improvements.map((item: string, index: number) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {feedback.alternativeResponses && feedback.alternativeResponses.length > 0 && (
              <div className="mt-4">
                <h4 className="mb-2 font-medium">Alternative Responses</h4>
                <div className="text-sm text-muted-foreground space-y-2">
                  {feedback.alternativeResponses.map((response: string, index: number) => (
                    <p key={index}>• "{response}"</p>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        {status === "idle" && (
          <Button onClick={startRecording} className="w-full">
            <Mic className="mr-2 h-4 w-4" /> Record Response
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
            <Button onClick={continueScenario}>
              Continue {currentRoleplayIndex === 4 ? "to Next Scenario" : "Conversation"}{" "}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  )
}

