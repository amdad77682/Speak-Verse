import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Award, BarChart2, Clock, Mic, Trophy, Users } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Welcome back, Alex! Track your progress and continue your speaking journey.
          </p>
        </div>
        <Link href="/dashboard/play">
          <Button size="lg" className="gap-1.5">
            Continue Learning <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Level</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Level 3</div>
            <p className="text-xs text-muted-foreground">The Quick Thinker</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Speaking Score</CardTitle>
            <BarChart2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">72/100</div>
            <p className="text-xs text-muted-foreground">+12 from last week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Practice Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.5 hrs</div>
            <p className="text-xs text-muted-foreground">This week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Badges Earned</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7</div>
            <p className="text-xs text-muted-foreground">2 new this week</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Your Progress</CardTitle>
            <CardDescription>Track your journey through the 10 levels of SpeakVerse</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { level: 1, name: "The Echo Chamber", completed: true, score: 95 },
                { level: 2, name: "Sound Match", completed: true, score: 88 },
                { level: 3, name: "The Quick Thinker", completed: false, score: 65, current: true },
                { level: 4, name: "The Social Circle", completed: false, score: 0, locked: true },
                { level: 5, name: "The Debate Arena", completed: false, score: 0, locked: true },
              ].map((level) => (
                <div key={level.level} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                          level.completed
                            ? "bg-primary text-primary-foreground"
                            : level.current
                              ? "bg-primary/20 text-primary"
                              : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {level.level}
                      </div>
                      <span className="font-medium">{level.name}</span>
                      {level.current && (
                        <Badge variant="outline" className="ml-2">
                          Current
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm">
                      {level.completed ? (
                        <span className="text-green-500">Completed ({level.score}%)</span>
                      ) : level.locked ? (
                        <span className="text-muted-foreground">Locked</span>
                      ) : (
                        <span>{level.score}% complete</span>
                      )}
                    </div>
                  </div>
                  <Progress value={level.score} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Recent Achievements</CardTitle>
            <CardDescription>Your latest badges and milestones</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  title: "Pronunciation Pro",
                  description: "Achieved 90%+ accuracy in pronunciation exercises",
                  date: "2 days ago",
                  icon: <Mic className="h-4 w-4" />,
                },
                {
                  title: "Quick Responder",
                  description: "Answered 10 questions with less than 2 seconds hesitation",
                  date: "5 days ago",
                  icon: <Clock className="h-4 w-4" />,
                },
                {
                  title: "Helpful Mentor",
                  description: "Helped 3 beginners with their pronunciation",
                  date: "1 week ago",
                  icon: <Users className="h-4 w-4" />,
                },
              ].map((achievement, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                    {achievement.icon}
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">{achievement.title}</p>
                    <p className="text-sm text-muted-foreground">{achievement.description}</p>
                    <p className="text-xs text-muted-foreground">{achievement.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

