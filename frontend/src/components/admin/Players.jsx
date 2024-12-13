import { useMemo, useState, useReducer } from "react";
import {
  useGetPlayersQuery,
  useAddPlayerMutation,
  useDeletePlayerMutation,
} from "../../slices/playerApiSlice";
import { useGetQuery } from "../../slices/teamApiSlice";
import { useGetPositionsQuery } from "../../slices/positionApiSlice";
import { Container, Button, Spinner } from "react-bootstrap";
import { BsPencilFill } from "react-icons/bs";
import { AiFillDelete } from "react-icons/ai";
import { getPlayers } from "../../helpers/playersHelper";
import Pagination from "../Pagination";
import AddModal from "./playerModals/AddModal";
import EditModal from "./playerModals/EditModal";
import DeleteModal from "./playerModals/DeleteModal";

const Players = () => {
  const [show, setShow] = useState({
    edited: false,
    deleted: false,
    added: false,
  });
  const [playerId, setPlayerId] = useState("");
  const [curPage, setCurPage] = useState(1);
  const [page, setPage] = useState(1);
  const [word, setWord] = useState("");
  const { data: players, isLoading, isError } = useGetPlayersQuery();
  const { data: teams } = useGetQuery();
  const { data: positions } = useGetPositionsQuery();
  const [addPlayer] = useAddPlayerMutation();
  const [deletePlayer] = useDeletePlayerMutation();
  console.log(useGetPlayersQuery())

  const { deleted, edited, added } = show;
  const pageSize = 10;
  const reducer = (state, action) => {
    if (action.type === "PRICE") {
      return {
        ...state,
        cutPrice: action.data,
      };
    }
    if (action.type === "WORD") {
      return {
        ...state,
        word: action.data,
      };
    }
    if (action.type === "SORT") {
      const wordObj = {
        nowCost: "Points",
        totalPoints: "Points",
        goalsScored: "Goals",
        assists: "Assists",
        yellowCards: "Yellow cards",
        redCards: "Red cards",
        penaltiesSaved: "Penalties Saved",
        penaltiesMissed: "Penalties Missed",
        cleansheets: "Clean sheets",
        ownership: "Ownership",
        ownGoals: "Own goals",
      };
      const sortWord = wordObj[action.data];
      return {
        ...state,
        sort: action.data,
        sortWord,
      };
    }
    if (action.type === "VIEW") {
      return {
        ...state,
        view: action.data,
      };
    }
  };

  const [state, dispatch] = useReducer(reducer, {
    sort: "totalPoints",
    view: "allPlayers",
    cutPrice: 25,
  });

  const { sort, view, cutPrice } = state;

  const upPlayers = getPlayers(
    players,
    sort,
    view,
    word,
    cutPrice
  ).returnedPlayers;
  /*
  const upPlayers = useMemo(() => {
    return players?.filter(
      player => player?.firstName?.toLowerCase()?.includes(word.toLowerCase())
      || player?.secondName?.toLowerCase()?.includes(word.toLowerCase())
    )
  }, [word, players])*/
  const memoPlayers = useMemo(() => {
    return upPlayers?.filter((player, key) => {
      let start = (curPage - 1) * pageSize;
      let end = curPage * pageSize;
      if (key >= start && key < end) return true;
    });
  }, [upPlayers, pageSize, curPage]);
  let totalPages = Math.ceil(upPlayers?.length / pageSize);

  const onSearch = (e) => {
    setCurPage(1);
    setWord(e.target.value);
  };

  const closeAdd = () => {
    setShow((prevState) => ({
      ...prevState,
      added: false,
    }));
  };

  const addPlayerPop = () => {
    setShow((prevState) => ({
      ...prevState,
      added: true,
    }));
  };
  const editPlayerPop = async (id) => {
    setShow((prevState) => ({
      ...prevState,
      edited: true,
    }));
    setPlayerId(id);
  };
  const deletePlayerPop = (id) => {
    setShow((prevState) => ({
      ...prevState,
      deleted: true,
    }));
    setPlayerId(id);
  };
  const submit = async (data) => {
    try {
      await addPlayer(data).unwrap();
    } catch (error) {
      console.log(error);
    }
    setShow((prevState) => ({
      ...prevState,
      added: false,
    }));
    setPlayerId("");
  };

  const closeEdit = () => {
    setShow((prevState) => ({
      ...prevState,
      edited: false,
    }));
    setPlayerId("");
  };
  const closeDelete = () => {
    setShow((prevState) => ({
      ...prevState,
      deleted: false,
    }));
    setPlayerId("");
  };

  const resetEdit = async () => {
    setShow((prevState) => ({
      ...prevState,
      edited: false,
    }));
    setPlayerId("");
  };

  const cancelDelete = () => {
    setPlayerId("");
    setShow((prevState) => ({
      ...prevState,
      deleted: false,
    }));
  };

  const deletePlayerNow = async () => {
    try {
      await deletePlayer(playerId).unwrap();
    } catch (error) {
      console.log(error);
    }
    setShow((prevState) => ({
      ...prevState,
      deleted: false,
    }));
    setPlayerId("");
  };

  {
    /* Button Controls */
  }
  const onSubmit = (e) => {
    e.preventDefault();
    if (page > totalPages) {
      setCurPage(totalPages);
      setPage(totalPages);
    } else if (page < 0) {
      setCurPage(1);
      setPage(1);
    } else if (+page === 0) {
      setCurPage(1);
      setPage(1);
    } else {
      setCurPage(page);
    }
  };
  const changePage = (e) => {
    if (e.target.value === "") {
      setPage("");
    } else if (e.target.value > totalPages) {
      setPage(totalPages);
    } else {
      setPage(+e.target.value);
    }
  };
  const viewNextPage = () => {
    setCurPage(curPage + 1);
    setPage(curPage + 1);
  };
  const viewPreviousPage = () => {
    setCurPage(curPage - 1);
    setPage(curPage - 1);
  };
  const viewFirstPage = () => {
    setCurPage(1);
    setPage(1);
  };

  const viewLastPage = () => {
    setCurPage(totalPages);
    setPage(totalPages);
  };

  const onSort = (e) => {
    dispatch({ type: "SORT", data: e.target.value });
    setCurPage(1);
  };

  const onView = (e) => {
    dispatch({ type: "VIEW", data: e.target.value });
    setCurPage(1);
  };

  if (isLoading) {
    return (
      <div className="spinner">
        <Spinner />
      </div>
    );
  }

  if(isError) {
    /*return <div className="spinner">Something went wrong</div>*/
  }

  return (
    <Container>
      {!memoPlayers?.length ? <div className="spinner">No Players Found!</div> : <><div className="admin-vs">
        <div className="view">
          <label htmlFor="view_by">View</label>
          <select onChange={onView} className="custom-select admin-vs-select" id="view_by">
            <optgroup label="Global">
              <option value="allPlayers">All Players</option>
            </optgroup>
            <optgroup label="By Position">
              {positions?.map((pPos, idx) => {
                let positionId = "position_" + pPos._id;
                return (
                  <option key={idx} value={positionId}>
                    {pPos.singularName + "s"}
                  </option>
                );
              })}
            </optgroup>
            <optgroup label="By Team">
              {teams
                ?.filter((x) => x.name !== "Neutral")
                ?.map((team, idx) => {
                  let teamId = "team_" + team._id;
                  return (
                    <option key={idx} value={teamId}>
                      {team.name}
                    </option>
                  );
                })}
            </optgroup>
          </select>
        </div>
        <div className="sort">
          <label htmlFor="sort_by">Sorted by</label>
          <select onChange={onSort} className="admin-vs-select custom-select" id="sort_by">
            <option value="totalPoints">Total points</option>
            <option value="nowCost">Price</option>
            {/*<option value="event_points">Round points</option>*/}
            <option value="ownership">%age ownership</option>
            <option value="goalsScored">Goals</option>
            <option value="assists">Assists</option>
            <option value="yellowCards">Yellow cards</option>
            <option value="redCards">Red cards</option>
            <option value="cleansheets">Clean sheets</option>
            {/*<option value="penaltiesSaved">Penalties Saved</option>
                    <option value="penaltiesMissed">Penalties Missed</option>
                    <option value="cleansheets">Clean sheets</option>
                    <option value="ownGoals">Own Goals</option>*/}
          </select>
        </div>
      </div>
      <div className="form-group my-3">
        <input
          onChange={onSearch}
          className="form-control"
          placeholder="Search player"
          type="text"
          name="word"
          id="word"
        />
      </div>
      <div className="admin-teams">
        <div className="teams teams-head">
          <div className="team-name">Player</div>
          <div>Price</div>
          <div>Points</div>
          <div>Goals</div>
          <div>Assists</div>
          <div>Team</div>
          <div>Pos</div>
          <div>Ownership</div>
          <div>CS</div>
          <div>YC</div>
          <div>RC</div>
          <div></div>
          <div></div>
        </div>
        {memoPlayers?.map((x) => (
          <div className="teams" key={x._id}>
            <div className="team-name">{x.appName}</div>
            <div>{x.nowCost.toFixed(1)}</div>
            <div>{x.totalPoints}</div>
            <div>{x.goalsScored}</div>
            <div>{x.assists}</div>
            <div>
              {teams?.find((team) => team?._id === x.playerTeam)?.shortName}
            </div>
            <div>
              {
                positions?.find(
                  (position) => position?._id === x.playerPosition
                )?.shortName
              }
            </div>
            <div>{x.ownership}%</div>
            <div>{x.cleansheets}</div>
            <div>{x.yellowCards}</div>
            <div>{x.redCards}</div>
            <div className="btn-click" onClick={() => editPlayerPop(x._id)}>
              <BsPencilFill color="black" />
            </div>
            <div className="btn-click" onClick={() => deletePlayerPop(x._id)}>
              <AiFillDelete color="black" />
            </div>
          </div>
        ))}
      </div>
      <Pagination
        curPage={curPage}
        viewFirstPage={viewFirstPage}
        viewPreviousPage={viewPreviousPage}
        viewNextPage={viewNextPage}
        viewLastPage={viewLastPage}
        totalPages={totalPages}
        onSubmit={onSubmit}
        page={page}
        changePage={changePage}
      /></>}
      <div className="add-button p-2">
        <Button onClick={addPlayerPop} className="btn btn-success">
          Add Player 
        </Button>
      </div>
      <AddModal submit={submit} show={added} closeAdd={closeAdd}></AddModal>
      <EditModal
        playerId={playerId}
        resetEdit={resetEdit}
        show={edited}
        closeEdit={closeEdit}
      ></EditModal>
      <DeleteModal
        deletePlayerNow={deletePlayerNow}
        cancelDelete={cancelDelete}
        show={deleted}
        closeDelete={closeDelete}
      ></DeleteModal>
    </Container>
  );
};
export default Players;
