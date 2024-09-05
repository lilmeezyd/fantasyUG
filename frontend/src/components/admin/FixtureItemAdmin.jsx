import { useState } from "react";
import { useGetQuery } from "../../slices/teamApiSlice";
import getTime from "../../utils/getTime";
import { getPm, getPmString } from "../../utils/getPm";
import { Button } from "react-bootstrap";

const FixtureItemAdmin = (props) => {
  const { x, editFixturePop, deleteFixturePop } = props;

  const [stats, displayStats] = useState(false);
  const { data: teams } = useGetQuery();

  const onClick = () => {
    displayStats((prevState) => !prevState);
  };
  return (
    <>
    <div
      onClick={() => onClick()}
      className={`${stats && "bg-teams"} teams-normal`}
    >
      <div className="home">
        <div className="team">
          {teams?.find((team) => team._id === x.teamHome)?.name}
        </div>
        <div className="ticker-image"></div>
      </div>
      <div className="time-score">
        <div className={`${x?.stats?.length > 0 ? "score" : "time-1"}`}>
          {x?.stats?.length > 0
            ? x?.stats
                ?.filter((x) => x.identifier === "goalsScored")[0]
                .home.map((x) => x.value)
                .reduce((a, b) => a + b, 0) +
              x?.stats
                ?.filter((x) => x.identifier === "ownGoals")[0]
                .away.map((x) => x.value)
                .reduce((a, b) => a + b, 0)
            : getPmString(
                new Date(getTime(x?.kickOffTime)).toLocaleTimeString()
              )}
        </div>
        <div className={`${x?.stats?.length > 0 ? "score" : "time-2"}`}>
          {x?.stats?.length > 0
            ? x?.stats
                ?.filter((x) => x.identifier === "goalsScored")[0]
                .home.map((x) => x.value)
                .reduce((a, b) => a + b, 0) +
              x?.stats
                ?.filter((x) => x.identifier === "ownGoals")[0]
                .away.map((x) => x.value)
                .reduce((a, b) => a + b, 0)
            : getPm(x?.kickOffTime)}
        </div>
      </div>
      <div className="away">
        <div className="ticker-image"></div>
        <div className="team">
          {teams?.find((team) => team._id === x.teamAway)?.name}
        </div>
      </div>
    </div>
    <div className="fix-admin-buttons">
              <div><Button onClick={() => editFixturePop(x._id)} className="btn btn-warning">Edit</Button></div>
              <div><Button onClick={() => deleteFixturePop(x._id)} className="btn btn-danger">Delete</Button></div>
                <div>
                  <Button>
                    {x?.stats?.length === 0 ? "Populate" : "Depopulate"}
                  </Button>
                </div>
                <div>
                  <Button>Edit Stats</Button>
                </div>
              </div>
    </>
  );
};

export default FixtureItemAdmin;
