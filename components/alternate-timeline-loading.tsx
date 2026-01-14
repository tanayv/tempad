import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function AlternateTimelineLoading() {
  return (
    <Card className="w-full dark:bg-[#1a0f0a] dark:border-[#8b4513]">
      <CardHeader className="dark:border-b dark:border-[#8b4513]">
        <CardTitle className="dark:text-[#ff9966] font-mono">ALTERNATE TIMELINE ANALYSIS</CardTitle>
        <CardDescription className="dark:text-[#cc7744] font-mono">
          Cumulative scores showing what would have happened if you froze your team at each gameweek
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center h-[400px]">
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 border-4 border-gray-200 dark:border-[#8b4513] rounded-full"></div>
              <div className="absolute inset-0 border-4 border-t-primary dark:border-t-[#ff9966] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-sm text-muted-foreground dark:text-[#cc7744] font-mono">CALCULATING ALTERNATE TIMELINES...</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
