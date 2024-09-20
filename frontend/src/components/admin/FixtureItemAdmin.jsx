import { useState } from "react";
import { useGetQuery } from "../../slices/teamApiSlice";
import { usePopulateFixtureMutation, useDepopulateFixtureMutation } from "../../slices/fixtureApiSlice";
import getTime from "../../utils/getTime";
import { getPm, getPmString } from "../../utils/getPm";
import { Button } from "react-bootstrap";
import { useSetInitialPointsMutation } from "../../slices/livePicksApiSlice";

const FixtureItemAdmin = (props) => {
  const { x, editFixturePop, deleteFixturePop } = props;

  const [stats, displayStats] = useState(false);
  const { data: teams } = useGetQuery();
  const [ populateFixture ] = usePopulateFixtureMutation()
  const [ depopulateFixture ] = useDepopulateFixtureMutation()
  const [ setInitialPoints ]  = useSetInitialPointsMutation()

  const onClick = () => {
    displayStats((prevState) => !prevState);
  };
  const initialStats = async (y) => {
    try {
      await populateFixture(y).unwrap()
    } catch (error) {
      console.log(error)
    }
}
const dePopulate = async (y) => {
  try {
    await depopulateFixture(y).unwrap()
  } catch (error) {
    console.log(error)
  }
}

const setInitial= async (x, y) => {
  console.log(x)
  console.log(y)
  try {
    await setInitialPoints({y:y, x:x}).unwrap()
  } catch (error) {
    console.log(error)
  }
}
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
                  {x?.stats?.length === 0 ? <Button onClick={() => initialStats(x._id)}>
                    Populate
                  </Button> : <Button onClick={() => dePopulate(x._id)}>
                    Depopulate
                  </Button>}
                </div>
                <div>
                  <Button>Edit Stats</Button>
                </div>
                {x?.stats?.length > 0 &&<div>
                    <Button onClick={() => setInitial(x._id, x.matchday)}>
                        Set Initial Points
                    </Button>
                </div>}
              </div>
    </>
  );
};

export default FixtureItemAdmin;
