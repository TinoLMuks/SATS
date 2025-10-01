import { PublicDashboard } from "@/components/public-dashboard"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Home } from "lucide-react"

export default function PublicPage() {
  return (
    <div className="relative">
      {/* Back to Home */}
      <div className="absolute top-4 left-4 z-10">
        <Link href="/">
          <Button variant="outline" size="sm">
            <Home className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>
      </div>

      <PublicDashboard />
    </div>
  )
}
