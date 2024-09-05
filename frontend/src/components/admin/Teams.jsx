import { useMemo, useState } from "react"
import {  useGetQuery,
  useAddMutation,
  useDeletMutation } from "../../slices/teamApiSlice"
import { Button, Container, Spinner } from "react-bootstrap"
import Pagination from "../Pagination"
import AddModal from "./teamModals/AddModal"
import DeleteModal from "./teamModals/DeleteModal"
import EditModal from "./teamModals/EditModal"
const Teams = () => {

  const [ show, setShow ] = useState({edited: false, deleted: false, added: false})
  const [ teamId, setTeamId] = useState('')
  const [ curPage, setCurPage ] = useState(1)
  const [page, setPage] = useState(1);
  const { data,  isLoading } = useGetQuery()
  const [ add ] = useAddMutation()
  const [delet] = useDeletMutation()

  const { deleted, edited, added } = show
  const pageSize = 5
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
  
  return (
    <Container>
      {memoTeams?.map(x => <div className="teams p-2" key={x._id}>
          <div className="team-name">{x.name}</div>
          <div>{x.shortName}</div>
          <div><Button onClick={() =>editTeam(x._id)} className="btn btn-warning">Edit</Button></div>
          <div><Button onClick={() => deleteTeam(x._id)} className="btn btn-danger">Delete</Button></div>
      </div>)}
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

        <Pagination curPage={curPage} viewFirstPage={viewFirstPage}
         viewPreviousPage={viewPreviousPage}
        viewNextPage={viewNextPage} viewLastPage={viewLastPage}
         totalPages={totalPages} onSubmit={onSubmit} page={page} changePage={changePage} />
       
    </Container>
  )
}

export default Teams