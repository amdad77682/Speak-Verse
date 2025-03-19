import { GameHeader } from "@/components/game-header"
import { DuolingoLevelSelector } from "@/components/duolingo-level-selector"
import { GameStats } from "@/components/game-stats"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <GameHeader />
      <main className="flex-1 container py-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold mb-3">SpeakVerse</h1>
            <p className="text-xl text-muted-foreground">Master your speaking skills through 10 exciting levels</p>
          </div>
          <GameStats />
          <DuolingoLevelSelector />
        </div>
      </main>
    </div>
  )
}

