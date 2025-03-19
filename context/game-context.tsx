"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"

interface GameContextType {
  playerName: string
  playerLevel: number
  levelProgress: Record<number, number>
  completeLevel: (levelId: number, score: number) => void
  resetProgress: () => void
}

const GameContext = createContext<GameContextType>({
  playerName: "Player",
  playerLevel: 1,
  levelProgress: {},
  completeLevel: () => {},
  resetProgress: () => {},
})

export const useGameContext = () => useContext(GameContext)

export function GameProvider({ children }: { children: ReactNode }) {
  const [playerName, setPlayerName] = useState("Player")
  const [playerLevel, setPlayerLevel] = useState(1)
  const [levelProgress, setLevelProgress] = useState<Record<number, number>>({})
  const [isInitialized, setIsInitialized] = useState(false)

  // Load saved progress from localStorage on initial render
  useEffect(() => {
    // Only run this effect on the client side
    if (typeof window !== "undefined") {
      const savedName = localStorage.getItem("speakverse_player_name")
      const savedLevel = localStorage.getItem("speakverse_player_level")
      const savedProgress = localStorage.getItem("speakverse_level_progress")

      if (savedName) setPlayerName(savedName)
      if (savedLevel) setPlayerLevel(Number.parseInt(savedLevel))
      if (savedProgress) setLevelProgress(JSON.parse(savedProgress))

      setIsInitialized(true)
    }
  }, [])

  // Save progress to localStorage whenever it changes
  useEffect(() => {
    // Only save to localStorage if the component has been initialized
    // This prevents saving default values before loading from localStorage
    if (isInitialized && typeof window !== "undefined") {
      localStorage.setItem("speakverse_player_name", playerName)
      localStorage.setItem("speakverse_player_level", playerLevel.toString())
      localStorage.setItem("speakverse_level_progress", JSON.stringify(levelProgress))
    }
  }, [playerName, playerLevel, levelProgress, isInitialized])

  // Use useCallback to memoize the completeLevel function
  const completeLevel = useCallback((levelId: number, score: number) => {
    // Update level progress
    setLevelProgress((prev) => {
      // Only update if the new score is higher than the existing one
      const currentScore = prev[levelId] || 0
      if (score <= currentScore) return prev

      return {
        ...prev,
        [levelId]: score,
      }
    })

    // If this is the current level and score is good enough, unlock next level
    setPlayerLevel((prev) => {
      if (levelId === prev && score >= 70) {
        return Math.min(prev + 1, 10)
      }
      return prev
    })
  }, [])

  const resetProgress = useCallback(() => {
    if (confirm("Are you sure you want to reset all progress? This cannot be undone.")) {
      setPlayerLevel(1)
      setLevelProgress({})
      localStorage.removeItem("speakverse_player_level")
      localStorage.removeItem("speakverse_level_progress")
    }
  }, [])

  return (
    <GameContext.Provider
      value={{
        playerName,
        playerLevel,
        levelProgress,
        completeLevel,
        resetProgress,
      }}
    >
      {children}
    </GameContext.Provider>
  )
}

