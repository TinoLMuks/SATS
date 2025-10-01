import { KioskInterface } from "@/components/kiosk-interface"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Settings, BarChart3, UserPlus } from "lucide-react"

export default function HomePage() {
  return (
    <div className="relative">
      {/* Admin Links - Top Right */}
      <div className="absolute top-4 right-4 flex gap-2 z-10">
        <Link href="/register">
          <Button variant="outline" size="sm">
            <UserPlus className="mr-2 h-4 w-4" />
            Register
          </Button>
        </Link>
        <Link href="/public">
          <Button variant="outline" size="sm">
            <BarChart3 className="mr-2 h-4 w-4" />
            Dashboard
          </Button>
        </Link>
        <Link href="/supervisor">
          <Button variant="outline" size="sm">
            <Settings className="mr-2 h-4 w-4" />
            Supervisor
          </Button>
        </Link>
      </div>

      {/* Main Kiosk Interface */}
      <KioskInterface />
    </div>
  )
}
