"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Flame, Trophy, Zap } from "lucide-react"
import { useGameContext } from "@/context/game-context"

export function GameStats() {
  const { playerLevel, levelProgress } = useGameContext()
  const [mounted, setMounted] = useState(false)

  // Handle hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  // Calculate total progress percentage across all levels
  const totalLevels = 10
  const completedLevels = playerLevel - 1
  const overallProgress = Math.round((completedLevels / totalLevels) * 100)

  // Calculate streak (in a real app, this would be tracked properly)
  // For demo purposes, we'll just use a random number between 1-30
  const streak = Math.floor(Math.random() * 30) + 1

  // Calculate XP (in a real app, this would be tracked properly)
  // For demo, we'll calculate based on level progress
  const xp = Object.values(levelProgress).reduce((sum, score) => sum + score, 0)

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <Card className="p-4 flex items-center gap-3 bg-gradient-to-r from-amber-50 to-yellow-50 border-yellow-200">
        <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
          <Flame className="h-6 w-6 text-amber-500" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Daily Streak</p>
          <p className="text-2xl font-bold">{streak} days</p>
        </div>
      </Card>

      <Card className="p-4 flex items-center gap-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
          <Zap className="h-6 w-6 text-blue-500" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Total XP</p>
          <p className="text-2xl font-bold">{xp} XP</p>
        </div>
      </Card>

      <Card className="p-4 flex items-center gap-3 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
          <Trophy className="h-6 w-6 text-green-500" />
        </div>
        <div className="flex-1">
          <div className="flex justify-between">
            <p className="text-sm text-muted-foreground">Overall Progress</p>
            <p className="text-sm font-medium">{overallProgress}%</p>
          </div>
          <Progress value={overallProgress} className="h-2 mt-2" />
        </div>
      </Card>
    </div>
  )
}

