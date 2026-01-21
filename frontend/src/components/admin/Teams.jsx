import { useMemo, useState } from "react";
import {
  useGetQuery,
  useAddMutation,
  useDeletMutation,
} from "../../slices/teamApiSlice";
import { Button, Container, Spinner } from "react-bootstrap";
import { BsPencilFill } from "react-icons/bs";
import { AiFillDelete } from "react-icons/ai";
import Pagination from "../Pagination";
import AddModal from "./teamModals/AddModal";
import DeleteModal from "./teamModals/DeleteModal";
import EditModal from "./teamModals/EditModal";
import { toast } from "react-toastify";
const Teams = () => {
  const [show, setShow] = useState({
    edited: false,
    deleted: false,
    added: false,
  });
  const [teamId, setTeamId] = useState("");
  const [curPage, setCurPage] = useState(1);
  const [page, setPage] = useState(1);
  const { data = [], isLoading, isError } = useGetQuery();
  const [add] = useAddMutation();
  const [delet] = useDeletMutation();

  const { deleted, edited, added } = show;
  const pageSize = 8;
  let totalPages = Math.ceil(data?.length / pageSize);

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
    setTeamId("");
  };
  const closeDelete = () => {
    setShow((prevState) => ({
      ...prevState,
      deleted: false,
    }));
    setTeamId("");
  };

  const addTeam = () => {
    setShow((prevState) => ({
      ...prevState,
      added: true,
    }));
  };
  const editTeam = async (id) => {
    setShow((prevState) => ({
      ...prevState,
      edited: true,
    }));
    setTeamId(id);
  };
  const deleteTeam = (id) => {
    setShow((prevState) => ({
      ...prevState,
      deleted: true,
    }));
    setTeamId(id);
  };

  const cancelDelete = () => {
    setTeamId("");
    setShow((prevState) => ({
      ...prevState,
      deleted: false,
    }));
  };

  const deleteTeamNow = async () => {
    try {
      await delet(teamId).unwrap();
    } catch (error) {
      console.log(error);
    }
    setShow((prevState) => ({
      ...prevState,
      deleted: false,
    }));
    setTeamId("");
  };

  const submit = async (data) => {
    try {
      const res = await add(data).unwrap();
      toast.success(`${res?.name} added`);
    } catch (error) {
      toast.error(error?.data?.message);
    }
    setShow((prevState) => ({
      ...prevState,
      added: false,
    }));
    setTeamId("");
  };

  const resetEdit = async () => {
    setShow((prevState) => ({
      ...prevState,
      edited: false,
    }));
    setTeamId("");
  };

  {
    /* Button Controls */
  }
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
  }, [data, pageSize, curPage]);

  if (isLoading) {
    return (
      <div className="spinner">
        <Spinner />
      </div>
    );
  }

  if (isError) {
    return <div className="spinner">Something went wrong</div>;
  }

  return (
    <Container>
      {data?.length === 0 ? (
        <div className="spinner">No Teams Found!</div>
      ) : (
        <>
        <div className="flex justify-center">
          <div className="overflow-auto min-w-[320px]">
            <table className="border rounded-lg">
              <thead>
            <tr className="border-b border-gray-500 p-2">
              <th className="team-name px-4 py-2">Team</th>
              <th className="px-4 py-2">Code</th>
              <th className="px-4 py-2">Pld</th>
              <th className="px-4 py-2">W</th>
              <th className="px-4 py-2">D</th>
              <th className="px-4 py-2">L</th>
              <th className="px-4 py-2">GF</th>
              <th className="px-4 py-2">GA</th>
              <th className="px-4 py-2">GD</th>
              <th className="px-4 py-2">Pts</th>
              <th className="px-4 py-2"></th>
              <th className="px-4 py-2"></th>
            </tr>
            </thead>
        <tbody>
            {memoTeams?.map((x, idx) => (
              <tr className={`border border-gray-500 p-2 ${idx % 2 === 1 && 'bg-green-200'}`} key={x._id}>
                <td className="team-name px-4 py-2 font-bold">{x.name}</td>
                <td className="px-4 py-2 font-semibold text-center">{x.shortName}</td>
                <td className="px-4 py-2 font-semibold text-center">{x.played}</td>
                <td className="px-4 py-2 font-semibold text-center">{x.win}</td>
                <td className="px-4 py-2 font-semibold text-center">{x.draw}</td>
                <td className="px-4 py-2 font-semibold text-center">{x.loss}</td>
                <td className="px-4 py-2 font-semibold text-center">{x.goalsScored}</td>
                <td className="px-4 py-2 font-semibold text-center">{x.goalsConceded}</td>
                <td className="px-4 py-2 font-semibold text-center">{x.goalsScored - x.goalsConceded}</td>
                <td className="px-4 py-2 font-semibold text-center">{x.points}</td>
                <td className="btn-click px-4 py-2 text-center" onClick={() => editTeam(x._id)}>
                  <BsPencilFill color="black" />
                </td>
                <td className="btn-click px-4 py-2 text-center" onClick={() => deleteTeam(x._id)}>
                  <AiFillDelete color="black" />
                </td>
              </tr>
            ))}
            </tbody>
            </table>
          </div>
          </div>
          <Pagination
            curPage={curPage}
            viewFirstPage={viewFirstPage}
            viewPreviousPage={viewPreviousPage}
            viewNextPage={viewNextPage}
            viewLastPage={viewLastPage}
            totalPages={totalPages}
            onSubmit={onSubmit}
            page={page}
            changePage={changePage}
          />
          </>
          
      )}
      <div className="add-button p-2">
        <Button onClick={addTeam}>
          Add Team
        </Button>
      </div>
      {added && <AddModal submit={submit} closeAdd={closeAdd} />}
      {edited && (
        <EditModal
          teamId={teamId}
          resetEdit={resetEdit}
          closeEdit={closeEdit}
        />
      )}
      {deleted && (
        <DeleteModal
        teamId={teamId}
          deleteTeamNow={deleteTeamNow}
          cancelDelete={cancelDelete}
          closeDelete={closeDelete}
        />
      )}
    </Container>
  );
};

export default Teams;
