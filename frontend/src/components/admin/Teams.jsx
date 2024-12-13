import { useMemo, useState } from "react"
import {  useGetQuery,
  useAddMutation,
  useDeletMutation } from "../../slices/teamApiSlice"
import { Button, Container, Spinner } from "react-bootstrap"
import { BsPencilFill } from "react-icons/bs";
import { AiFillDelete } from "react-icons/ai";
import Pagination from "../Pagination"
import AddModal from "./teamModals/AddModal"
import DeleteModal from "./teamModals/DeleteModal"
import EditModal from "./teamModals/EditModal"
const Teams = () => {

  const [ show, setShow ] = useState({edited: false, deleted: false, added: false})
  const [ teamId, setTeamId] = useState('')
  const [ curPage, setCurPage ] = useState(1)
  const [page, setPage] = useState(1);
  const { data,  isLoading, isError } = useGetQuery()
  const [ add ] = useAddMutation()
  const [delet] = useDeletMutation()

  const { deleted, edited, added } = show
  const pageSize = 8
  let totalPages = Math.ceil(data?.length / pageSize);

  const closeAdd = () => {
    setShow((prevState) => ({
      ...prevState, added: false
    }))
  }
  const closeEdit = () => {
    setShow((prevState) => ({
      ...prevState, edited: false
    }))
    setTeamId('')
  }
  const closeDelete = () => {
    setShow((prevState) => ({
      ...prevState, deleted: false
    }))
    setTeamId('')
  }

  const addTeam = () => {
    setShow((prevState) => ({
      ...prevState, added: true
    }))
  }
  const editTeam = async (id) => {
    setShow((prevState) => ({
      ...prevState, edited: true
    }))
    setTeamId(id)
  }
  const deleteTeam = (id) => {
    setShow((prevState) => ({
      ...prevState, deleted: true
    }))
    setTeamId(id)
  }

  const cancelDelete = () => {
    setTeamId('')
    setShow((prevState) => ({
      ...prevState, deleted: false
    }))
  }

  const deleteTeamNow = async () => {
    try {
      await delet(teamId).unwrap()
    } catch (error) {
      console.log(error)
    }
    setShow((prevState) => ({
      ...prevState, deleted: false
    }))
    setTeamId('')
  }

  const submit = async (data) => {
    try {
      await add(data).unwrap()
    } catch (error) {
      console.log(error)
    }
    setShow((prevState) => ({
      ...prevState, added: false
    }))
    setTeamId('')
  }

  const resetEdit = async () => {
    setShow((prevState) => ({
      ...prevState, edited: false
    }))
    setTeamId('')
  }

  {/* Button Controls */}
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

  const memoTeams = useMemo(() => {
    return data?.filter((player, key) => {
        let start = (curPage - 1) * pageSize;
        let end = curPage * pageSize;
        if (key >= start && key < end) return true;
      });
  }, [data, pageSize, curPage])

  
  if(isLoading) {
    return <div className="spinner"><Spinner /></div>
  }

  if(isError) {
    return <div className="spinner">Something went wrong</div>
  }
  
  return (
    <Container>
      {!memoTeams?.length ? <div className="spinner">No Teams Found!</div> : <><div className="admin-teams">
      <div className="teams teams-head">
          <div className="team-name">Team</div>
          <div>Code</div>
          <div>Pld</div>
          <div>W</div>
          <div>D</div>
          <div>L</div>
          <div>GF</div>
          <div>GA</div>
          <div>GD</div>
          <div>Pts</div>
          <div></div>
          <div></div>
        </div>
      
      {memoTeams?.map(x => <div className="teams" key={x._id}>
          <div className="team-name">{x.name}</div>
          <div>{x.shortName}</div>
          <div>{x.played}</div>
          <div>{x.win}</div>
          <div>{x.draw}</div>
          <div>{x.loss}</div>
          <div>{x.goalsScored}</div>
          <div>{x.goalsConceded}</div>
          <div>{x.goalsScored-x.goalsConceded}</div>
          <div>{x.points}</div>
          <div className="btn-click" onClick={() => editTeam(x._id)}>
              <BsPencilFill color="black" />
            </div>
            <div className="btn-click" onClick={() => deleteTeam(x._id)}>
              <AiFillDelete color="black" />
            </div>
      </div>)}
      </div>
      <Pagination curPage={curPage} viewFirstPage={viewFirstPage}
         viewPreviousPage={viewPreviousPage}
        viewNextPage={viewNextPage} viewLastPage={viewLastPage}
         totalPages={totalPages} onSubmit={onSubmit} page={page} changePage={changePage} />
         </>
      }
      <div className="add-button p-2">
        <Button onClick={addTeam} className="btn btn-success">Add Team</Button>
      </div>
      <AddModal
      submit={submit}
       show={added} closeAdd={closeAdd} ></AddModal>
      {<EditModal teamId={teamId} resetEdit={resetEdit} show={edited} closeEdit={closeEdit} ></EditModal>}
      <DeleteModal
      deleteTeamNow={deleteTeamNow}
       cancelDelete={cancelDelete} show={deleted} closeDelete={closeDelete} ></DeleteModal>
       
    </Container> 
  )
}

export default Teams