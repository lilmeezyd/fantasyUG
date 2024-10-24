import {  useMemo, useState } from "react";
import {
  useGetMatchdaysQuery,
  useStartMatchdayMutation,
  useAddMatchdayMutation,
  useCreateAutosForMdMutation,
  useDeleteMatchdayMutation,
  useUpdateMatchdayDataMutation,
  useUpdateMatchdayTOWMutation,
  useEndMatchdayDataMutation
} from "../../slices/matchdayApiSlice";
import { useSetLivePicksMutation } from "../../slices/livePicksApiSlice";
import { useSetLastAndCurrentRankMutation } from "../../slices/leagueApiSlice";
import { Container, Button, Spinner } from "react-bootstrap";
import Pagination from "../Pagination"
import AddModal from "./matchdayModals/AddModal";
import DeleteModal from "./matchdayModals/DeleteModal";
import EditModal from "./matchdayModals/EditModal";
import StartModal from "./matchdayModals/StartModal";
import getTime from "../../utils/getTime";

const Matchdays = () => {  
  const [show, setShow] = useState({
    edited: false,
    deleted: false,
    added: false,
    start: false
  });
  const [matchdayId, setMatchdayId] = useState("");
  const [curPage, setCurPage] = useState(1);
  const [page, setPage] = useState(1);
  const { data: matchdays,  isLoading}  = useGetMatchdaysQuery()
  const [addMatchday ] = useAddMatchdayMutation()
  const [ deleteMatchday ] = useDeleteMatchdayMutation()
  const [ startMatchday ] = useStartMatchdayMutation()
  const [ setLivePicks ] = useSetLivePicksMutation()
  const [ endMatchdayData ] = useEndMatchdayDataMutation()
  const [ updateMatchdayData ] = useUpdateMatchdayDataMutation()
  const [ updateMatchdayTOW ] = useUpdateMatchdayTOWMutation()
  const [ createAutosForMd ] = useCreateAutosForMdMutation()
  const [ setLastAndCurrentRank ] = useSetLastAndCurrentRankMutation()
  const {deleted, edited, added, start } = show
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
const closeStart = () => {
  setShow((prevState) => ({
    ...prevState,
    start: false,
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

const startMatchdayPop = async (id) => {
  setShow((prevState) => ({
    ...prevState,
    start: true,
  }));
  setMatchdayId(id);
}
const cancelStart = () => {
  setMatchdayId("");
  setShow((prevState) => ({
    ...prevState,
    start: false,
  }));
};

const startMatchdayNow = async () => {
  setShow((prevState) => ({
    ...prevState,
    start: false,
  }));
  try {
    await startMatchday(matchdayId).unwrap();
  } catch (error) {
    console.log(error);
  }
  setMatchdayId("");
};
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
  setShow((prevState) => ({
    ...prevState,
    deleted: false,
  }));
  try {
    await deleteMatchday(matchdayId).unwrap();
  } catch (error) {
    console.log(error);
  }
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

const resetEdit = async () => {
  setShow((prevState) => ({
    ...prevState,
    edited: false,
  }));
  setMatchdayId("");
};

const setLive = async () => {
  try {
  await setLivePicks().unwrap()
  } catch (error) {
    console.log(error)
  }
}

const updateMDdata = async (id) => {
  try {
    const res = await updateMatchdayData(id).unwrap()
    console.log(res)
  } catch (error) {
    console.log(error)
  }
}
const updateTOW = async (id) => {
  try {
    const res = await updateMatchdayTOW(id).unwrap()
    console.log(res)
  } catch (error) {
    console.log(error)
  }
}
const updateAutoSubs = async (id) => {
  try {
    const res = await createAutosForMd(id).unwrap()
    console.log(res)
  } catch (error) {
    console.log(error)
  }
}
const setPastRank = async () => {
  try {
    const res = await setLastAndCurrentRank().unwrap()
    console.log(res)
  } catch (error) {
    console.log(error)
  }
}
const endMatchday = async (id) => {
  try {
    const res = await endMatchdayData(id).unwrap()
    console.log(res)
  } catch (error) {
    console.log(error)
  }
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
    {memoMatchdays?.map(x => <div className="teams p-2" key={x._id}>
          <div className="team-name">{x.name}</div>
          <div>{getTime(x.deadlineTime)}</div>
          <div><Button onClick={()=>startMatchdayPop(x._id)}>Start</Button></div>
          <div><Button onClick={() => editMatchdayPop(x._id)} className="btn btn-warning">Edit</Button></div>
          <div><Button onClick={() => deleteMatchdayPop(x._id)} className="btn btn-danger">Delete</Button></div>
          <div><Button onClick={() => updateMDdata(x._id)} className="btn btn-success">Update Data</Button></div>
          <div><Button onClick={() => updateTOW(x._id)} className="btn btn-success">Update TOW</Button></div>
          <div><Button onClick={() => updateAutoSubs(x._id)} className="btn btn-success">Auto subs</Button></div>
          <div><Button onClick={() => endMatchday(x._id)} className="btn btn-success">End MD</Button></div>
      </div>)}
      <div>
      <div className="add-button p-2">
      <div><Button onClick={setLive}>Set Live Picks</Button></div>
      </div>
      <div className="add-button p-2">
      <div><Button onClick={setPastRank}>Set Past Ranks</Button></div>
      </div>
      <div className="add-button p-2">
        <Button onClick={addMatchdayPop} className="btn btn-success">Add Matchday</Button>
      </div>
      </div>
      <AddModal submit={submit} show={added} closeAdd={closeAdd}></AddModal>
      <EditModal
        matchdayId={matchdayId}
        resetEdit={resetEdit}
        show={edited}
        closeEdit={closeEdit}
      ></EditModal>
      <StartModal
      startMatchdayNow={startMatchdayNow}
      cancelStart={cancelStart}
      show={start}
      closeStart={closeStart}
      ></StartModal>
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