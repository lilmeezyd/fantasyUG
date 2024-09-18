import LeagueDetails from "../components/LeagueDetails";
import FixtureList from "../components/FixtureList";
import { Container, Spinner } from "react-bootstrap";
import { useGetManagerInfoQuery } from "../slices/managerInfoApiSlice";
import { useSelector } from 'react-redux'
import { useGetLivePicksQuery } from '../slices/livePicksApiSlice'
import { useGetPicksQuery } from "../slices/picksSlice";
import { useGetMatchdaysQuery } from "../slices/matchdayApiSlice";
import ManagerLivePicks from '../components/ManagerLivePicks'

const Points = () => {
  const { userInfo } = useSelector((state) => state.auth)
  const { data: picks, isLoading } = useGetLivePicksQuery(userInfo?._id)
  const { data: managerInfo } = useGetManagerInfoQuery();
  const { data: managerPicks } = useGetPicksQuery();
  const { data: matchdays } = useGetMatchdaysQuery()
  if(isLoading) {
    <div className="spinner">
      <Spinner />
    </div>
  }
  return (
    picks?.length > 0 ? 
    <>
    <div className="main">
      {picks?.map((pick, idx) => <div key={idx+1}>
        {pick?.livePicks?.map((lp) => <div key={lp.matchday}>
          <div>
          <div>Matchday&nbsp;{lp?.matchday}</div>
          <div>Points&nbsp;{+lp?.matchdayPoints}</div>
          <div>Rank&nbsp;{lp?.matchdayRank === null ? `-` : lp?.matchdayRank}</div>
          <div>Average {matchdays?.find(x => x.id === lp?.matchday)?.avergeScore}</div>
          <div>Highest {matchdays?.find(x => x.id === lp?.matchday)?.highestScore}</div>
          </div>

          <ManagerLivePicks matchday={lp?.matchday} 
          matchdayId={lp?.matchdayId}
           isLoading={isLoading} picks={lp?.picks}/>
        </div>)}
      </div>
      )}
      <LeagueDetails privateLeagues={managerInfo?.privateLeagues}
        teamLeagues={managerInfo?.teamLeagues}
        overallLeagues={managerInfo?.overallLeagues}
        teamName={managerInfo?.teamName}
        teamValue={managerPicks?.teamValue}
        bank={managerPicks?.bank}
         />
      </div>
      <Container className="main">
        <FixtureList mdParam={'current'} />
      </Container>
      </> : 
      <div className='tx-center'>Live scores will appear here when matchday starts!</div>
    
  )
}

export default Points