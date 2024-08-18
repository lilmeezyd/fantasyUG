import { useMemo, useState } from "react";
import {
  useGetPlayersQuery,
  useAddPlayerMutation,
  useDeletePlayerMutation,
} from "../../slices/playerApiSlice";
import { Container, Button, Spinner } from "react-bootstrap";
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
  const { data: players, isLoading } = useGetPlayersQuery();
  const [addPlayer] = useAddPlayerMutation();
  const [deletePlayer] = useDeletePlayerMutation();

  const { deleted, edited, added } = show;
  const pageSize = 5;
  let totalPages = Math.ceil(players?.length / pageSize);

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

  const memoPlayers = useMemo(() => {
    return players?.filter((player, key) => {
      let start = (curPage - 1) * pageSize;
      let end = curPage * pageSize;
      if (key >= start && key < end) return true;
    });
  }, [players, pageSize, curPage]);
  if (isLoading) {
    return (
      <div className="spinner">
        <Spinner />
      </div>
    );
  }
  return (
    <Container>
      {memoPlayers.map((x) => (
        <div className="teams p-2" key={x._id}>
          <div className="team-name">{x.appName}</div>
          <div>{x.nowCost.toFixed(1)}</div>
          <div>
            <Button
              onClick={() => editPlayerPop(x._id)}
              className="btn btn-warning"
            >
              Edit
            </Button>
          </div>
          <div>
            <Button
              onClick={() => deletePlayerPop(x._id)}
              className="btn btn-danger"
            >
              Delete
            </Button>
          </div>
        </div>
      ))}
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
      />
    </Container>
  );
};
export default Players;
