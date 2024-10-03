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
  const { data: picks, isLoading, isSuccess } = useGetLivePicksQuery(userInfo?._id)
  const { data: managerInfo } = useGetManagerInfoQuery();
  const { data: managerPicks } = useGetPicksQuery();
  const { data: matchdays } = useGetMatchdaysQuery()
  if(isLoading && picks === undefined) {
    return (
    <div className="spinner">
      <Spinner />
    </div>
    )
  }
  if(isSuccess && picks?.length === 0) {
    return (
    <div className='tx-center'>Live scores will appear here when matchday starts!</div>
    )
  }
  return (
    <>
    {picks?.length > 0 &&
    <> 
    <div className="main">
      {picks?.map((pick, idx) => <div key={idx+1}>
        {pick?.livePicks?.map((lp) => <div key={lp.matchday}>
          <div className="pt-matchday">
          <div>Matchday&nbsp;{lp?.matchday}</div>
          </div>
          <div className="pt-md-wrapper">
          <div className="pt-points"><div>Points</div><div>{+lp?.matchdayPoints}</div></div>
          <div className="pt-rank">
          <div><div>Rank</div><div>{lp?.matchdayRank === null ? `-` : lp?.matchdayRank}</div></div>
          </div>
          <div className="pt-ht-av">
          <div><div>Average</div><div> {matchdays?.find(x => x.id === lp?.matchday)?.avergeScore}</div></div>
          <div><div>Highest</div><div> {matchdays?.find(x => x.id === lp?.matchday)?.highestScore}</div></div>
          </div>
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
        matchdayPoints={managerInfo?.matchdayPoints}
        overallPoints={managerInfo?.overallPoints}
        overallRank={managerInfo?.overallRank}
         />
      </div>
      <Container className="main">
        <FixtureList mdParam={'current'} />
      </Container>
      </>}
      </>
    
  )
}

export default Points