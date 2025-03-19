"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, ThumbsUp, ThumbsDown } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { LevelType } from "@/lib/game-data"

interface SocialCircleGameProps {
  level: LevelType
  onComplete: (score: number) => void
}

export function SocialCircleGame({ level, onComplete }: SocialCircleGameProps) {
  const [currentSampleIndex, setCurrentSampleIndex] = useState(0)
  const [feedback, setFeedback] = useState("")
  const [strengths, setStrengths] = useState<string[]>([])
  const [weaknesses, setWeaknesses] = useState<string[]>([])
  const [completedSamples, setCompletedSamples] = useState(0)
  const [progress, setProgress] = useState(0)
  const { toast } = useToast()

  // Sample recordings for the Social Circle level
  const samples = [
    {
      name: "Alex",
      topic: "My Favorite Hobby",
      audio: "/placeholder.svg?height=50&width=300",
      transcript:
        "I really enjoy playing the guitar. I've been playing for about three years now. I practice almost every day for at least thirty minutes. I like to learn songs from my favorite bands, but sometimes I try to compose my own music too. It's really relaxing after a long day.",
      actualStrengths: ["Clear pronunciation", "Good pacing", "Appropriate vocabulary"],
      actualWeaknesses: ["Some grammar errors", "Limited sentence variety", "Few connecting words"],
    },
    {
      name: "Jamie",
      topic: "My Hometown",
      audio: "/placeholder.svg?height=50&width=300",
      transcript:
        "My hometown is, um, quite small. It's located in the, uh, southern part of the country. There are about, I think, twenty thousand people living there. The weather is usually warm and, um, sunny. The people are very friendly and helpful.",
      actualStrengths: ["Good vocabulary", "Clear main points"],
      actualWeaknesses: ["Many filler words (um, uh)", "Hesitation", "Simple sentence structure"],
    },
    {
      name: "Taylor",
      topic: "My Dream Job",
      audio: "/placeholder.svg?height=50&width=300",
      transcript:
        "I would like to become a software engineer because I enjoy solving problems and creating new things. I'm currently studying computer science at university. I hope to work for a big tech company or maybe start my own business someday. I think it's important to have a job that you're passionate about.",
      actualStrengths: ["Well-organized ideas", "Good vocabulary", "Fluent delivery"],
      actualWeaknesses: ["Some pronunciation issues", "Could use more complex grammar", "Limited use of examples"],
    },
  ]

  const currentSample = samples[currentSampleIndex]

  const handleFeedbackChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFeedback(e.target.value)
  }

  const toggleStrength = (strength: string) => {
    if (strengths.includes(strength)) {
      setStrengths(strengths.filter((s) => s !== strength))
    } else {
      setStrengths([...strengths, strength])
    }
  }

  const toggleWeakness = (weakness: string) => {
    if (weaknesses.includes(weakness)) {
      setWeaknesses(weaknesses.filter((w) => w !== weakness))
    } else {
      setWeaknesses([...weaknesses, weakness])
    }
  }

  const submitFeedback = () => {
    // Check if feedback meets criteria
    const hasEnoughStrengths = strengths.length >= 2
    const hasEnoughWeaknesses = weaknesses.length >= 2
    const hasFeedbackText = feedback.length >= 50

    if (!hasEnoughStrengths || !hasEnoughWeaknesses || !hasFeedbackText) {
      toast({
        variant: "destructive",
        title: "Incomplete feedback",
        description: "Please identify at least 2 strengths, 2 weaknesses, and provide detailed feedback.",
      })
      return
    }

    // Calculate score based on matching with actual strengths/weaknesses
    const strengthMatches = strengths.filter((s) =>
      currentSample.actualStrengths.some((as) => as.toLowerCase().includes(s.toLowerCase())),
    ).length

    const weaknessMatches = weaknesses.filter((w) =>
      currentSample.actualWeaknesses.some((aw) => aw.toLowerCase().includes(w.toLowerCase())),
    ).length

    const matchScore =
      ((strengthMatches + weaknessMatches) /
        (currentSample.actualStrengths.length + currentSample.actualWeaknesses.length)) *
      100

    // Increment completed samples
    const newCompletedSamples = completedSamples + 1
    setCompletedSamples(newCompletedSamples)
    setProgress((newCompletedSamples / 3) * 100)

    // Show success message
    toast({
      title: "Feedback submitted",
      description: "Your feedback has been recorded.",
    })

    // Check if level is complete
    if (completedSamples + 1 >= 3) {
      onComplete(matchScore)
      toast({
        title: "Level Complete!",
        description: `You've successfully completed Level 4 with a score of ${Math.round(matchScore)}%`,
      })
    } else {
      // Move to next sample
      nextSample()
    }
  }

  const nextSample = () => {
    setCurrentSampleIndex((prev) => (prev + 1) % samples.length)
    setFeedback("")
    setStrengths([])
    setWeaknesses([])
  }

  const playAudio = () => {
    // In a real implementation, this would play the audio recording
    toast({
      title: "Playing audio",
      description: "This is a demo. In a real implementation, this would play the audio recording.",
    })
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Level 4: The Social Circle</CardTitle>
          <Badge>{completedSamples}/3 Samples</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Progress: {completedSamples}/3 samples</span>
            <span className="text-sm font-medium">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Current Sample */}
        <div className="rounded-lg border bg-muted/50 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-medium">{currentSample.name}'s Recording</h3>
              <p className="text-sm text-muted-foreground">Topic: {currentSample.topic}</p>
            </div>
            <Button variant="outline" size="sm" onClick={playAudio}>
              Play Recording
            </Button>
          </div>

          <div className="rounded-lg border bg-background p-4 mb-4">
            <h4 className="text-sm font-medium mb-2">Transcript:</h4>
            <p className="text-sm text-muted-foreground">{currentSample.transcript}</p>
          </div>
        </div>

        {/* Feedback Form */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium mb-2">Provide Feedback</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Listen to the recording and identify strengths and areas for improvement. Provide constructive feedback
              that will help the speaker improve.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Identify Strengths (select at least 2):</h4>
            <div className="flex flex-wrap gap-2">
              {["Pronunciation", "Fluency", "Vocabulary", "Grammar", "Organization", "Confidence", "Clarity"].map(
                (strength) => (
                  <Badge
                    key={strength}
                    variant={strengths.includes(strength) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleStrength(strength)}
                  >
                    {strength} {strengths.includes(strength) && <ThumbsUp className="ml-1 h-3 w-3" />}
                  </Badge>
                ),
              )}
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Identify Areas for Improvement (select at least 2):</h4>
            <div className="flex flex-wrap gap-2">
              {[
                "Pronunciation",
                "Fluency",
                "Vocabulary",
                "Grammar",
                "Organization",
                "Confidence",
                "Clarity",
                "Filler Words",
                "Sentence Variety",
                "Examples",
              ].map((weakness) => (
                <Badge
                  key={weakness}
                  variant={weaknesses.includes(weakness) ? "destructive" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleWeakness(weakness)}
                >
                  {weakness} {weaknesses.includes(weakness) && <ThumbsDown className="ml-1 h-3 w-3" />}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Detailed Feedback:</h4>
            <textarea
              className="w-full min-h-[100px] p-2 rounded-md border border-input bg-background"
              placeholder="Provide specific, constructive feedback to help the speaker improve..."
              value={feedback}
              onChange={handleFeedbackChange}
            />
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={nextSample}>
          Skip Sample
        </Button>
        <Button onClick={submitFeedback}>
          Submit Feedback <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  )
}

