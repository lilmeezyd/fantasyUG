import { useState, useMemo } from "react"
import { Container, Spinner, Button } from "react-bootstrap"
import { BsPencilFill } from "react-icons/bs";
import { AiFillDelete} from "react-icons/ai"
import Pagination from "../Pagination"
import { useUpdateOverallTableMutation, useGetOverallLeaguesQuery, useAddOverallLeagueMutation, useDeleteOverallLeagueMutation } from "../../slices/leagueApiSlice"
import AddModal from "./overallLeagueModals/AddModal"
import EditModal from "./overallLeagueModals/EditModal"
import DeleteModal from "./overallLeagueModals/DeleteModal"

const OverallLeagues = () => {
  const [show, setShow] = useState({
    edited: false,
    deleted: false,
    added: false,
  });
  const [overallLeagueId, setOverallLeagueId] = useState("");
  const [curPage, setCurPage] = useState(1);
  const [page, setPage] = useState(1);
  const { data: overallLeagues, isLoading, isFetching, isError} = useGetOverallLeaguesQuery()
  const [addOverallLeague ] = useAddOverallLeagueMutation()
  const [ deleteOverallLeague ] = useDeleteOverallLeagueMutation() 
  const [ updateOverallTable, {isLoading: a} ] = useUpdateOverallTableMutation()
  console.log(useGetOverallLeaguesQuery())

  const { deleted, edited, added } = show
  const pageSize = 5
  let totalPages = Math.ceil(overallLeagues?.length / pageSize);

  const closeAdd = () => {
    setShow((prevState) => ({
      ...prevState, added: false
    }))
  }
  
  const addOverallLeaguePop = () => {
    setShow((prevState) => ({
      ...prevState, added: true
    }))
  }
  const editOverallLeaguePop = async (id) => {
    setShow((prevState) => ({
      ...prevState, edited: true
    }))
    setOverallLeagueId(id)
  }
  const deleteOverallLeaguePop = (id) => { 
    setShow((prevState) => ({
      ...prevState, deleted: true
    }))
    setOverallLeagueId(id)
  }

  const updateOverallLeague = async () => {
    const res = await updateOverallTable().unwrap()
    console.log(res)
  }
   const submit = async (data) => {
    try {
      await addOverallLeague(data).unwrap()
    } catch (error) {
      console.log(error)
    }
    setShow((prevState) => ({
      ...prevState, added: false
    }))
    setOverallLeagueId('')
  }
  
  const closeEdit = () => {
    setShow((prevState) => ({
      ...prevState, edited: false
    }))
    setOverallLeagueId('')
  }
  const closeDelete = () => {
    setShow((prevState) => ({
      ...prevState, deleted: false
    }))
    setOverallLeagueId('')
  }
  
  const resetEdit = async () => {
    setShow((prevState) => ({
      ...prevState, edited: false
    }))
    setOverallLeagueId('')
  }
  
  const cancelDelete = () => {
    setOverallLeagueId('')
    setShow((prevState) => ({
      ...prevState, deleted: false
    }))
  }
  
  const deleteOverallLeagueNow = async () => {
    try {
      await deleteOverallLeague(overallLeagueId).unwrap()
    } catch (error) {
      console.log(error)
    }
    setShow((prevState) => ({
      ...prevState, deleted: false
    }))
    setOverallLeagueId('')
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
  
  const memoOverallLeagues = useMemo(() => {
    return overallLeagues?.filter((overallLeague, key) => {
        let start = (curPage - 1) * pageSize;
        let end = curPage * pageSize;
        if (key >= start && key < end) return true;
      });
  }, [overallLeagues, pageSize, curPage])

    if(isLoading) {
        return (<div className="spinner"><Spinner /></div>)
    }

    if(isError) {
      return (<div className="spinner">Something went wrong</div>)
    }
/*
    if(memoOverallLeagues.length === 0) {
      return (
        <Container>
          <div className="spinner">No Overall Leagues Found!</div>
          <div className="add-button p-2">
            <Button onClick={addOverallLeaguePop} className="btn btn-success">
              Add Overall League
            </Button>
          </div>
        </Container>
      );
    }*/
  return (
    <Container className="p-2">
      {!memoOverallLeagues?.length ? <div className="spinner">No overall Leagues Found!</div> : 
      <>{memoOverallLeagues?.map(x => <div className="teams p-2" key={x._id}>
        <div className="team-name">{x?.name}</div>
        <div>
            <Button
              onClick={() => editOverallLeaguePop(x._id)}
              style={{background: 'white', border: 'white'}}
            >
              <BsPencilFill color="black"/>
            </Button>
          </div>
          <div>
            <Button
              onClick={() => deleteOverallLeaguePop(x._id)}
              style={{background: 'white', border: 'white'}}
            >
              <AiFillDelete color="black" />
            </Button>
          </div>
          <div>
          </div>
      </div>)}
      <Pagination curPage={curPage} viewFirstPage={viewFirstPage}
         viewPreviousPage={viewPreviousPage}
        viewNextPage={viewNextPage} viewLastPage={viewLastPage}
         totalPages={totalPages} onSubmit={onSubmit} page={page} changePage={changePage} />
      </>
      }
      <div className="add-button p-2">
        <Button onClick={addOverallLeaguePop} className="btn btn-success">
          Add Overall League
        </Button>
        {!!memoOverallLeagues?.length && <Button
              onClick={() => updateOverallLeague()}
            >
              {a === true ? <Spinner /> : `Update Table`}
            </Button>}
      </div>
      <AddModal
      submit={submit}
       show={added} closeAdd={closeAdd} ></AddModal>
       <EditModal overallLeagueId={overallLeagueId} resetEdit={resetEdit} show={edited} closeEdit={closeEdit} ></EditModal>
      <DeleteModal
      deleteOverallLeagueNow={deleteOverallLeagueNow}
       cancelDelete={cancelDelete} show={deleted} closeDelete={closeDelete} ></DeleteModal>

    </Container>
  )
}

export default OverallLeagues