import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function Loading() {
  return (
    <div className="min-h-screen bg-background dark:bg-[#0d0a08]">
      <div className="container mx-auto py-8 space-y-8">
        <div className="flex justify-end">
          <Skeleton className="h-10 w-20" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-12 w-80" />
          <Skeleton className="h-6 w-96" />
        </div>

        {/* Performance Dashboard Loading */}
        <div className="space-y-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="dark:bg-[#1a0f0a] dark:border-[#8b4513]">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <Skeleton className="h-8 w-32" />
                  <Skeleton className="h-6 w-24" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5, 6].map((j) => (
                    <div key={j} className="flex justify-between items-center">
                      <div className="flex items-center space-x-3">
                        <Skeleton className="h-8 w-8 rounded" />
                        <Skeleton className="h-6 w-32" />
                      </div>
                      <div className="flex space-x-2">
                        <Skeleton className="h-6 w-12" />
                        <Skeleton className="h-6 w-16" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}