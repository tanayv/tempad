import { getTeamTransfers } from '@/lib/fpl/operations/getTeamTransfers'
import { calculateTeamScores } from '@/lib/fpl/operations/calculateTeamScores'
import { TeamDashboard } from '@/components/team-dashboard'
import { ThemeToggle } from '@/components/theme-toggle'
import { PageNavigation } from '@/components/page-navigation'

export default async function PerformancePage({
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
                <div className="flex justify-between items-center">
                    <PageNavigation managerId={id} />
                    <ThemeToggle />
                </div>
                <div className="space-y-2">
                    <h1 className="text-4xl font-bold tracking-tight dark:text-[#ff9966]">Team Performance</h1>
                    <p className="text-muted-foreground dark:text-[#cc7744]">
                        Analyze your team composition and player performance across gameweeks
                    </p>
                </div>
                <TeamDashboard gameweekTeams={teamScoreData} />
            </div>
        </div>
    )
}