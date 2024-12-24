import { useState } from "react";
import { useGetQuery } from "../../slices/teamApiSlice";
import { usePopulateFixtureMutation, useDepopulateFixtureMutation } from "../../slices/fixtureApiSlice";
import getTime from "../../utils/getTime";
import { getPm, getPmString } from "../../utils/getPm";
import { Button, Spinner } from "react-bootstrap";
import { useSetInitialPointsMutation } from "../../slices/livePicksApiSlice";
import { useGetPlayersQuery } from "../../slices/playerApiSlice";
import EditStatsModal from "./fixtureModals/EditStatsModal";

const FixtureItemAdmin = (props) => {
  const { x, editFixturePop, deleteFixturePop } = props; 

  const [stats, displayStats] = useState(false);
  const [initialLoad, setInitialLoad ] = useState(false)
  const [show, setShow] = useState(false)
  const { data: teams } = useGetQuery();
  const { data: players } = useGetPlayersQuery()
  const [ populateFixture ] = usePopulateFixtureMutation()
  const [ depopulateFixture ] = useDepopulateFixtureMutation()
  const [ setInitialPoints ]  = useSetInitialPointsMutation()

  const handleShow = () => {
    setShow(true)
  }

  const handleClose = () => {
    setShow(false)
  }
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
const dePopulate = async (x,y) => {
  try {
    await depopulateFixture({y,x}).unwrap()
  } catch (error) {
    console.log(error)
  }
}

const setInitial= async (x, y) => {
  try {
    const initialPts = await setInitialPoints({y:y, x:x}).unwrap()
    const { isLoading } = initialPts
    setInitialLoad(isLoading)
  } catch (error) {
    console.log(error)
  }
}

const createStats = (field, ground) => {
  return x?.stats?.length > 0 && x?.stats?.filter(x => x.identifier === field)[0][ground].map((x) => (
      <p key={x.player} className="player">
          <span className="stats">{players?.find(player => player._id === x.player).appName}</span>
          <span>({x.value})</span></p>
  ))
}

const statExists = (field) => {
  return x?.stats?.findIndex(x => x.away.length === 0 && x.home.length === 0 && x.identifier === field)
}
  return (
    <>
    <div>
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
            : getPmString(x?.kickOffTime
              )}
        </div>
        <div className={`${x?.stats?.length > 0 ? "score" : "time-2"}`}>
          {x?.stats?.length > 0
            ? x?.stats
                ?.filter((x) => x.identifier === "goalsScored")[0]
                .away.map((x) => x.value)
                .reduce((a, b) => a + b, 0) +
              x?.stats
                ?.filter((x) => x.identifier === "ownGoals")[0]
                .home.map((x) => x.value)
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
                  </Button> : <Button onClick={() => dePopulate(x._id, x.matchday)}>
                    Depopulate
                  </Button>}
                </div>
                <div>
                  <Button onClick={handleShow}>Edit Stats</Button>
                </div>
                {x?.stats?.length > 0 &&<div>
                    <Button onClick={() => setInitial(x._id, x.matchday)}>
                         {initialLoad === true ? <Spinner/> : 'Set Initial Points'}
                    </Button>
                </div>}
              </div>
    </div>

    {stats && x?.stats?.length > 0 &&
                <div>{statExists('goalsScored') === -1 &&
                    <>
                        <h1 className="stats">Goals Scored</h1>
                        <div className="info-container">
                            <div>
                                {createStats('goalsScored', 'home')}
                            </div>
                            <div className="vertical-line"></div>
                            <div>
                                {createStats('goalsScored', 'away')}
                            </div>
                        </div>
                    </>}

                    {statExists('assists') === -1 &&
                        <><h1 className="stats">Assists</h1>
                            <div className="info-container">
                                <div>
                                    {createStats('assists', 'home')}
                                </div>
                                <div className="vertical-line"></div>
                                <div>
                                    {createStats('assists', 'away')}
                                </div>
                            </div></>}

                    {statExists('ownGoals') === -1 &&
                        <><h1 className="stats">Own Goals</h1>
                            <div className="info-container">
                                <div>
                                    {createStats('ownGoals', 'home')}
                                </div>
                                <div className="vertical-line"></div>
                                <div>
                                    {createStats('ownGoals', 'away')}
                                </div>
                            </div></>}

                    {statExists('penaltiesSaved') === -1 &&
                        <><h1 className="stats">Penalties Saved</h1>
                            <div className="info-container">
                                <div>
                                    {createStats('penaltiesSaved', 'home')}
                                </div>
                                <div className="vertical-line"></div>
                                <div>
                                    {createStats('penaltiesSaved', 'away')}
                                </div>
                            </div></>}

                    {statExists('penaltiesMissed') === -1 &&
                        <><h1 className="stats">Penalties Missed</h1>
                            <div className="info-container">
                                <div>
                                    {createStats('penaltiesMissed', 'home')}
                                </div>
                                <div className="vertical-line"></div>
                                <div>
                                    {createStats('penaltiesMissed', 'away')}
                                </div>
                            </div></>}

                    {statExists('yellowCards') === -1 &&
                        <><h1 className="stats">Yellow Cards</h1>
                            <div className="info-container">
                                <div>
                                    {createStats('yellowCards', 'home')}
                                </div>
                                <div className="vertical-line"></div>
                                <div>
                                    {createStats('yellowCards', 'away')}
                                </div>
                            </div></>}

                    {statExists('redCards') === -1 &&
                        <><h1 className="stats">Red Cards</h1>
                            <div className="info-container">
                                <div>
                                    {createStats('redCards', 'home')}
                                </div>
                                <div className="vertical-line"></div>
                                <div>
                                    {createStats('redCards', 'away')}
                                </div>
                            </div></>}

                    {statExists('saves') === -1 &&
                        <><h1 className="stats">Saves</h1>
                            <div className="info-container">
                                <div>
                                    {createStats('saves', 'home')}
                                </div>
                                <div className="vertical-line"></div>
                                <div>
                                    {createStats('saves', 'away')}
                                </div>
                            </div></>}

                            {statExists('bestPlayer') === -1 &&
                        <><h1 className="stats">Man of the match</h1>
                            <div className="info-container">
                                <div>
                                    {createStats('bestPlayer', 'home')}
                                </div>
                                <div className="vertical-line"></div>
                                <div>
                                    {createStats('bestPlayer', 'away')}
                                </div>
                            </div></>}

                            {statExists('cleansheets') === -1 &&
                        <><h1 className="stats">Clean Sheets</h1>
                            <div className="info-container">
                                <div>
                                    {createStats('cleansheets', 'home')}
                                </div>
                                <div className="vertical-line"></div>
                                <div>
                                    {createStats('cleansheets', 'away')}
                                </div>
                            </div></>}

                            {statExists('starts') === -1 &&
                        <><h1 className="stats">Started</h1>
                            <div className="info-container">
                                <div>
                                    {createStats('starts', 'home')}
                                </div>
                                <div className="vertical-line"></div>
                                <div>
                                    {createStats('starts', 'away')}
                                </div>
                            </div></>}

                            {statExists('bench') === -1 &&
                        <><h1 className="stats">Sub appearance</h1>
                            <div className="info-container">
                                <div>
                                    {createStats('bench', 'home')}
                                </div>
                                <div className="vertical-line"></div>
                                <div>
                                    {createStats('bench', 'away')}
                                </div>
                            </div></>}
                </div>}

                <EditStatsModal
                fixture={x}
                show={show}
                handleClose={handleClose}></EditStatsModal>
    </>
  );
};

export default FixtureItemAdmin;
