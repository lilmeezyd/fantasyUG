import { useState, useMemo } from "react";
import { Container, Spinner, Button } from "react-bootstrap";
import { BsPencilFill } from "react-icons/bs";
import { AiFillDelete } from "react-icons/ai"
import Pagination from "../Pagination"
import {
  useUpdateTeamTablesMutation,
  useGetTeamLeaguesQuery,
  useAddTeamLeagueMutation,
  useDeleteTeamLeagueMutation,
} from "../../slices/leagueApiSlice";
import AddModal from "./teamLeagueModals/AddModal"
import EditModal from "./teamLeagueModals/EditModal"
import DeleteModal from "./teamLeagueModals/DeleteModal"
const TeamLeagues = () => {
  const [show, setShow] = useState({
    edited: false,
    deleted: false,
    added: false,
  });
  const [teamLeagueId, setTeamLeagueId] = useState("");
  const [curPage, setCurPage] = useState(1);
  const [page, setPage] = useState(1);
  const { data: teamLeagues, isLoading, isError } = useGetTeamLeaguesQuery();
  const [addTeamLeague] = useAddTeamLeagueMutation()
  const [deleteTeamLeague] = useDeleteTeamLeagueMutation()
  const [updateTeamTables, { isLoading: a }] = useUpdateTeamTablesMutation()

  const { deleted, edited, added } = show
  const pageSize = 5
  let totalPages = Math.ceil(teamLeagues?.length / pageSize);

  const closeAdd = () => {
    setShow((prevState) => ({
      ...prevState, added: false
    }))
  }

  const addTeamLeaguePop = () => {
    setShow((prevState) => ({
      ...prevState, added: true
    }))
  }
  const editTeamLeaguePop = async (id) => {
    setShow((prevState) => ({
      ...prevState, edited: true
    }))
    setTeamLeagueId(id)
  }
  const deleteTeamLeaguePop = (id) => {
    setShow((prevState) => ({
      ...prevState, deleted: true
    }))
    setTeamLeagueId(id)
  }
  const submit = async (data) => {
    try {
      await addTeamLeague(data).unwrap()
    } catch (error) {
      console.log(error)
    }
    setShow((prevState) => ({
      ...prevState, added: false
    }))
    setTeamLeagueId('')
  }

  const closeEdit = () => {
    setShow((prevState) => ({
      ...prevState, edited: false
    }))
    setTeamLeagueId('')
  }
  const closeDelete = () => {
    setShow((prevState) => ({
      ...prevState, deleted: false
    }))
    setTeamLeagueId('')
  }

  const resetEdit = async () => {
    setShow((prevState) => ({
      ...prevState, edited: false
    }))
    setTeamLeagueId('')
  }

  const cancelDelete = () => {
    setTeamLeagueId('')
    setShow((prevState) => ({
      ...prevState, deleted: false
    }))
  }

  const deleteTeamLeagueNow = async () => {
    try {
      await deleteTeamLeague(teamLeagueId).unwrap()
    } catch (error) {
      console.log(error)
    }
    setShow((prevState) => ({
      ...prevState, deleted: false
    }))
    setTeamLeagueId('')
  }

  const updateTeamLeagues = async () => {
    const res = await updateTeamTables().unwrap()
    console.log(res)
  }

  {/* Button Controls */ }
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

  const memoTeamLeagues = useMemo(() => {
    return teamLeagues?.filter((teamLeague, key) => {
      let start = (curPage - 1) * pageSize;
      let end = curPage * pageSize;
      if (key >= start && key < end) return true;
    });
  }, [teamLeagues, pageSize, curPage])

  if (isLoading) {
    return (
      <div className="spinner">
        <Spinner />
      </div>
    );
  }

  if (isError) {
    return (<div className="spinner">Something went wrong</div>)
  }
  /*
    if (memoTeamLeagues.length === 0) {
      return (
        <Container>
          <div className="spinner">No Team Leagues Found!</div>
          <div className="add-button p-2">
            <Button onClick={addTeamLeaguePop} className="btn btn-success">
              Add Team League
            </Button>
          </div>
        </Container>
      );
    }*/
  return (
    <Container className="p-2">
      {!memoTeamLeagues?.length ? <div className="spinner">No Team Leagues Found!</div> :
        <>{memoTeamLeagues?.map(x => <div className="teams p-2" key={x._id}>
          <div className="team-name">{x?.team?.name}</div>
          <div>
            <Button
              onClick={() => editTeamLeaguePop(x._id)}
              style={{ background: 'white', border: '1px solid black' }}
            >
              <BsPencilFill color="black" />
            </Button>
          </div>
          <div>
            <Button
              onClick={() => deleteTeamLeaguePop(x._id)}
              style={{ background: 'white', border: '1px solid black' }}
            >
              <AiFillDelete color="black" />
            </Button>
          </div>
        </div>)}
          <Pagination curPage={curPage} viewFirstPage={viewFirstPage}
            viewPreviousPage={viewPreviousPage}
            viewNextPage={viewNextPage} viewLastPage={viewLastPage}
            totalPages={totalPages} onSubmit={onSubmit} page={page} changePage={changePage} />
        </>
      }
      <div className="add-button p-2">
        <Button onClick={addTeamLeaguePop} className="btn btn-success">
          Add Team League
        </Button>
        {!!memoTeamLeagues?.length && <Button
          onClick={updateTeamLeagues}
        >{a === true ? <Spinner /> : `Update Tables`}
        </Button>}
      </div>
      <AddModal
        submit={submit}
        show={added} closeAdd={closeAdd} ></AddModal>
      <EditModal teamLeagueId={teamLeagueId} resetEdit={resetEdit} show={edited} closeEdit={closeEdit} ></EditModal>
      <DeleteModal
        deleteTeamLeagueNow={deleteTeamLeagueNow}
        cancelDelete={cancelDelete} show={deleted} closeDelete={closeDelete} ></DeleteModal>


    </Container>
  );
};

export default TeamLeagues;
