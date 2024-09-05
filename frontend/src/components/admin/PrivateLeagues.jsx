import { useState, useMemo } from "react"
import { Container, Spinner, Button } from "react-bootstrap"
import Pagination from "../Pagination"
import { useGetLeaguesQuery, useDeleteLeagueMutation } from "../../slices/leagueApiSlice"
import EditModal from "./privateLeagueModals/EditModal"
import DeleteModal from "./privateLeagueModals/DeleteModal"
const PrivateLeagues = () => {
  const [show, setShow] = useState({
    edited: false,
    deleted: false
  });
  const [privateLeagueId, setPrivateLeagueId] = useState("");
  const [curPage, setCurPage] = useState(1);
  const [page, setPage] = useState(1);
  const { data: privateLeagues, isLoading} = useGetLeaguesQuery()
  const [ deleteLeague ] = useDeleteLeagueMutation() 

  const { deleted, edited } = show
  const pageSize = 5
  let totalPages = Math.ceil(privateLeagues?.length / pageSize);

  const editPrivateLeaguePop = async (id) => {
    setShow((prevState) => ({
      ...prevState, edited: true
    }))
    setPrivateLeagueId(id)
  }
  const deletePrivateLeaguePop = (id) => { 
    setShow((prevState) => ({
      ...prevState, deleted: true
    }))
    setPrivateLeagueId(id)
  }
  const closeEdit = () => {
    setShow((prevState) => ({
      ...prevState, edited: false
    }))
    setPrivateLeagueId('')
  }
  const closeDelete = () => {
    setShow((prevState) => ({
      ...prevState, deleted: false
    }))
    setPrivateLeagueId('')
  }
  
  const resetEdit = async () => {
    setShow((prevState) => ({
      ...prevState, edited: false
    }))
    setPrivateLeagueId('')
  }
  
  const cancelDelete = () => {
    setPrivateLeagueId('')
    setShow((prevState) => ({
      ...prevState, deleted: false
    }))
  }
  
  const deleteLeagueNow = async () => {
    try {
      await deleteLeague(privateLeagueId).unwrap()
    } catch (error) {
      console.log(error)
    }
    setShow((prevState) => ({
      ...prevState, deleted: false
    }))
    setPrivateLeagueId('')
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
  
  const memoPrivateLeagues = useMemo(() => {
    return privateLeagues?.filter((privateLeague, key) => {
        let start = (curPage - 1) * pageSize;
        let end = curPage * pageSize;
        if (key >= start && key < end) return true;
      });
  }, [privateLeagues, pageSize, curPage])

    if(isLoading) {
        console.log('Loading')
        return <div className="spinner"><Spinner /></div>
    }

    if(memoPrivateLeagues.length === 0) {
        return (
          <Container>
            <div className="spinner">No Private Leagues Found!</div>
          </Container>
        );
    }
  return (
    <Container>
      {memoPrivateLeagues?.length === 0 ? <div className="spinner">No Private Leagues Found!</div> : 
      memoPrivateLeagues?.map(x => <div className="teams p-2" key={x._id}>
        <div className="team-name">{x?.team?.name}</div>
        <div>
            <Button
              onClick={() => editPrivateLeaguePop(x._id)}
              className="btn btn-warning"
            >
              Edit
            </Button>
          </div>
          <div>
            <Button
              onClick={() => deletePrivateLeaguePop(x._id)}
              className="btn btn-danger"
            >
              Delete
            </Button>
          </div>
      </div>)
      }
     <EditModal privateLeagueId={privateLeagueId} resetEdit={resetEdit} show={edited} closeEdit={closeEdit} ></EditModal>
      <DeleteModal
      deleteLeagueNow={deleteLeagueNow}
       cancelDelete={cancelDelete} show={deleted} closeDelete={closeDelete} ></DeleteModal>
       <Pagination curPage={curPage} viewFirstPage={viewFirstPage}
         viewPreviousPage={viewPreviousPage}
        viewNextPage={viewNextPage} viewLastPage={viewLastPage}
         totalPages={totalPages} onSubmit={onSubmit} page={page} changePage={changePage} />
    </Container>
  )
}

export default PrivateLeagues