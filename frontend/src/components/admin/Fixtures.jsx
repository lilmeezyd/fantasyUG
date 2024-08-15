import { useMemo, useState } from "react";
import {
  useGetFixturesQuery,
  useAddFixtureMutation,
  useDeleteFixtureMutation
} from "../../slices/fixtureApiSlice";
import { useGetQuery } from "../../slices/teamApiSlice"
import { useGetMatchdaysQuery } from "../../slices/matchdayApiSlice";
import { Container, Button, Spinner } from "react-bootstrap";
import Pagination from "../Pagination"
import AddModal from "./fixtureModals/AddModal";
import DeleteModal from "./fixtureModals/DeleteModal";
import EditModal from "./fixtureModals/EditModal";
import getTime from "../../utils/getTime";

const Fixtures = () => {  
  const [show, setShow] = useState({
    edited: false,
    deleted: false,
    added: false,
  });
  const [fixtureId, setFixtureId] = useState("");
  const [curPage, setCurPage] = useState(1);
  const [page, setPage] = useState(1);
  const { data: fixtures, isLoading}  = useGetFixturesQuery()
  const [addFixture ] = useAddFixtureMutation()
  const [ deleteFixture ] = useDeleteFixtureMutation()
  const { data: teams } = useGetQuery()
  const { data: matchdays} = useGetMatchdaysQuery()
      const {deleted, edited, added } = show
  const pageSize = 5
  let totalPages = Math.ceil(fixtures?.length / pageSize);

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
  setFixtureId("");
};
const closeDelete = () => {
  setShow((prevState) => ({
    ...prevState,
    deleted: false,
  }));
  setFixtureId("");
};

 const addFixturePop = () => {
  setShow((prevState) => ({
    ...prevState,
    added: true,
  }));
};
const editFixturePop = async (id) => {
  setShow((prevState) => ({
    ...prevState,
    edited: true,
  }));
  setFixtureId(id);
};
const deleteFixturePop = (id) => {
  setShow((prevState) => ({
    ...prevState,
    deleted: true,
  }));
  setFixtureId(id);
};

const cancelDelete = () => {
  setFixtureId("");
  setShow((prevState) => ({
    ...prevState,
    deleted: false,
  }));
};

const deleteFixtureNow = async () => {
  try {
    await deleteFixture(fixtureId).unwrap();
  } catch (error) {
    console.log(error);
  }
  setShow((prevState) => ({
    ...prevState,
    deleted: false,
  }));
  setFixtureId("");
};

const submit = async (data) => {
  try {
    await addFixture(data).unwrap();
  } catch (error) {
    console.log(error);
  }
  setShow((prevState) => ({
    ...prevState,
    added: false,
  }));
  setFixtureId("");
};

const resetEdit = async () => {
  setShow((prevState) => ({
    ...prevState,
    edited: false,
  }));
  setFixtureId("");
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

const memoFixtures = useMemo(() => { 
  return fixtures?.filter((player, key) => {
    let start = (curPage - 1) * pageSize;
    let end = curPage * pageSize;
    if (key >= start && key < end) return true;
  })
}, [fixtures, pageSize, curPage])
 if(isLoading) {
    return <div className="spinner"><Spinner /></div>
 }
  return (
    <Container>
      {memoFixtures.map(x => <div className="teams p-2" key={x._id}>
        <div className="team-name">{
          matchdays?.find(md => md._id === x.matchday)?.id
        }</div>
          <div>{getTime(x.kickOffTime)}</div>
          <div>{teams?.find(team => team._id === x.teamHome )?.name}</div>
          <div>{teams?.find(team => team._id === x.teamAway )?.name}</div>
          <div><Button onClick={() => editFixturePop(x._id)} className="btn btn-warning">Edit</Button></div>
          <div><Button onClick={() => deleteFixturePop(x._id)} className="btn btn-danger">Delete</Button></div>
          <div><Button>{x.stats.length === 0 ? 'Populate' : 'Depopulate'}</Button></div>
          <div><Button>Edit Stats</Button></div>
      </div>)}
      <div className="add-button p-2">
        <Button onClick={addFixturePop} className="btn btn-success">Add Fixture</Button>
      </div>
      <AddModal submit={submit} show={added} closeAdd={closeAdd}></AddModal>
      <EditModal
        fixtureId={fixtureId}
        resetEdit={resetEdit}
        show={edited}
        closeEdit={closeEdit}
      ></EditModal>
      <DeleteModal
        deleteFixtureNow={deleteFixtureNow}
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

export default Fixtures