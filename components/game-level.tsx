"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, ArrowRight, Play } from "lucide-react"
import Link from "next/link"
import { useGameContext } from "@/context/game-context"
import type { LevelType } from "@/lib/game-data"
import { EchoGame } from "@/components/games/echo-game"
import { SoundMatchGame } from "@/components/games/sound-match-game"
import { QuickThinkerGame } from "@/components/games/quick-thinker-game"
import { SocialCircleGame } from "@/components/games/social-circle-game"
import { DebateGame } from "@/components/games/debate-game"
import { StorytellerGame } from "@/components/games/storyteller-game"
import { GuideGame } from "@/components/games/guide-game"
import { AdaptiveGame } from "@/components/games/adaptive-game"
import { WorldExplorerGame } from "@/components/games/world-explorer-game"
import { UltimateSpeakerGame } from "@/components/games/ultimate-speaker-game"

export function GameLevel({ level }: { level: LevelType }) {
  const { completeLevel } = useGameContext()
  const [activeTab, setActiveTab] = useState("instructions")
  const [gameCompleted, setGameCompleted] = useState(false)
  const [gameScore, setGameScore] = useState(0)

  // Handle level completion
  const handleComplete = (score: number) => {
    setGameScore(score)
    setGameCompleted(true)
  }

  // Only call completeLevel when gameCompleted changes to true
  useEffect(() => {
    if (gameCompleted) {
      completeLevel(level.id, gameScore)
    }
  }, [gameCompleted, gameScore, level.id, completeLevel])

  // Memoize the game component to prevent unnecessary re-renders
  const renderGame = () => {
    switch (level.id) {
      case 1:
        return <EchoGame level={level} onComplete={handleComplete} />
      case 2:
        return <SoundMatchGame level={level} onComplete={handleComplete} />
      case 3:
        return <QuickThinkerGame level={level} onComplete={handleComplete} />
      case 4:
        return <SocialCircleGame level={level} onComplete={handleComplete} />
      case 5:
        return <DebateGame level={level} onComplete={handleComplete} />
      case 6:
        return <StorytellerGame level={level} onComplete={handleComplete} />
      case 7:
        return <GuideGame level={level} onComplete={handleComplete} />
      case 8:
        return <AdaptiveGame level={level} onComplete={handleComplete} />
      case 9:
        return <WorldExplorerGame level={level} onComplete={handleComplete} />
      case 10:
        return <UltimateSpeakerGame level={level} onComplete={handleComplete} />
      default:
        return <div>Game not found</div>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Level {level.id}: {level.title}
          </h1>
          <p className="text-muted-foreground">{level.description}</p>
        </div>
        <Link href="/">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Levels
          </Button>
        </Link>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="instructions">Instructions</TabsTrigger>
          <TabsTrigger value="play">Play</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
        </TabsList>

        <TabsContent value="instructions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>
                Level {level.id}: {level.title}
              </CardTitle>
              <CardDescription>{level.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-medium">Objective</h3>
                <p className="text-muted-foreground">{level.objective}</p>
              </div>
              <div>
                <h3 className="text-lg font-medium">How to Play</h3>
                <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                  {level.instructions.map((instruction, index) => (
                    <li key={index}>{instruction}</li>
                  ))}
                </ol>
              </div>
              <div>
                <h3 className="text-lg font-medium">Success Criteria</h3>
                <p className="text-muted-foreground">To complete this level, you need to:</p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  {level.successCriteria.map((criteria, index) => (
                    <li key={index}>{criteria}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => setActiveTab("play")} className="gap-1.5">
                Start Challenge <Play className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="play">{renderGame()}</TabsContent>

        <TabsContent value="feedback">
          <Card>
            <CardHeader>
              <CardTitle>Your Progress</CardTitle>
              <CardDescription>Track your performance in Level {level.id}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {gameCompleted ? (
                <div className="text-center py-4">
                  <h3 className="text-xl font-bold mb-2">Level Completed!</h3>
                  <p className="text-lg mb-4">Your score: {Math.round(gameScore)}%</p>
                  <p className="text-muted-foreground">
                    Congratulations on completing this level. You can continue to the next level or practice this one
                    again.
                  </p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Complete the level to see your feedback and progress.</p>
                  <Button onClick={() => setActiveTab("play")} className="mt-4 gap-1.5">
                    Go to Game <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

