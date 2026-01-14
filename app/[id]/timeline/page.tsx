import { Suspense } from 'react'
import { getTeamTransfers } from '@/lib/fpl/operations/getTeamTransfers'
import { calculateTeamScores } from '@/lib/fpl/operations/calculateTeamScores'
import { TeamDashboard } from '@/components/team-dashboard'
import { AlternateTimelineWrapper } from '@/components/alternate-timeline-wrapper'
import { AlternateTimelineLoading } from '@/components/alternate-timeline-loading'
import { ThemeToggle } from '@/components/theme-toggle'

export default async function Page({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const gameweekTeams = await getTeamTransfers(id)
    const teamScoreData = await calculateTeamScores(gameweekTeams)

    return (
        <div className="min-h-screen bg-background dark:bg-[#0d0a08]">
            <div className="container mx-auto py-8 space-y-8">
                <div className="flex justify-end">
                    <ThemeToggle />
                </div>
                <Suspense fallback={<AlternateTimelineLoading />}>
                    <AlternateTimelineWrapper teamScoreData={teamScoreData} />
                </Suspense>
                <TeamDashboard gameweekTeams={teamScoreData} />
            </div>
        </div>
    )
}