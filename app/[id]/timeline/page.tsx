import { Suspense } from 'react'
import { getTeamTransfers } from '@/lib/fpl/operations/getTeamTransfers'
import { calculateTeamScores } from '@/lib/fpl/operations/calculateTeamScores'
import { calculateAlternateTimelines } from '@/lib/fpl/operations/calculateAlternateTimelines'
import { AlternateTimelineChart } from '@/components/alternate-timeline-chart'
import { TimelineStatsCard } from '@/components/timeline-stats-card'
import { AlternateTimelineLoading } from '@/components/alternate-timeline-loading'
import { ThemeToggle } from '@/components/theme-toggle'
import { PageNavigation } from '@/components/page-navigation'

export default async function Page({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const gameweekTeams = await getTeamTransfers(id)
    const teamScoreData = await calculateTeamScores(gameweekTeams)
    const alternateTimeline = await calculateAlternateTimelines(teamScoreData)

    return (
        <div className="min-h-screen bg-background dark:bg-[#0d0a08]">
            <div className="container mx-auto py-8 space-y-8">
                <div className="flex justify-between items-center">
                    <PageNavigation managerId={id} />
                    <ThemeToggle />
                </div>
                <div className="space-y-2">
                    <h1 className="text-4xl font-bold tracking-tight dark:text-[#ff9966]">FPL Team Timeline</h1>
                    <p className="text-muted-foreground dark:text-[#cc7744]">
                        Explore your team&apos;s journey and discover alternate timelines
                    </p>
                </div>
                <Suspense fallback={<AlternateTimelineLoading />}>
                    <div className="space-y-6">
                        <TimelineStatsCard timeline={alternateTimeline} teamScoreData={teamScoreData} />
                        <AlternateTimelineChart timeline={alternateTimeline} />
                    </div>
                </Suspense>
            </div>
        </div>
    )
}