import { useState, useEffect } from "react";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";
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
import { useSetPicksMutation, useUpdatePicksMutation } from "../slices/picksSlice";
import { useUpdateUserMutation } from "../slices/userApiSlice";
import { Button } from "react-bootstrap";
import SquadPlayer from "./SquadPlayer";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setCredentials } from "../slices/authSlice";
const PicksPlatform = (props) => {
  const { picks, removePlayer, totalPlayers, itb, reset, teamValue, id } = props;
  console.log(props)
  const [teamName, setTeamName] = useState("");
  const [playerLeague, setPlayerLeague] = useState("");

  const goalkeepers = picks?.filter(
    (pick) => pick?.playerPosition === "669a41e50f8891d8e0b4eb2a"
  );
  const defenders = picks?.filter(
    (pick) => pick?.playerPosition === "669a4831e181cb2ed40c240f"
  );
  const midfielders = picks?.filter(
    (pick) => pick?.playerPosition === "669a4846e181cb2ed40c2413"
  );
  const forwards = picks?.filter(
    (pick) => pick?.playerPosition === "669a485de181cb2ed40c2417"
  );

  const { data: teamLeagues } = useGetTeamLeaguesQuery();
  const { data: teams } = useGetQuery();
  const { data: players } = useGetPlayersQuery();
  const [joinOverallLeague] = useJoinOverallLeagueMutation();
  const [joinTeamLeague] = useJoinTeamLeagueMutation();
  const [setPicks] = useSetPicksMutation();
  const [updatePicks] = useUpdatePicksMutation()
  const [updateUser] = useUpdateUserMutation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { userInfo } = useSelector((state) => state.auth);

  const onSave = async (e) => {
    e.preventDefault()
    const res = await updatePicks({id: id?._id, picks, teamValue, bank: itb}).unwrap()
    navigate('/pickteam')
  }
  const onSubmit = async (e) => {
    e.preventDefault();
    const create_team = [setPicks({ picks, teamName, bank: itb, teamValue }).unwrap(),
      joinOverallLeague({ id: "66c13c3d1f44b30a427fb02f" }).unwrap(),
      joinTeamLeague({ id: playerLeague }).unwrap(), updateUser({ hasPicks: true }).unwrap()
    ]
    try {
     const res =  await Promise.all(create_team)
      dispatch(setCredentials({ ...res[3] }));
      navigate("/pickteam")
    } catch (error) {
      console.log(error);
    }
  };
  const selectLeague = (e) => {
    setPlayerLeague(e.target.value);
  };
  const onChange = (e) => {
    setTeamName(e.target.value);
  };

  return (
    <div>
      <div className="transfer-data p-2">
        <div className="transfer-item p-2">
          <div>Selected</div>
          <div>{totalPlayers}/15</div>
        </div>
        <div className="transfer-item p-2">
          <div>ITB</div>
          <div>{itb.toFixed(1)}</div>
        </div>
        <div className="transfer-item p-2">
          <div>TC</div>
          <div>0</div>
        </div>
        <div className="transfer-item p-2">
          <div>FTS</div>
          <div>Unlimited</div>
        </div>
      </div>
      <div className="trans-reset p-2">
        <Button style={{ color: "aquamarine" }} className="btn-dark">
          Auto Pick
        </Button>
        <Button
          onClick={reset}
          style={{ color: "aquamarine" }}
          className="btn-dark"
        >
          Reset
        </Button>
      </div>
      <div className="no-picks-team">
        <div className="default-player">
          {goalkeepers?.map((x) => (
            <div key={x.slot} className="squad-player">
              <SquadPlayer
                removePlayer={removePlayer}
                baller={x}
                posName={"GKP"}
              ></SquadPlayer>
            </div>
          ))}
        </div>
        <div className="default-player">
          {defenders?.map((x) => (
            <div key={x.slot} className="squad-player">
              <SquadPlayer
                removePlayer={removePlayer}
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
                removePlayer={removePlayer}
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
                removePlayer={removePlayer}
                baller={x}
                posName={"FWD"}
              ></SquadPlayer>
            </div>
          ))}
        </div>
      </div>

      {!userInfo?.hasPicks && <section className="form">
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
          <div className="form-group py-3">
            <Button
              type="submit"
              disabled={
                itb < 0 ||
                totalPlayers < 15 ||
                teamName === "" ||
                teamName.length > 20 ||
                playerLeague === ""
              }
              className="btn-success form-control"
            >
              Save
            </Button>
          </div>
        </form>
      </section>}

      {userInfo?.hasPicks &&
      <section className="form">
        <form onSubmit={onSave}>
        <div className="form-group py-3">
            <Button
              type="submit"
              disabled={
                itb < 0 ||
                totalPlayers < 15
              }
              className="btn-success form-control"
            >
              Save
            </Button>
          </div>
          </form></section>}
    </div>
  );
};

export default PicksPlatform;