import { useState } from "react";
import { useGetQuery } from "../../slices/teamApiSlice";
import {
  usePopulateFixtureMutation,
  useDepopulateFixtureMutation,
} from "../../slices/fixtureApiSlice";
import getTime from "../../utils/getTime";
import { getPm, getPmString } from "../../utils/getPm";
import { Button, Spinner } from "react-bootstrap";
import { useSetInitialPointsMutation } from "../../slices/livePicksApiSlice";
import { useGetPlayersQuery } from "../../slices/playerApiSlice";
import EditStatsModal from "./fixtureModals/EditStatsModal";
import { toast } from "react-toastify";

const FixtureItemAdmin = (props) => {
  const { fixture, editFixturePop, deleteFixturePop, resetFixturePop } = props;
  //dePopulate(fixture._id, fixture.matchdayId)

  const [stats, displayStats] = useState(false);
  const [initialLoad, setInitialLoad] = useState(false);
  const [show, setShow] = useState(false);
  const { data: teams } = useGetQuery();
  const { data: players } = useGetPlayersQuery();
  const [populateFixture, {isLoading: isSetLive }] = usePopulateFixtureMutation();
  const [depopulateFixture] = useDepopulateFixtureMutation();
  const [setInitialPoints] = useSetInitialPointsMutation();
  console.log(fixture)

  const handleShow = () => {
    setShow(true);
  };

  const handleClose = () => {
    setShow(false);
  };
  const onClick = () => {
    displayStats((prevState) => !prevState);
  };
  const initialStats = async (y) => {
    try {
      const res = await populateFixture(y).unwrap();
      toast.success('Fixture is live!')
    } catch (error) {
      toast.error(error?.data?.message)
    }
  };
  const dePopulate = async (x, y) => {
    try {
      const res = await depopulateFixture({ y, x }).unwrap();
      console.log(res)
    } catch (error) {
      console.log(error);
      toast.error('Fixture reset failed!')
    }
  };

  const setInitial = async (x, y) => {
    try {
      const res = await setInitialPoints({ y: y, x: x }).unwrap();
      toast.success(res?.message);
    } catch (error) {
      toast.error(error?.data?.message);
    }
  };

  const createStats = (field, ground) => {
    return (
      fixture?.stats?.length > 0 &&
      fixture?.stats
        ?.filter((x) => x.identifier === field)[0]
        [ground].map((x) => (
          <p key={x.player} className="player">
            <span className="stats">
              {
                players?.updatedPlayers?.find(
                  (player) => player._id === x.player
                ).appName
              }
            </span>
            <span>({x.value})</span>
          </p>
        ))
    );
  };

  const statExists = (field) => {
    return fixture?.stats?.findIndex(
      (x) =>
        x.away.length === 0 && x.home.length === 0 && x.identifier === field
    );
  };
  return (
    <>
      <div>
        <div className="border rounded-lg flex justify-between p-2 text-sm font-bold">
          <div>{fixture.fixTime}</div>
          <div>{fixture.fixDate}</div>
        </div>
        <div
          onClick={() => onClick()}
          className={`${stats && "bg-teams"} teams-normal`}
        >
          <div className="home">
            <div className="team">{fixture.teamHome}</div>
            <div className="ticker-image">
              <img src={`../../${fixture.shortHome}.png`} alt="logo" />
            </div>
          </div>
          <div className="time-score">
            <div className="score">{fixture.teamHomeScore ?? "-"}</div>
            <div className="score">{fixture.teamAwayScore ?? "-"}</div>
          </div>
          <div className="away">
            <div className="ticker-image">
              <img src={`../../${fixture.shortAway}.png`} alt="logo" />
            </div>
            <div className="team">{fixture.teamAway}</div>
          </div>
        </div>
        
          <div className="flex justify-between sm:justify-center space-x-4 w-[100%] border p-2">
              <div className="m-2"><Button onClick={() => editFixturePop(fixture._id)} className="btn btn-warning">Edit</Button></div>
              <div className="m-2"><Button onClick={() => deleteFixturePop(fixture._id)} className="btn btn-danger ">Delete</Button></div>
                <div className="m-2">
                  {fixture?.stats?.length === 0 ? <Button onClick={() => initialStats(fixture._id)}>
                    {isSetLive ? <Spinner /> : 'Start'}
                  </Button> : <Button onClick={() => resetFixturePop(fixture._id, fixture.matchdayId)}>
                    Reset
                  </Button>}
                </div>
                <div className="m-2">
                  <Button onClick={handleShow}>Edit Stats</Button>
                </div>
                {/*x?.stats?.length > 0 &&<div>
                    <Button onClick={() => setInitial(x._id, x.matchday)}>
                         {initialLoad === true ? <Spinner/> : 'Set Initial Points'}
                    </Button>
                </div>*/}
              </div>
        {stats && fixture?.stats?.length > 0 &&
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

                {show && <EditStatsModal
                fixture={fixture}
                show={show}
                handleClose={handleClose}/>}
      </div>
    </>
  );
};

export default FixtureItemAdmin;
