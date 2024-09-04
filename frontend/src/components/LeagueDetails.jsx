import { useGetQuery } from "../slices/teamApiSlice";
import { useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
const LeagueDetails = (props) => {
  const { privateLeagues, overallLeagues, teamLeagues, teamName } = props;
  const { data: teams } = useGetQuery();
  const { userInfo } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  console.log(userInfo);
  return (
    <div>
      <div>
        <div>
          <h5>
            {userInfo?.firstName}&nbsp;{userInfo?.lastName}
          </h5>
          <h5>{teamName}</h5>
        </div>
        <div>
        <h4>Ranking</h4>
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

      <div>
        <div>
          <h4>General Leagues</h4>
          <div className="my-leagues">
            <div></div>
            <h5>Rank</h5>
            <h5>League</h5>
          </div>
          {overallLeagues?.map((x) => (
            <div className="my-leagues" key={x._id}>
              <div></div>
              <h6>{x.currentRank}</h6>
              <h6>{x.name}</h6>
            </div>
          ))}
          {teamLeagues?.map((x) => (
            <div className="my-leagues" key={x._id}>
              <div></div>
              <h6>{x.currentRank}</h6>
              <h6>{teams?.find((team) => team._id === x.team)?.name}</h6>
            </div>
          ))}
        </div>
        <div>
          <h4>Private Leagues</h4>
          {privateLeagues?.length === 0 ? (
            <h6>Create or join a private league</h6>
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
    </div>
  );
};

export default LeagueDetails;
