export default function Loading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
        </div>
        <div className="text-center space-y-2">
          <p className="text-lg font-semibold text-foreground">Loading your FPL timeline...</p>
          <p className="text-sm text-muted-foreground">Analyzing transfers and calculating scores</p>
        </div>
      </div>
    </div>
  )
}
