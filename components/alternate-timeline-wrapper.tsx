import { calculateAlternateTimelines } from '@/lib/fpl/operations/calculateAlternateTimelines'
import { TeamScoreData } from '@/lib/fpl/operations/calculateTeamScores'
import { AlternateTimelineChart } from '@/components/alternate-timeline-chart'

interface AlternateTimelineWrapperProps {
  teamScoreData: TeamScoreData[]
}

export async function AlternateTimelineWrapper({ teamScoreData }: AlternateTimelineWrapperProps) {
  const alternateTimeline = await calculateAlternateTimelines(teamScoreData)

  return <AlternateTimelineChart timeline={alternateTimeline} />
}
