import { KioskInterface } from "@/components/kiosk-interface"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Settings, BarChart3, UserPlus } from "lucide-react"

export default function HomePage() {
  return (
    <div className="relative text-red-600">
      {/* Admin Links - Top Right */}
      <div className="absolute top-2 right-3 flex gap-1.5 z-10 text-red-600">
        <Link href="/register">
          <Button
            variant="outline"
            size="sm"
            className="text-red-600 border-red-500 hover:bg-red-50 text-xs py-1 px-2"
          >
            <UserPlus className="mr-1 h-3 w-3" />
            Register
          </Button>
        </Link>
        <Link href="/public">
          <Button
            variant="outline"
            size="sm"
            className="text-red-600 border-red-500 hover:bg-red-50 text-xs py-1 px-2"
          >
            <BarChart3 className="mr-1 h-3 w-3" />
            Dashboard
          </Button>
        </Link>
        <Link href="/supervisor">
          <Button
            variant="outline"
            size="sm"
            className="text-red-600 border-red-500 hover:bg-red-50 text-xs py-1 px-2"
          >
            <Settings className="mr-1 h-3 w-3" />
            Supervisor
          </Button>
        </Link>
      </div>

      {/* Main Kiosk Interface */}
      <KioskInterface />
    </div>
  )
}