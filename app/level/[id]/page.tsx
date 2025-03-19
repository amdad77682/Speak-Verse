import { GameHeader } from "@/components/game-header"
import { GameLevel } from "@/components/game-level"
import { getLevelData } from "@/lib/game-data"
import { notFound } from "next/navigation"

export default function LevelPage({ params }: { params: { id: string } }) {
  const levelId = Number.parseInt(params.id)

  if (isNaN(levelId) || levelId < 1 || levelId > 10) {
    notFound()
  }

  const levelData = getLevelData(levelId)

  if (!levelData) {
    notFound()
  }

  return (
    <div className="flex min-h-screen flex-col">
      <GameHeader />
      <main className="flex-1 container py-8">
        <div className="max-w-4xl mx-auto">
          <GameLevel level={levelData} />
        </div>
      </main>
    </div>
  )
}

