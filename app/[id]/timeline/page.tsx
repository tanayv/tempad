import { getTeamTransfers } from '@/lib/fpl/operations/getTeamTransfers'
import { calculateTeamScores } from '@/lib/fpl/operations/calculateTeamScores'
import { TeamDashboard } from '@/components/team-dashboard'

export default async function Page({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const gameweekTeams = await getTeamTransfers(id)
    const teamScoreData = await calculateTeamScores(gameweekTeams)

    return (
        <div className="min-h-screen bg-background">
            <TeamDashboard gameweekTeams={teamScoreData} />
        </div>
    )
}