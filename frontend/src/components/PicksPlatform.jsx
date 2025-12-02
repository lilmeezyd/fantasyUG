import { useState, useEffect } from "react";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";
import TransferModal from "./TransferModal";
import {
  useGetOverallLeaguesQuery,
  useGetTeamLeaguesQuery,
} from "../slices/leagueApiSlice";
import { useGetPlayersQuery } from "../slices/playerApiSlice";
import { useGetQuery } from "../slices/teamApiSlice";
import {
  useJoinOverallLeagueMutation,
  useJoinTeamLeagueMutation,
} from "../slices/leagueApiSlice";
import {
  useSetPicksMutation,
  useUpdatePicksMutation,
} from "../slices/picksSlice";
import { useUpdateUserMutation } from "../slices/userApiSlice";
import { Button, Spinner } from "react-bootstrap";
import SquadPlayer from "./SquadPlayer";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setCredentials } from "../slices/authSlice";
import { toast } from "react-toastify";
const PicksPlatform = (props) => {
  const {
    scrollToPlayers,
    gotoPlayersList,
    isLoading,
    isSmallScreen,
    picks,
    removePlayer,
    restore,
    totalPlayers,
    itb,
    reset,
    auto,
    teamValue,
    id,
    transfersIn,
    transfersOut,
    outMap
  } = props;
  const [teamName, setTeamName] = useState("");
  const [ show, setShow ] = useState(false)
  const [ close, setClose ] = useState(false)
  const [playerLeague, setPlayerLeague] = useState("");

  const goalkeepers = picks?.filter((pick) => pick?.playerPosition === 1);
  const defenders = picks?.filter((pick) => pick?.playerPosition === 2);
  const midfielders = picks?.filter((pick) => pick?.playerPosition === 3);
  const forwards = picks?.filter((pick) => pick?.playerPosition === 4);

  const { data: teamLeagues } = useGetTeamLeaguesQuery();
  const { data: teams } = useGetQuery();
  const { data: players } = useGetPlayersQuery();
  const [joinOverallLeague] = useJoinOverallLeagueMutation();
  const [joinTeamLeague] = useJoinTeamLeagueMutation();
  const [setPicks] = useSetPicksMutation();
  const [updatePicks] = useUpdatePicksMutation();
  const [updateUser] = useUpdateUserMutation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { userInfo } = useSelector((state) => state.auth);

  const reviewTransfers = async () => {
    setShow(true)
  }
  const closeTransfers = () => {
    setShow(false)
  }
  const goBack = () => {
    gotoPlayersList();
  }
  const onSave = async () => {
    try {const message = await updatePicks({
      id: id?._id,
      picks,
      teamValue,
      bank: itb,
      transfersIn,
      transfersOut,
    }).unwrap();
    toast.success(message?.message);
    navigate("/pickteam");
  } catch(error) {
    console.log(error)
    toast.error(error?.data?.message)
  }
  };
  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await setPicks({
        picks,
        teamName,
        bank: itb,
        teamValue,
        playerLeague,
        /*overallLeague: "69036ac28188285980ec2bfb",*/
        overallLeague: "66c13c3d1f44b30a427fb02f"
      }).unwrap();
      dispatch(setCredentials({ ...res.hasPicks }));
      toast.success(res?.message); 
      navigate("/pickteam");
    } catch (error) {
      console.log(error);
      toast.error(error?.data?.message)
    }
  };
  const selectLeague = (e) => {
    setPlayerLeague(e.target.value);
  };
  const onChange = (e) => {
    setTeamName(e.target.value);
  };

  if (isLoading) {
    return (
      <div className="spinner">
        <Spinner> /</Spinner>
      </div>
    );
  }

  return (
    <div>
      <div className="transfer-data p-2">
        <div className="p-2">
          <strong>Selected:</strong>&nbsp;&nbsp;
          {totalPlayers}/15
        </div>
        <div className="p-2">
          <strong>ITB:</strong>&nbsp;&nbsp;
          {itb.toFixed(1)}
        </div>
        {/*<div className="p-2">
          <strong>TC:</strong>
          0
        </div>
        <div className="p-2">
          <strong>FTS:</strong>
          Unlimited
        </div>*/}
      </div>
      <div className="trans-reset p-2">
        <Button onClick={auto} className="btn-dark">
          Auto Pick
        </Button>
        <Button onClick={reset} style={{ color: "white" }} className="btn-dark">
          Reset
        </Button>
        {isSmallScreen && <button onClick={goBack} className="btn btn-primary">Go To Players</button>}
      </div>
      <div className="no-picks-team">
        <div className="default-player">
          {goalkeepers?.map((x) => (
            <div key={x.slot} className="squad-player">
              <SquadPlayer
              scrollToPlayers={scrollToPlayers}
              transfersOut={transfersOut}
              transfersIn={transfersIn}
                removePlayer={removePlayer}
                restore={restore}
                baller={x}
                posName={"GKP"}
                outMap={outMap}
              ></SquadPlayer>
            </div>
          ))}
        </div>
        <div className="default-player">
          {defenders?.map((x) => (
            <div key={x.slot} className="squad-player">
              <SquadPlayer
              scrollToPlayers={scrollToPlayers}
              transfersOut={transfersOut}
              transfersIn={transfersIn}
              outMap={outMap}
                removePlayer={removePlayer}
                restore={restore}
                baller={x}
                posName={"DEF"}
              ></SquadPlayer> 
            </div>
          ))}
        </div>
        <div className="default-player">
          {midfielders?.map((x) => (
            <div key={x.slot} className="squad-player">
              <SquadPlayer
              scrollToPlayers={scrollToPlayers}
              transfersOut={transfersOut}
              transfersIn={transfersIn}
              outMap={outMap}
                removePlayer={removePlayer}
                restore={restore}
                baller={x}
                posName={"MID"}
              ></SquadPlayer>
            </div>
          ))}
        </div>
        <div className="default-player">
          {forwards?.map((x) => (
            <div key={x.slot} className="squad-player">
              <SquadPlayer
              scrollToPlayers={scrollToPlayers}
              transfersOut={transfersOut}
              transfersIn={transfersIn}
              outMap={outMap}
                removePlayer={removePlayer}
                restore={restore}
                baller={x}
                posName={"FWD"}
              ></SquadPlayer>
            </div>
          ))}
        </div>
      </div> 

      {!userInfo?.hasPicks && (
        <section className="form">
          <form onSubmit={onSubmit}>
            <div className="team-name-1 py-3">
              <div className="form-group fav-team">
                <label className="py-1" htmlFor="teamName">
                  Team Name
                </label>
                <input
                  className="form-control"
                  onChange={onChange}
                  value={teamName}
                  id="teamName"
                  name="teamName"
                  placeholder="Team Name"
                  type="text"
                />
              </div>
              <div className="name-warning py-1">
                *Team name should not be more than 20 characters
              </div>
            </div>
            <div className="team-name-1 py-3">
              <div className="form-group fav-team">
                <label className="py-1" htmlFor="team">
                  Favorite Team
                </label>
                <select
                  className="form-control"
                  name="team"
                  id="team"
                  onChange={selectLeague}
                >
                  <option value="">Select Favorite Team</option>
                  {teamLeagues?.map((league) => (
                    <option value={league._id} key={league._id}>
                      {league?.team?.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="name-warning py-1">*Select favorite team</div>
            </div>
            <div className="save-picks form-group py-3">
              <button
                type="submit"
                disabled={
                  itb < 0 ||
                  totalPlayers < 15 ||
                  teamName === "" ||
                  teamName.length > 20 ||
                  playerLeague === ""
                }
                className="primary btn btn-success"
              >
                Save
              </button>
            </div>
          </form>
        </section>
      )}

      {userInfo?.hasPicks && (
        <section className="form">
          {/*<form onSubmit={reviewTransfers}>*/}
            <div className="save-picks form-group py-3">
              <button
                onClick={reviewTransfers}
                disabled={
                  itb < 0 ||
                  totalPlayers < 15 ||
                  transfersIn?.length === 0 ||
                  transfersOut?.length === 0
                }
                className="primary btn btn-success"
              >
                Save Transfers
              </button>
            </div>
          {/*</form>*/}
        </section>
      )}
      {userInfo?.hasPicks && (<TransferModal show={show} closeTransfers={closeTransfers} onSave={onSave}
      transfersIn={transfersIn}
      transfersOut={transfersOut} teams={teams} players={players?.updatedPlayers}/>)}
    </div>
  );
};

export default PicksPlatform;
