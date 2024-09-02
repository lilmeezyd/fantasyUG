import { useMemo, useState, useEffect } from "react";
import {
  useGetFixturesQuery,
  useAddFixtureMutation,
  useDeleteFixtureMutation
} from "../../slices/fixtureApiSlice";
import { useGetQuery } from "../../slices/teamApiSlice"
import { useGetMatchdaysQuery } from "../../slices/matchdayApiSlice";
import { Container, Button, Spinner } from "react-bootstrap";
import AddModal from "./fixtureModals/AddModal";
import DeleteModal from "./fixtureModals/DeleteModal";
import EditModal from "./fixtureModals/EditModal";
import {
  BsChevronLeft,
  BsChevronRight,
  BsChevronDoubleLeft,
  BsChevronDoubleRight,
} from "react-icons/bs";
import getTime from "../../utils/getTime";
import { getPm, getPmString } from "../../utils/getPm";

const Fixtures = () => {  
  const [show, setShow] = useState({
    edited: false,
    deleted: false,
    added: false,
  });
  const [fixtureId, setFixtureId] = useState("");
  const [curPage, setCurPage] = useState(1);
  const [page, setPage] = useState(1);
  const [stats, displayStats] = useState(false);
  const [copy, setCopy] = useState([]);
  const { data: fixtures, isLoading}  = useGetFixturesQuery()
  const [addFixture ] = useAddFixtureMutation()
  const [ deleteFixture ] = useDeleteFixtureMutation()
  const { data: teams } = useGetQuery()
  const { data: matchdays} = useGetMatchdaysQuery()
      const {deleted, edited, added } = show
  const pageSize = 5
  let totalPages = Math.ceil(fixtures?.length / pageSize);

  useEffect(() => {
    const copyFix = fixtures?.length > 0 ? [...fixtures] : [];
    copyFix?.sort((x, y) => (x?.deadlineTime > y?.deadlineTime ? 1 : -1));
    setCopy(fixtures);
  }, [fixtures]);

  const onClick = () => {
    displayStats((prevState) => !prevState);
  };

  const onDecrement = () => {
    setPage((prevState) => prevState - 1);
  };

  const onIncrement = () => {
    setPage((prevState) => prevState + 1);
  };

  const returnDay = (data, idx) => {
    if (idx === 0) {
      return (
        <>
          <p className="date">{new Date(data[0].kickOffTime).toDateString()}</p>
        </>
      );
    }
    if (idx > 0) {
      return new Date(data[idx - 1].kickOffTime).toDateString() ===
        new Date(data[idx].kickOffTime).toDateString() ? (
        ""
      ) : (
        <>
          <p className="date">
            {new Date(data[idx].kickOffTime).toDateString()}
          </p>
        </>
      );
    }
  };

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
{/*const onSubmit = (e) => {
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
}, [fixtures, pageSize, curPage])*/}
 if(isLoading) {
    return <div className="spinner"><Spinner /></div>
 }
  return (
    <Container>
      {/*memoFixtures.map(x => <div className="teams p-2" key={x._id}>
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
      </div>)*/}
      <div className="fix-body">
  <section className="btn-wrapper p-2">
    <button
      disabled={page === 1 ? true : false}
      onClick={onDecrement}
      className={`${page === +1 && "btn-hide"} btn-controls`}
      id="prevButton"
    >
      <BsChevronLeft />
    </button>
    <button
      disabled={page === fixtures?.length ? true : false}
      onClick={onIncrement}
      className={`${page === fixtures?.length && "btn-hide"} btn-controls`}
      id="nextButton"
    >
      <BsChevronRight />
    </button>
  </section>
  {copy
    ?.filter((x) => +x?._id?.id === +page)
    ?.map((fixture) => (
      <div key={fixture?._id?._id}>
        <div className="deadline">
          <div>{fixture?._id?.name}</div>
          <div>Deadline:</div>
          <div>{getTime(fixture?._id?.deadlineTime)}</div>
        </div>
        <div>
          {fixture?.fixtures?.map((x, idx) => (
            <div key={x._id}>
              <div className="deadline">
                {returnDay(fixture?.fixtures, idx)}
              </div>
              <div
                onClick={onClick}
                className={`${stats && "bg-teams"} teams-normal`}
              >
                <div className="home">
                  <div className="team">
                    {teams?.find((team) => team._id === x.teamHome)?.name}
                  </div>
                  <div className="ticker-image"></div>
                  <div
                    className={`${x?.stats?.length > 0 ? "score" : "time-1"}`}
                  >
                    {x?.stats?.length > 0
                      ? x?.stats
                          ?.filter((x) => x.identifier === "goalsScored")[0]
                          .home.map((x) => x.value)
                          .reduce((a, b) => a + b, 0) +
                        x?.stats
                          ?.filter((x) => x.identifier === "ownGoals")[0]
                          .away.map((x) => x.value)
                          .reduce((a, b) => a + b, 0)
                      : getPmString(
                          new Date(getTime(x?.kickOffTime)).toLocaleTimeString()
                        )}
                  </div>
                </div>
                <div className="away">
                  <div
                    className={`${x?.stats?.length > 0 ? "score" : "time-2"}`}
                  >
                    {x?.stats?.length > 0
                      ? x?.stats
                          ?.filter((x) => x.identifier === "goalsScored")[0]
                          .home.map((x) => x.value)
                          .reduce((a, b) => a + b, 0) +
                        x?.stats
                          ?.filter((x) => x.identifier === "ownGoals")[0]
                          .away.map((x) => x.value)
                          .reduce((a, b) => a + b, 0)
                      : getPm(
                          new Date(getTime(x?.kickOffTime)).toLocaleTimeString()
                        )}
                  </div>
                  <div className="ticker-image"></div>
                  <div className="team">
                    {teams?.find((team) => team._id === x.teamAway)?.name}
                  </div>
                </div>
              </div>
              <div className="fix-admin-buttons">
              <div><Button onClick={() => editFixturePop(x._id)} className="btn btn-warning">Edit</Button></div>
              <div><Button onClick={() => deleteFixturePop(x._id)} className="btn btn-danger">Delete</Button></div>
                <div>
                  <Button>
                    {x?.stats?.length === 0 ? "Populate" : "Depopulate"}
                  </Button>
                </div>
                <div>
                  <Button>Edit Stats</Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    ))}
</div>
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

{/*<Pagination curPage={curPage} viewFirstPage={viewFirstPage}
         viewPreviousPage={viewPreviousPage}
        viewNextPage={viewNextPage} viewLastPage={viewLastPage}
         totalPages={totalPages} onSubmit={onSubmit} page={page} changePage={changePage} />*/}
    </Container>
  )
}

export default Fixtures