import { useGetQuery } from "../slices/teamApiSlice";
import { useGetPlayerQuery } from "../slices/playerApiSlice";
import { useGetPlayersQuery } from "../slices/playerApiSlice";

const MDStar = (props) => {
  const { id, _id, topPlayer } = props;
  const { data: player } = useGetPlayerQuery(topPlayer);
  const { data: players } = useGetPlayersQuery();
  const { data: teams } = useGetQuery();
  const appName = players?.find((play) => play._id === topPlayer)?.appName;
  const nowCost = players?.find((play) => play._id === topPlayer)?.nowCost;
  const image = teams?.find((team) => team?._id === player?.playerTeam)?.code;
  const points = player?.results?.filter((x) => x?.matchday === _id)?.reduce((a,b) => a+b.totalPoints,0);
  const handleShow = () => {};
  return (
    <>
      {topPlayer ? (
        <div className="button-wrapper" id={topPlayer}>
          <div className="next-fix">&#163;{nowCost?.toFixed(1)}M</div>
          <button className="player-btn" onClick={handleShow}>
            <img
              src={`../shirt_${image}-66.svg`}
              className="image_pic"
              alt={appName}
            />
            <div className="player-name">
              <div className="data_name">{appName}</div>
              <div style={{ fontWeight: 700 }} className="data_fixtures">
                <div>{points}</div>
                <div>MD&nbsp;{id}</div>
              </div>
            </div>
          </button>
        </div>
      ) : (
        <div className="button-wrapper">
          <button className="player-btn empty-btn">
            <img
              src={`../shirt_0-66.svg`}
              className="image_pic"
              alt="default"
            />
            <div className="player-name">
              <div style={{ color: "black" }}>MD&nbsp;{id}</div>
            </div>
          </button>
        </div>
      )}
    </>
  );
};

export default MDStar;
