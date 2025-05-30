import { useState, useMemo, useEffect } from "react";
import LeagueDetails from "../components/LeagueDetails";
import FixtureList from "../components/FixtureList";
import { Link } from "react-router-dom";
import { Container, Spinner } from "react-bootstrap";
import { useGetManagerInfoQuery } from "../slices/managerInfoApiSlice";
import { useSelector } from 'react-redux'
import { useGetLivePicksQuery } from '../slices/livePicksApiSlice'
import { useGetPicksQuery } from "../slices/picksSlice";
import { useGetMatchdaysQuery } from "../slices/matchdayApiSlice";
import ManagerLivePicks from '../components/ManagerLivePicks'
import {
  BsChevronLeft,
  BsChevronRight
} from "react-icons/bs";

const Points = () => {
  const [ pageDetails, setPageDetails ] = useState({page: null, min: null, max: null})
  const { userInfo } = useSelector((state) => state.auth)
  const { data: picksDetails, isLoading, isSuccess } = useGetLivePicksQuery(userInfo?._id)
  const { data: managerInfo } = useGetManagerInfoQuery(userInfo?._id);
  const { data: managerPicks } = useGetPicksQuery(userInfo?._id);
  const { data: matchdays } = useGetMatchdaysQuery()
  const { page, min, max } = pageDetails
  useEffect(() => {
    const a = []
    picksDetails?.picks?.forEach(x => {
        a.push(...x.livePicks)})
    
      const minimum = Math.min(...a.map(x => x.matchday))
      const maximum = Math.max(...a.map(x => x.matchday))
      setPageDetails(prev => ({...prev, page: maximum, min: minimum, max: maximum}))
  }, [matchdays, picksDetails])
  
  const realPicks = useMemo(() => 
    {
      const a = []
      picksDetails?.picks?.forEach(x => {
        a.push(...x.livePicks)})
        return a.filter(x => x.matchday === +page)
    }, [picksDetails, page])
  const onDecrement = () => {
    setPageDetails(prev => ({...prev, page: prev.page-1}))
  };

  const onIncrement = () => {
    setPageDetails(prev => ({...prev, page: prev.page+1}))
  };
  if(isLoading && picksDetails === undefined) {
    return (
    <div className="spinner">
      <Spinner />
    </div>
    )
  }
  if(isSuccess && picksDetails?.picks?.length === 0) {
    return (
    <div className='tx-center'>Live scores will appear here when matchday starts!</div>
    )
  }
  return (
    <>
    {picksDetails?.picks?.length > 0 && matchdays?.length > 0 && 
    <>
    <div className="main">
    <section className="btn-wrapper p-2">
        <button
          disabled={page === min ? true : false}
          onClick={onDecrement}
          className={`${page === +min && "btn-hide"} btn-controls`}
          id="prevButton"
        >
          <BsChevronLeft />
        </button>
        <button
          disabled={page === +max ? true : false}
          onClick={onIncrement}
          className={`${page === +max && "btn-hide"} btn-controls`}
          id="nextButton"
        >
          <BsChevronRight />
        </button>
      </section>
      </div>
    <div className="main">
        {realPicks?.map((lp) => <div key={lp.matchday}>
          <div className="pt-matchday">
          <div>Matchday&nbsp;{lp?.matchday}</div>
          </div>
          <div className="pt-md-wrapper">
          <div className="pt-points"><div>Points</div><div>{+lp?.matchdayPoints}</div></div>
          <div className="pt-rank">
          <div><div>Rank</div><div>{lp?.matchdayRank === null ? `-` : lp?.matchdayRank}</div></div>
          </div>
          <div className="pt-ht-av">
          <div><div>Average</div><div> {matchdays?.find(x => x.id === lp?.matchday)?.avergeScore.toFixed(0)}</div></div>
          <Link to={`/points/${matchdays?.find(x => x.id === lp?.matchday)?.highestScoringEntry}`}>
          <div><div>Highest</div><div> {matchdays?.find(x => x.id === lp?.matchday)?.highestScore}</div></div>
          </Link>
          </div>
          </div>

          <ManagerLivePicks matchday={lp?.matchday} 
          matchdayId={lp?.matchdayId}
          automaticSubs={lp?.automaticSubs}
           isLoading={isLoading} picks={lp?.picks}/>
        </div>)}
      <LeagueDetails
      firstName={picksDetails?.managerInfo?.firstName}
      lastName={picksDetails?.managerInfo?.lastName}
       privateLeagues={managerInfo?.privateLeagues}
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
        <FixtureList mdParam={page} />
      </Container>
      </>}
      </>
    
  )
}

export default Points
