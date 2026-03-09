import { useState, useMemo, useEffect } from "react";
import LeagueDetails from "../components/LeagueDetails";
import FixtureList from "../components/FixtureList";
import { Link } from "react-router-dom";
import { Container, Spinner } from "react-bootstrap";
import { useGetManagerInfoQuery } from "../slices/managerInfoApiSlice";
import { useSelector } from "react-redux"; 
import {
  useGetRoundQuery,
} from "../slices/livePicksApiSlice";
import { useGetPicksQuery } from "../slices/picksSlice";
import { useGetMatchdaysQuery, useGetCurrentMDQuery, useGetMatchdayMaxNMinQuery } from "../slices/matchdayApiSlice";
import ManagerLivePicks from "../components/ManagerLivePicks";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";
import { useParams, useNavigate } from "react-router-dom";

const Points = () => {
  const { id, mid } = useParams();
  const matchday = Number(mid);
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);
  const { data: managerInfo } = useGetManagerInfoQuery(id);
  const { data: matchdayData = {} } = useGetCurrentMDQuery();
  const { data: roundPicks, isLoading: roundLoading, isSuccess } = useGetRoundQuery({
    id,
    mid,
  });
  const { data: matchdays } = useGetMatchdaysQuery();
  const min = +roundPicks?.matchdayJoined;
  const max = matchdayData;

  const navigateToMatchday = (day) => {
    //const base = userInfo?.roles?.ADMIN ? "/admin" : "/predictions";
    navigate(`/points/${id}/matchday/${day}`);
  };
  if (roundLoading) {
    return (
      <div className="spinner">
        <Spinner />
      </div>
    );
  }
  if (!roundPicks) {
    return (
      <div className="tx-center">
        Live scores will appear here when matchday starts!
      </div>
    );
  }
  return (
    <>
      {roundPicks && matchdays?.length > 0 && (
        <>
          <div className="main">
            <section className="btn-wrapper p-2">
              <button
                disabled={matchday <= min}
                onClick={() => navigateToMatchday(matchday - 1)}
                className={`${matchday === +min && "btn-hide"} btn-controls`}
                id="prevButton"
              >
                <BsChevronLeft />
              </button>
              <button
                disabled={matchday >= max}
                onClick={() => navigateToMatchday(matchday + 1)}
                className={`${matchday === +max && "btn-hide"} btn-controls`}
                id="nextButton"
              >
                <BsChevronRight />
              </button>
            </section>
          </div>
          <div className="main">
            <div>
              <div className="pt-matchday">
                <div>Matchday&nbsp;{roundPicks?.livePicks?.matchday}</div>
              </div>
              <div className="pt-md-wrapper">
                <div className="pt-points">
                  <div>Points</div>
                  <div>{roundPicks?.livePicks?.matchdayPoints ?? '0'}</div>
                </div>
                <div className="pt-rank">
                  <div>
                    <div>Rank</div>
                    <div>
                      {roundPicks?.livePicks?.matchdayRank === null
                        ? `-`
                        : roundPicks?.livePicks?.matchdayRank}
                    </div>
                  </div>
                </div>
                <div className="pt-ht-av">
                    <div>
                      <div>Average</div>
                      <div>
                        {" "}
                        {matchdays
                          ?.find((x) => x.id === roundPicks?.livePicks?.matchday)
                          ?.averageScore.toFixed(0)}
                      </div>
                    </div>
                    {matchdays?.find((x) => x.id === roundPicks?.livePicks?.matchday)
                      ?.highestScore > 0 && (
                      <Link
                        to={`/points/${
                          matchdays?.find((x) => x.id === roundPicks?.livePicks?.matchday)
                            ?.highestScoringEntry
                        }/matchday/${mid}`}
                      >
                        <div>
                          <div>Highest</div>
                          <div>
                            {" "}
                            {
                              matchdays?.find((x) => x.id === roundPicks?.livePicks?.matchday)
                                ?.highestScore
                            }
                          </div>
                        </div>
                      </Link>
                    )}
                  </div> 
              </div>

              <ManagerLivePicks
                  matchday={roundPicks?.livePicks?.matchday}
                  matchdayId={roundPicks?.livePicks?.matchdayId}
                  automaticSubs={roundPicks?.livePicks?.automaticSubs}
                  picks={roundPicks?.livePicks?.picks}
                />
            </div>
            <LeagueDetails
              firstName={managerInfo?.firstName}
              lastName={managerInfo?.lastName}
              privateLeagues={managerInfo?.privateLeagues}
              teamLeagues={managerInfo?.teamLeagues}
              overallLeagues={managerInfo?.overallLeagues}
              teamName={managerInfo?.teamName}
              teamValue={managerInfo?.teamValue}
              bank={managerInfo?.bank}
              matchdayPoints={managerInfo?.matchdayPoints}
              overallPoints={managerInfo?.overallPoints}
              overallRank={managerInfo?.overallRank} 
              id={id}
            />
          </div>
          <Container className="main">
            <FixtureList mdParam={mid} />
          </Container>
        </>
      )}
    </>
  );
};

export default Points;
