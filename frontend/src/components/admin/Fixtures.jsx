import { useMemo, useState, useEffect } from "react";
import {
  useGetFixturesQuery,
  useAddFixtureMutation,
  useDeleteFixtureMutation
} from "../../slices/fixtureApiSlice";
import { useGetQuery } from "../../slices/teamApiSlice"
import { Container, Button, Spinner } from "react-bootstrap";
import AddModal from "./fixtureModals/AddModal";
import DeleteModal from "./fixtureModals/DeleteModal";
import EditModal from "./fixtureModals/EditModal";
import {
  BsChevronLeft,
  BsChevronRight
} from "react-icons/bs";
import getTime from "../../utils/getTime";
import getTime1 from "../../utils/getTime1";
import { getPm, getPmString } from "../../utils/getPm";
import FixtureItemAdmin from "./FixtureItemAdmin";

const Fixtures = () => {  
  const [show, setShow] = useState({
    edited: false,
    deleted: false,
    added: false,
  });
  const [fixtureId, setFixtureId] = useState("");
  const [page, setPage] = useState(1);
  const [stats, displayStats] = useState(false);
  const [copy, setCopy] = useState([]);
  const { data: fixtures, isLoading}  = useGetFixturesQuery()
  const [addFixture ] = useAddFixtureMutation()
  const [ deleteFixture ] = useDeleteFixtureMutation()
  const { data: teams } = useGetQuery()
      const {deleted, edited, added } = show

  useEffect(() => {
    const copyFix = fixtures?.length > 0 ? [...fixtures] : [];
    copyFix?.sort((x, y) => (x?.kickOffTime > y?.kickOffTime ? 1 : -1));
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

 if(isLoading) {
    return <div className="spinner"><Spinner /></div>
 }
  return (
    <Container>
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
          <div> 
          {getTime1(fixture?._id?.deadlineTime)},&nbsp;
          {getPmString(
                          fixture?._id?.deadlineTime
                        )}&nbsp;
                        {getPm(fixture?._id?.deadlineTime)}
          </div>
        </div>
        <div>
          {fixture?.fixtures?.map((x, idx) => (
            <div key={x._id}>
              <div className="deadline">
                {returnDay(fixture?.fixtures, idx)}
              </div>
              <FixtureItemAdmin x={x} editFixturePop={editFixturePop} deleteFixturePop={deleteFixturePop} />
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

    </Container>
  )
}

export default Fixtures