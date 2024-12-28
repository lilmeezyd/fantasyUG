import { useGetQuery } from "../slices/teamApiSlice";
import { useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { useGetTotalQuery } from "../slices/userApiSlice";
import { AiFillCaretRight, AiFillCaretDown, AiFillCaretUp } from "react-icons/ai";
const LeagueDetails = (props) => {
  const { privateLeagues, overallLeagues, teamLeagues, teamName, teamValue, bank,
    overallPoints, matchdayPoints, overallRank, firstName, lastName
   } = props;
   console.log(overallLeagues)
  const { data: teams } = useGetQuery();
  const { data: totalPlayers } = useGetTotalQuery()
  const { userInfo } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  return ( 
    <div className="league-details"> 
      <div className="ranks">
        <div className="ld-1">
          <h5 style={{ fontWeight: 700 }}>
            {firstName}&nbsp;{lastName}
          </h5>
          <div>{teamName}</div>
        </div>
        <div>
          <h5 className="ld-2">Ranking</h5>
          <div className="my-ranking">
            <div>Total points</div>
            <div>{overallPoints}</div>
          </div>
          <div className="my-ranking">
            <div>Overall rank</div>
            <div>{overallRank === null ? '-' : overallRank}</div>
          </div>
          <div className="my-ranking">
            <div>Total players</div>
            <div>{totalPlayers?.total}</div>
          </div>
          <div className="my-ranking">
            <div>Matchday points</div>
            <div>{matchdayPoints}</div>
          </div>
        </div>
      </div>

      <div className="ld">
        <div>
          <h5 className="ld-2">General Leagues</h5>
          <div className="my-leagues">
            <div></div>
            <div>Rank</div>
            <div>League</div>
          </div>
          {overallLeagues?.map((x) => (
            <div className="my-leagues" key={x._id}>
              <div>
                {(x.currentRank === x.lastRank || x.lastRank === null) && <AiFillCaretRight color="#aaa"/> }
                {x.currentRank < x.lastRank && x.lastRank !== null && <AiFillCaretUp color="green" />} 
                {x.currentRank > x.lastRank && x.lastRank !== null  && <AiFillCaretDown color="red" />}
              </div>
              <h6>{x.currentRank === null ? '-' : x.currentRank}</h6>
              <Link to={`/userleagues/overall/${x.id}`}><h6>{x.name}</h6></Link>
            </div>
          ))}
          {teamLeagues?.map((x) => (
            <div className="my-leagues" key={x._id}>
              <div>
              {(x.currentRank === x.lastRank || x.lastRank === null) && <AiFillCaretRight color="#aaa"/> }
                {x.currentRank < x.lastRank && x.lastRank !== null && <AiFillCaretUp color="green" />} 
                {x.currentRank > x.lastRank && x.lastRank !== null  && <AiFillCaretDown color="red" />}
              </div>
              <h6>{x.currentRank === null ? '-' : x.currentRank}</h6>
              <Link to={`/userleagues/team/${x.id}`}><h6>{teams?.find((team) => team._id === x.team)?.name}</h6></Link>
            </div>
          ))}
        </div>
        <div>
          <h5 className="ld-2">Private Leagues</h5>
          {privateLeagues?.length === 0 ? (
            <div className="ld-1">Create or join a private league</div>
          ) : (
            <>
              <div className="my-leagues">
                <div></div>
                <div>Rank</div>
                <div>League</div>
              </div>
              {privateLeagues?.map((x) => (
                <div className="my-leagues" key={x._id}>
                  <div>
                  {x.currentRank === x.lastRank ? <AiFillCaretRight color="#aaa"/> : 
                x.currentRank > x.lastRank ? <AiFillCaretUp color="green" /> : 
                <AiFillCaretDown color="red" />}
                  </div>
                  <h6>{x.currentRank === null ? '-' : x.currentRank}</h6>
                  <Link to={`/userleagues/private/${x.id}`}><h6>{x.name}</h6></Link>
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      <div className="ld">
        <h5 className="ld-2">Finances</h5>
        <div className="my-ranking">
          <div>Team value</div>
          <div>UGX&nbsp;{teamValue?.toFixed(1)}M</div>
        </div>
        <div className="my-ranking">
          <div>In the bank</div>
          <div>UGX&nbsp;{bank?.toFixed(1)}M</div>
        </div>
      </div>
    </div>
  );
};

export default LeagueDetails;
