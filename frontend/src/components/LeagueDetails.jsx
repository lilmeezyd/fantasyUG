import { useGetQuery } from "../slices/teamApiSlice";
import { useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
const LeagueDetails = (props) => {
  const { privateLeagues, overallLeagues, teamLeagues, teamName, teamValue, bank } = props;
  const { data: teams } = useGetQuery();
  const { userInfo } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  console.log(userInfo);
  return (
    <div className="league-details">
      <div className="ranks">
        <div className="ld-1">
          <h5 style={{ fontWeight: 700 }}>
            {userInfo?.firstName}&nbsp;{userInfo?.lastName}
          </h5>
          <div>{teamName}</div>
        </div>
        <div>
          <h5 className="ld-2">Ranking</h5>
          <div className="my-ranking">
            <div>Total points</div>
            <div></div>
          </div>
          <div className="my-ranking">
            <div>Overall rank</div>
            <div></div>
          </div>
          <div className="my-ranking">
            <div>Total players</div>
            <div></div>
          </div>
          <div className="my-ranking">
            <div>Matchday points</div>
            <div></div>
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
              <div></div>
              <div>{x.currentRank}</div>
              <div>{x.name}</div>
            </div>
          ))}
          {teamLeagues?.map((x) => (
            <div className="my-leagues" key={x._id}>
              <div></div>
              <div>{x.currentRank}</div>
              <div>{teams?.find((team) => team._id === x.team)?.name}</div>
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
                  <div></div>
                  <h6>{x.currentRank}</h6>
                  <h6>{x.name}</h6>
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
