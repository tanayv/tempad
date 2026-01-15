import { calculateAlternateTimelines } from '@/lib/fpl/operations/calculateAlternateTimelines'
import { TeamScoreData } from '@/lib/fpl/operations/calculateTeamScores'
import { AlternateTimelineChart } from '@/components/alternate-timeline-chart'
import { TimelineStatsCard } from '@/components/timeline-stats-card'

interface AlternateTimelineWrapperProps {
  teamScoreData: TeamScoreData[]
}

export async function AlternateTimelineWrapper({ teamScoreData }: AlternateTimelineWrapperProps) {
  const alternateTimeline = await calculateAlternateTimelines(teamScoreData)

  return (
    <div className="space-y-6">
      <TimelineStatsCard timeline={alternateTimeline} teamScoreData={teamScoreData} />
      <AlternateTimelineChart timeline={alternateTimeline} />
    </div>
  )
}
