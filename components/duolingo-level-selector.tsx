"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { CheckIcon, LockIcon, StarIcon } from "lucide-react"
import { useGameContext } from "@/context/game-context"
import { getAllLevels } from "@/lib/game-data"

export function DuolingoLevelSelector() {
  const { playerLevel, levelProgress } = useGameContext()
  const allLevels = getAllLevels()
  const [mounted, setMounted] = useState(false)

  // Handle hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  // Calculate stars for each level (0-3 stars based on score)
  const getStarsForLevel = (levelId: number) => {
    const progress = levelProgress[levelId] || 0
    if (progress >= 95) return 3
    if (progress >= 80) return 2
    if (progress >= 60) return 1
    return 0
  }

  // Determine level status
  const getLevelStatus = (levelId: number) => {
    if (levelId < playerLevel) return "completed"
    if (levelId === playerLevel) return "current"
    return "locked"
  }

  // Get background color based on level
  const getLevelColor = (levelId: number) => {
    const colors = [
      "from-red-500 to-red-600",
      "from-orange-500 to-orange-600",
      "from-amber-500 to-amber-600",
      "from-yellow-500 to-yellow-600",
      "from-lime-500 to-lime-600",
      "from-green-500 to-green-600",
      "from-emerald-500 to-emerald-600",
      "from-teal-500 to-teal-600",
      "from-cyan-500 to-cyan-600",
      "from-blue-500 to-blue-600",
    ]
    return colors[(levelId - 1) % colors.length]
  }

  return (
    <div className="w-full max-w-3xl mx-auto py-8">
      <div className="relative">
        {/* Path connecting the levels */}
        <div className="absolute top-0 left-1/2 w-4 -ml-2 h-full bg-muted rounded-full -z-10" />

        {/* Levels */}
        <div className="relative space-y-12">
          {allLevels.map((level, index) => {
            const isEven = index % 2 === 0
            const status = getLevelStatus(level.id)
            const stars = getStarsForLevel(level.id)
            const levelColor = getLevelColor(level.id)

            return (
              <div key={level.id} className={cn("flex items-center gap-4", isEven ? "flex-row" : "flex-row-reverse")}>
                {/* Level node */}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="relative flex-shrink-0">
                        <motion.div
                          initial={{ scale: 0.8 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                        >
                          <Link
                            href={status !== "locked" ? `/level/${level.id}` : "#"}
                            className={cn(
                              "flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br shadow-lg",
                              levelColor,
                              status === "locked" && "opacity-60 grayscale cursor-not-allowed",
                              status === "current" && "ring-4 ring-primary ring-offset-2",
                            )}
                          >
                            <span className="text-2xl font-bold text-white">{level.id}</span>
                          </Link>
                        </motion.div>

                        {/* Status indicator */}
                        {status === "completed" && (
                          <div className="absolute -bottom-1 -right-1 bg-green-500 text-white rounded-full p-1">
                            <CheckIcon className="h-4 w-4" />
                          </div>
                        )}
                        {status === "locked" && (
                          <div className="absolute -bottom-1 -right-1 bg-muted-foreground text-white rounded-full p-1">
                            <LockIcon className="h-4 w-4" />
                          </div>
                        )}
                        {status === "current" && (
                          <div className="absolute -bottom-1 -right-1 bg-primary text-white rounded-full p-1">
                            <Badge variant="outline" className="bg-primary text-white border-none h-5 px-1">
                              GO
                            </Badge>
                          </div>
                        )}

                        {/* Stars for completed levels */}
                        {status === "completed" && (
                          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 flex">
                            {[...Array(3)].map((_, i) => (
                              <StarIcon
                                key={i}
                                className={cn(
                                  "h-4 w-4 -mx-0.5",
                                  i < stars ? "text-yellow-400 fill-yellow-400" : "text-gray-300 fill-gray-300",
                                )}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side={isEven ? "right" : "left"}>
                      <p className="font-medium">{level.title}</p>
                      <p className="text-xs text-muted-foreground">{level.mission}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                {/* Level info card */}
                <motion.div
                  initial={{ opacity: 0, x: isEven ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 + 0.2 }}
                  className={cn(
                    "bg-card rounded-lg p-4 shadow-md border flex-1 max-w-xs",
                    status === "locked" && "opacity-60",
                  )}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold">{level.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{level.description}</p>
                    </div>
                    {status === "completed" && levelProgress[level.id] && (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        {Math.round(levelProgress[level.id])}%
                      </Badge>
                    )}
                  </div>

                  {status !== "locked" && (
                    <Link href={`/level/${level.id}`} className="w-full">
                      <Button size="sm" className={cn("w-full mt-2", status === "current" ? "bg-primary" : "bg-muted")}>
                        {status === "current" ? "Start" : "Practice"}
                      </Button>
                    </Link>
                  )}
                </motion.div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

