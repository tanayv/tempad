export default function Loading() {
  return (
    <div className="min-h-screen bg-background dark:bg-[#0d0a08] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-gray-200 dark:border-[#8b4513] rounded-full"></div>
          <div className="absolute inset-0 border-4 border-t-primary dark:border-t-[#ff9966] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
        </div>
        <div className="text-center space-y-2">
          <p className="text-lg font-semibold text-foreground dark:text-[#ff9966] font-mono">LOADING FPL TIMELINE...</p>
          <p className="text-sm text-muted-foreground dark:text-[#cc7744] font-mono">Analyzing transfers and calculating scores</p>
        </div>
      </div>
    </div>
  )
}
