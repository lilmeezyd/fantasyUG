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
    <div>
      <div className="ranks">
        <div className="ld-1">
          <h4 style={{ fontWeight: 700 }}>
            {userInfo?.firstName}&nbsp;{userInfo?.lastName}
          </h4>
          <h5>{teamName}</h5>
        </div>
        <div>
          <h4 className="ld-2">Ranking</h4>
          <div className="my-ranking">
            <h5>Total points</h5>
            <div></div>
          </div>
          <div className="my-ranking">
            <h5>Overall rank</h5>
            <h5></h5>
          </div>
          <div className="my-ranking">
            <h5>Total players</h5>
            <div></div>
          </div>
          <div className="my-ranking">
            <h5>Matchday points</h5>
            <div></div>
          </div>
        </div>
      </div>

      <div className="ld">
        <div>
          <h4 className="ld-2">General Leagues</h4>
          <div className="my-leagues">
            <div></div>
            <h5>Rank</h5>
            <h5>League</h5>
          </div>
          {overallLeagues?.map((x) => (
            <div className="my-leagues" key={x._id}>
              <div></div>
              <h5>{x.currentRank}</h5>
              <h5>{x.name}</h5>
            </div>
          ))}
          {teamLeagues?.map((x) => (
            <div className="my-leagues" key={x._id}>
              <div></div>
              <h5>{x.currentRank}</h5>
              <h5>{teams?.find((team) => team._id === x.team)?.name}</h5>
            </div>
          ))}
        </div>
        <div>
          <h4 className="ld-2">Private Leagues</h4>
          {privateLeagues?.length === 0 ? (
            <h5 className="ld-1">Create or join a private league</h5>
          ) : (
            <>
              <div className="my-leagues">
                <div></div>
                <h5>Rank</h5>
                <h5>League</h5>
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
        <h4 className="ld-2">Finances</h4>
        <div className="my-ranking">
          <h5>Team value</h5>
          <h5>`UGX&nbsp;{teamValue?.toFixed(1)}`</h5>
        </div>
        <div className="my-ranking">
          <h5>In the bank</h5>
          <h5>`UGX&nbsp;{bank?.toFixed(1)}`</h5>
        </div>
      </div>
    </div>
  );
};

export default LeagueDetails;
