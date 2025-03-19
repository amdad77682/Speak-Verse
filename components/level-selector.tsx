"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ArrowRight, Lock } from "lucide-react"
import Link from "next/link"
import { useGameContext } from "@/context/game-context"
import { cn } from "@/lib/utils"
import { getAllLevels } from "@/lib/game-data"

export function LevelSelector() {
  const { playerLevel, levelProgress } = useGameContext()
  const allLevels = getAllLevels()

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {allLevels.map((level) => {
        const isLocked = level.id > playerLevel
        const isCurrent = level.id === playerLevel
        const isCompleted = level.id < playerLevel
        const progress = levelProgress[level.id] || 0

        return (
          <Card
            key={level.id}
            className={cn(
              "transition-all duration-200",
              isLocked ? "opacity-70" : "hover:shadow-md",
              isCurrent && "border-primary/50",
            )}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold",
                      isCompleted
                        ? "bg-primary text-primary-foreground"
                        : isCurrent
                          ? "bg-primary/20 text-primary"
                          : "bg-muted text-muted-foreground",
                    )}
                  >
                    {level.id}
                  </div>
                  <CardTitle>{level.title}</CardTitle>
                </div>
                {isLocked && <Lock className="h-4 w-4 text-muted-foreground" />}
                {isCurrent && <Badge>Current</Badge>}
                {isCompleted && <Badge variant="outline">Completed</Badge>}
              </div>
              <CardDescription>{level.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Mission:</span>
                  <span className="font-medium">{level.mission}</span>
                </div>
                {(isCurrent || isCompleted) && (
                  <>
                    <div className="flex items-center justify-between text-sm">
                      <span>Progress:</span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </>
                )}
              </div>
            </CardContent>
            <CardFooter>
              {isLocked ? (
                <Button disabled className="w-full">
                  Locked
                </Button>
              ) : (
                <Link href={`/level/${level.id}`} className="w-full">
                  <Button className="w-full gap-1.5">
                    {isCurrent ? "Continue" : isCompleted ? "Practice Again" : "Start"}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              )}
            </CardFooter>
          </Card>
        )
      })}
    </div>
  )
}

