"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { BarChart2, BookOpen, Home, Mic, Settings, Trophy, Users } from "lucide-react"

const items = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: Home,
  },
  {
    name: "Play Game",
    href: "/dashboard/play",
    icon: Mic,
  },
  {
    name: "Progress",
    href: "/dashboard/progress",
    icon: BarChart2,
  },
  {
    name: "Leaderboard",
    href: "/dashboard/leaderboard",
    icon: Trophy,
  },
  {
    name: "Community",
    href: "/dashboard/community",
    icon: Users,
  },
  {
    name: "Learning Resources",
    href: "/dashboard/resources",
    icon: BookOpen,
  },
  {
    name: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="hidden border-r bg-muted/40 md:block">
      <div className="flex h-full max-h-screen flex-col gap-2 p-4">
        <div className="flex-1 overflow-auto py-2">
          <nav className="grid items-start gap-2">
            {items.map((item, index) => {
              const Icon = item.icon
              return (
                <Link
                  key={index}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted",
                    pathname === item.href ? "bg-muted" : "transparent",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>
        <div className="mt-auto">
          <Button variant="outline" className="w-full justify-start gap-2">
            <Mic className="h-4 w-4" />
            Need Help?
          </Button>
        </div>
      </div>
    </div>
  )
}

