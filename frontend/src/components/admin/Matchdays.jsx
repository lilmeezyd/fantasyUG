import {  useMemo, useState } from "react";
import {
  useGetMatchdaysQuery,
  useAddMatchdayMutation,
  useDeleteMatchdayMutation
} from "../../slices/matchdayApiSlice";
import { Container, Button, Spinner } from "react-bootstrap";
import Pagination from "../Pagination"
import AddModal from "./matchdayModals/AddModal";
import DeleteModal from "./matchdayModals/DeleteModal";
import EditModal from "./matchdayModals/EditModal";
import getTime from "../../utils/getTime";

const Matchdays = () => {  
  const [show, setShow] = useState({
    edited: false,
    deleted: false,
    added: false, 
  });
  const [matchdayId, setMatchdayId] = useState("");
  const [curPage, setCurPage] = useState(1);
  const [page, setPage] = useState(1);
  const { data: matchdays,  isLoading}  = useGetMatchdaysQuery()
  const [addMatchday ] = useAddMatchdayMutation()
  const [ deleteMatchday ] = useDeleteMatchdayMutation()
  const {deleted, edited, added } = show
  const pageSize = 5
  let totalPages = Math.ceil(matchdays?.length / pageSize);

 const closeAdd = () => {
  setShow((prevState) => ({
    ...prevState,
    added: false,
  }));
};
const closeEdit = () => {
  setShow((prevState) => ({
    ...prevState,
    edited: false,
  }));
  setMatchdayId("");
};
const closeDelete = () => {
  setShow((prevState) => ({
    ...prevState,
    deleted: false,
  }));
  setMatchdayId("");
};

 const addMatchdayPop = () => {
  setShow((prevState) => ({
    ...prevState,
    added: true,
  }));
};
const editMatchdayPop = async (id) => {
  setShow((prevState) => ({
    ...prevState,
    edited: true,
  }));
  setMatchdayId(id);
}
const deleteMatchdayPop = (id) => {
  setShow((prevState) => ({
    ...prevState,
    deleted: true,
  }));
  setMatchdayId(id);
};

const cancelDelete = () => {
  setMatchdayId("");
  setShow((prevState) => ({
    ...prevState,
    deleted: false,
  }));
};

const deleteMatchdayNow = async () => {
  try {
    await deleteMatchday(matchdayId).unwrap();
    setMatchdays(matchdays.filter((matchday) => matchday._id !== matchdayId));
  } catch (error) {
    console.log(error);
  }
  setShow((prevState) => ({
    ...prevState,
    deleted: false,
  }));
  setMatchdayId("");
};

const submit = async (data) => {
  try {
    await addMatchday(data).unwrap();
  } catch (error) {
    console.log(error);
  }
  setShow((prevState) => ({
    ...prevState,
    added: false,
  }));
  setMatchdayId("");
};

const resetEdit = async (data) => {
  try {
    const res = await editMatchday(data, matchdayId).unwrap();
    console.log(res);
    //dispatch(setMatchdayDetails({...res}))
    setMatchdays((prev) => [...prev, res]);
  } catch (error) {
    console.log(error);
  }
  setShow((prevState) => ({
    ...prevState,
    edited: false,
  }));
  setMatchdayId("");
};

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

const memoMatchdays = useMemo(() => { 
  return matchdays?.filter((matchday, key) => {
    let start = (curPage - 1) * pageSize;
    let end = curPage * pageSize;
    if (key >= start && key < end) return true;
  })
}, [matchdays, pageSize, curPage])
 if(isLoading) {
    return <div className="spinner"><Spinner /></div>
 }
  return (
    <Container>
    {memoMatchdays.map(x => <div className="teams p-2" key={x._id}>
          <div className="team-name">{x.name}</div>
          <div>{getTime(x.deadlineTime)}</div>
          <div><Button onClick={() => editMatchdayPop(x._id)} className="btn btn-warning">Edit</Button></div>
          <div><Button onClick={() => deleteMatchdayPop(x._id)} className="btn btn-danger">Delete</Button></div>
      </div>)}
      <div className="add-button p-2">
        <Button onClick={addMatchdayPop} className="btn btn-success">Add Matchday</Button>
      </div>
      <AddModal submit={submit} show={added} closeAdd={closeAdd}></AddModal>
      <EditModal
        matchdayId={matchdayId}
        resetEdit={resetEdit}
        show={edited}
        closeEdit={closeEdit}
      ></EditModal>
      <DeleteModal
        deleteMatchdayNow={deleteMatchdayNow}
        cancelDelete={cancelDelete}
        show={deleted}
        closeDelete={closeDelete}
      ></DeleteModal>

<Pagination curPage={curPage} viewFirstPage={viewFirstPage}
         viewPreviousPage={viewPreviousPage}
        viewNextPage={viewNextPage} viewLastPage={viewLastPage}
         totalPages={totalPages} onSubmit={onSubmit} page={page} changePage={changePage} />
  </Container>
  )
}

export default Matchdays