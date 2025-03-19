import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowRight, Play, Repeat } from "lucide-react"
import { GameInterface } from "@/components/game/game-interface"

export default function PlayPage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Level 3: The Quick Thinker</h2>
        <p className="text-muted-foreground">Train to speak without hesitation with timed prompts</p>
      </div>

      <Tabs defaultValue="play" className="space-y-4">
        <TabsList>
          <TabsTrigger value="play">Play</TabsTrigger>
          <TabsTrigger value="instructions">Instructions</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
        </TabsList>
        <TabsContent value="play" className="space-y-4">
          <GameInterface />
        </TabsContent>
        <TabsContent value="instructions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Level 3: The Quick Thinker</CardTitle>
              <CardDescription>Train yourself to speak without hesitation using timed prompts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-medium">Objective</h3>
                <p className="text-muted-foreground">
                  In this level, you'll practice responding to random prompts quickly and fluently. The AI will detect
                  pauses, fillers ("um", "uh"), and your speaking speed.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium">How to Play</h3>
                <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                  <li>The AI will present you with a random topic or question</li>
                  <li>You have 20 seconds to respond to the prompt</li>
                  <li>Try to speak continuously without long pauses or filler words</li>
                  <li>The AI will analyze your fluency and provide feedback</li>
                  <li>Complete 5 prompts to advance to the next level</li>
                </ol>
              </div>
              <div>
                <h3 className="text-lg font-medium">Success Criteria</h3>
                <p className="text-muted-foreground">To complete this level, you need to:</p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Answer 5 questions within 20 seconds each</li>
                  <li>Have less than 3 hesitations per response</li>
                  <li>Maintain a consistent speaking pace</li>
                </ul>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="gap-1.5">
                Start Challenge <Play className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="progress" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Progress</CardTitle>
              <CardDescription>Track your performance in Level 3</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-medium">Completed Challenges</h3>
                <div className="mt-2 space-y-3">
                  {[
                    {
                      prompt: "Describe your hometown and what makes it special",
                      score: 85,
                      feedback: "Good fluency, minimal hesitation. Work on varying your sentence structure.",
                      date: "Yesterday",
                    },
                    {
                      prompt: "Talk about your favorite hobby and why you enjoy it",
                      score: 78,
                      feedback: "Some hesitation detected. Good vocabulary but try to reduce filler words.",
                      date: "2 days ago",
                    },
                  ].map((challenge, index) => (
                    <div key={index} className="rounded-lg border p-3">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{challenge.prompt}</p>
                        <Badge variant={challenge.score >= 80 ? "default" : "outline"}>{challenge.score}%</Badge>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{challenge.feedback}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{challenge.date}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium">Areas for Improvement</h3>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Reducing filler words (um, uh)</span>
                    <span className="text-sm font-medium">Needs work</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Speaking pace consistency</span>
                    <span className="text-sm font-medium">Good</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Response organization</span>
                    <span className="text-sm font-medium">Excellent</span>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" className="gap-1.5">
                <Repeat className="h-4 w-4" /> Practice Weak Areas
              </Button>
              <Button className="gap-1.5">
                Continue <ArrowRight className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

