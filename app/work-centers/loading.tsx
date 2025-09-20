import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function WorkCentersLoading() {
  return (
    <div className="flex h-screen bg-background text-foreground">
      <div className="w-64 bg-card border-r border-border">
        <Skeleton className="h-full bg-muted" />
      </div>

      <main className="flex-1 overflow-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <Skeleton className="h-8 w-48 mb-2 bg-muted" />
              <Skeleton className="h-4 w-64 bg-muted" />
            </div>
            <Skeleton className="h-10 w-32 bg-muted" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="bg-card border-border">
                <CardContent className="p-4">
                  <Skeleton className="h-16 bg-muted" />
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="bg-card border-border">
                <CardHeader>
                  <Skeleton className="h-6 w-32 mb-2 bg-muted" />
                  <Skeleton className="h-4 w-20 bg-muted" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-32 bg-muted" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>

      <div className="w-64 bg-card border-l border-border">
        <Skeleton className="h-full bg-muted" />
      </div>
    </div>
  )
}
