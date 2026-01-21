import { useMemo, useState, useEffect } from "react";
import {
  useGetFixturesQuery,
  useAddFixtureMutation,
  useDeleteFixtureMutation,
} from "../../slices/fixtureApiSlice";
import { useGetMatchdaysQuery } from "../../slices/matchdayApiSlice";
import { useGetQuery } from "../../slices/teamApiSlice";
import { Container, Button, Spinner } from "react-bootstrap";
import AddModal from "./fixtureModals/AddModal";
import DeleteModal from "./fixtureModals/DeleteModal";
import EditModal from "./fixtureModals/EditModal";
import ResetModal from "./fixtureModals/ResetModal";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";
import getTime from "../../utils/getTime";
import getTime1 from "../../utils/getTime1";
import { getPm, getPmString } from "../../utils/getPm";
import FixtureItemAdmin from "./FixtureItemAdmin";
import fixturesByMatchday from "../../hooks/fixturesByMatchday";
import {
  usePopulateFixtureMutation,
  useDepopulateFixtureMutation,
} from "../../slices/fixtureApiSlice";
import { toast } from "react-toastify";

const Fixtures = () => {
  const [show, setShow] = useState({
    edited: false,
    deleted: false,
    added: false,
    reset: false,
  });
  const [fixtureId, setFixtureId] = useState("");
  const [page, setPage] = useState(1);
  const [minGW, setMinGW] = useState(1);
  const [maxGW, setMaxGW] = useState(1);
  const [stats, displayStats] = useState(false);
  const [copy, setCopy] = useState([]);
  const { data: fixtures = [], isLoading } = useGetFixturesQuery();
  const { data: matchdays } = useGetMatchdaysQuery();
  const [addFixture] = useAddFixtureMutation();
  const [deleteFixture] = useDeleteFixtureMutation();
  const [depopulateFixture] = useDepopulateFixtureMutation();
  const { data: teams } = useGetQuery();
  const { deleted, edited, added, reset } = show;
  const groupedFixtures = fixturesByMatchday(fixtures);

  useEffect(() => {
    const copyFix = fixtures?.length > 0 ? [...fixtures] : [];
    copyFix?.sort((x, y) => (x?.kickOffTime > y?.kickOffTime ? 1 : -1));
    setCopy(fixtures);
  }, [fixtures]);

  useEffect(() => {
    const nextMatchday = matchdays?.find((x) => x.next === true);
    const ids = matchdays?.map((x) => x.id) || [];
    const smallest = ids?.length === 0 ? 1 : Math.min(...ids);
    const largest = ids?.length === 0 ? 1 : Math.max(...ids);
    setMinGW(smallest);
    setMaxGW(largest);
    if (nextMatchday) {
      const nextId = nextMatchday?.id;
      if (nextId === smallest) {
        setPage(smallest);
      } else {
        setPage(nextId - 1);
      }
    } else {
      setPage(largest);
    }
  }, [matchdays]);

  const superGroupedFixtures = useMemo(() => {
    const sortable = [...groupedFixtures];
    const filtered = sortable.find((x) => x.matchday === page) || {};
    const { matchday, deadlineTime, deadlineDate } = filtered;
    const returnedFixtures =
      filtered.fixtures?.sort((x, y) => {
        if (x.kickOffTime !== y.kickOffTime) {
          return x.kickOffTime > y.kickOffTime ? 1 : -1;
        }
        return x.teamHome?.localeCompare(y.teamHome);
      }) || [];

    return { matchday, deadlineDate, deadlineTime, returnedFixtures };
  }, [groupedFixtures, page]);
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
  const resetFixturePop = (id) => {
    setShow((prevState) => ({
      ...prevState,
      reset: true,
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

  const cancelReset = () => {
    setFixtureId("");
    setShow((prevState) => ({
      ...prevState,
      reset: false,
    }));
  };

  const resetFixtureNow = async (x, y) => {
    try {
      const res = await depopulateFixture({ y, x }).unwrap();
      console.log(res);
    } catch (error) {
      console.log(error);
      toast.error("Fixture reset failed!");
    }
    setShow((prevState) => ({
      ...prevState,
      reset: false,
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

  const filteredFixtures = useMemo(() => {
    return copy?.filter((x) => +x?._id?.id === +page);
  }, [copy, page]);

  if (isLoading) {
    return (
      <div className="spinner">
        <Spinner />
      </div>
    );
  }
  return (
    <Container>
      <div className="fix-body">
        <section className="btn-wrapper p-2">
          <button
            disabled={page === minGW ? true : false}
            onClick={onDecrement}
            className={`${page === +minGW && "btn-hide"} btn-controls`}
            id="prevButton"
          >
            <BsChevronLeft />
          </button>
          <button
            disabled={page === maxGW ? true : false}
            onClick={onIncrement}
            className={`${page === maxGW && "btn-hide"} btn-controls`}
            id="nextButton"
          >
            <BsChevronRight />
          </button>
        </section>
        <div className="deadline">
          <h3 className="font-bold">
            Matchday {superGroupedFixtures.matchday}
          </h3>
          <h4 className="font-semibold">Deadline:</h4>
          <div className="flex justify-center w-[50%]">
            <h4 className="p-2">{superGroupedFixtures.deadlineDate},</h4>
            <h4 className="p-2">{superGroupedFixtures.deadlineTime}</h4>
          </div>
        </div>
        <div className="w-[80%] h-[1px] bg-gray-500 flex justify-center m-auto"></div>
        {superGroupedFixtures?.returnedFixtures?.map((fixture) => (
          <FixtureItemAdmin
            editFixturePop={editFixturePop}
            deleteFixturePop={deleteFixturePop}
            resetFixturePop={resetFixturePop}
            fixture={fixture}
            key={fixture._id}
          />
        ))}
      </div>
      <div className="add-button p-2">
        <Button onClick={addFixturePop} className="btn btn-success">
          Add Fixture
        </Button>
      </div>
      {added && <AddModal submit={submit} closeAdd={closeAdd} />}
      {edited && (
        <EditModal
          fixtureId={fixtureId}
          resetEdit={resetEdit}
          closeEdit={closeEdit}
        />
      )}
      {deleted && (
        <DeleteModal
          fixtureId={fixtureId}
          deleteFixtureNow={deleteFixtureNow}
          cancelDelete={cancelDelete}
          closeDelete={closeDelete}
        />
      )}

      {reset && (
        <ResetModal
          fixtureId={fixtureId}
          resetFixtureNow={resetFixtureNow}
          cancelReset={cancelReset}
        />
      )}
    </Container>
  );
};

export default Fixtures;
