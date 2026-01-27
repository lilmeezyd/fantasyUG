import { useState, useMemo } from "react";
import { Container, Spinner, Button } from "react-bootstrap";
import { BsPencilFill } from "react-icons/bs";
import { AiFillDelete } from "react-icons/ai"
import Pagination from "../Pagination"
import {
  useUpdateTeamTablesMutation,
  useGetTeamLeaguesQuery,
  useAddTeamLeagueMutation,
  useDeleteTeamLeagueMutation,
} from "../../slices/leagueApiSlice";
import AddModal from "./teamLeagueModals/AddModal"
import EditModal from "./teamLeagueModals/EditModal"
import DeleteModal from "./teamLeagueModals/DeleteModal"
import formattedLeagues from "../../hooks/formattedLeagues";
import { toast } from "react-toastify";
const TeamLeagues = () => {
  const [show, setShow] = useState({
    edited: false,
    deleted: false,
    added: false,
  });
  const [teamLeagueId, setTeamLeagueId] = useState("");
  const [curPage, setCurPage] = useState(1);
  const [page, setPage] = useState(1);
  const { data: teamLeagues = [], isLoading, isError } = useGetTeamLeaguesQuery();
  const [addTeamLeague] = useAddTeamLeagueMutation()
  const [deleteTeamLeague] = useDeleteTeamLeagueMutation()
  const [updateTeamTables, { isLoading: a }] = useUpdateTeamTablesMutation()

  const { deleted, edited, added } = show
  const pageSize = 5
  let totalPages = Math.ceil(teamLeagues?.length / pageSize);
  const formattedDetails = formattedLeagues(teamLeagues)
  console.log(formattedDetails)

  const closeAdd = () => {
    setShow((prevState) => ({
      ...prevState, added: false
    }))
  }

  const addTeamLeaguePop = () => {
    setShow((prevState) => ({
      ...prevState, added: true
    }))
  }
  const editTeamLeaguePop = async (id) => {
    setShow((prevState) => ({
      ...prevState, edited: true
    }))
    setTeamLeagueId(id)
  }
  const deleteTeamLeaguePop = (id) => {
    setShow((prevState) => ({
      ...prevState, deleted: true
    }))
    setTeamLeagueId(id)
  }
  const submit = async (data) => {
    try {
      await addTeamLeague(data).unwrap()
    } catch (error) {
      console.log(error)
    }
    setShow((prevState) => ({
      ...prevState, added: false
    }))
    setTeamLeagueId('')
  }

  const closeEdit = () => {
    setShow((prevState) => ({
      ...prevState, edited: false
    }))
    setTeamLeagueId('')
  }
  const closeDelete = () => {
    setShow((prevState) => ({
      ...prevState, deleted: false
    }))
    setTeamLeagueId('')
  }

  const resetEdit = async () => {
    setShow((prevState) => ({
      ...prevState, edited: false
    }))
    setTeamLeagueId('')
  }

  const cancelDelete = () => {
    setTeamLeagueId('')
    setShow((prevState) => ({
      ...prevState, deleted: false
    }))
  }

  const deleteTeamLeagueNow = async () => {
    try {
      await deleteTeamLeague(teamLeagueId).unwrap()
    } catch (error) {
      console.log(error)
    }
    setShow((prevState) => ({
      ...prevState, deleted: false
    }))
    setTeamLeagueId('')
  }

  const updateTeamLeagues = async () => {
    const res = await updateTeamTables().unwrap()
    toast.success(res?.message)
  }

  {/* Button Controls */ }
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

  const memoTeamLeagues = useMemo(() => {
    return teamLeagues?.filter((teamLeague, key) => {
      let start = (curPage - 1) * pageSize;
      let end = curPage * pageSize;
      if (key >= start && key < end) return true;
    });
  }, [teamLeagues, pageSize, curPage])

  if (isLoading) {
    return (
      <div className="spinner">
        <Spinner />
      </div>
    );
  }

  if (isError) {
    return (<div className="spinner">Something went wrong</div>)
  }
  return (
    <Container className="p-2">
      {!memoTeamLeagues?.length ? <div className="spinner">No Team Leagues Found!</div> :
        <>
        <div className="overflow-auto">
        <table className="border rounded-lg">
          <thead>
            <tr className="border-b border-gray-400">
              <th className="team-name px-4 py-2">Name</th>
              <th className="px-4 py-2 text-center">Start GW</th>
              <th className="px-4 py-2 text-center">End GW</th>
              <th className="px-4 py-2 text-center">Current Managers</th>
              <th className="px-4 py-2 text-center">New Entrants</th>
              <th className="px-4 py-2 text-center">Created</th>
              <th className="px-4 py-2 text-center">Last Updated</th>
              <th className="px-4 py-2"></th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {formattedDetails?.map((x, idx) => <tr className={`${idx%2 === 1 ? 'bg-green-200' : 'bg-white'} border border-gray-400 font-semibold`} key={x._id}>
          <td className="team-name px-4 py-2">{x?.team?.name}</td>
          <td className="px-4 py-2 text-center">{x?.startMatchday}</td>
          <td className="px-4 py-2 text-center">{x?.endMatchday}</td>
          <td className="px-4 py-2 text-center">{x?.standings}</td>
          <td className="px-4 py-2 text-center">{x?.entrants}</td>
          <td className="px-4 py-2 text-center">
            <span>{x?.createdDate}</span>,&nbsp;<span>{x?.createdTime}</span>
          </td>
          <td className="px-4 py-2 text-center">
            <span>{x?.updatedDate}</span>,&nbsp;<span>{x?.updatedTime}</span>
          </td>
          <td className="px-4 py-2">
            <Button
              onClick={() => editTeamLeaguePop(x._id)}
              style={{ background: 'white', border: '1px solid black' }}
            >
              <BsPencilFill color="black" />
            </Button>
          </td>
          <td className="px-4 py-2">
            <Button
              onClick={() => deleteTeamLeaguePop(x._id)}
              style={{ background: 'white', border: '1px solid black' }}
            >
              <AiFillDelete color="black" />
            </Button>
          </td>
        </tr>)}
          </tbody>
        </table>
        </div>
          <Pagination curPage={curPage} viewFirstPage={viewFirstPage}
            viewPreviousPage={viewPreviousPage}
            viewNextPage={viewNextPage} viewLastPage={viewLastPage}
            totalPages={totalPages} onSubmit={onSubmit} page={page} changePage={changePage} />
        </>
      }
      <div className="add-button p-2">
        <Button onClick={addTeamLeaguePop} className="btn btn-success">
          Add Team League
        </Button>
        {!!memoTeamLeagues?.length && <Button
          onClick={updateTeamLeagues}
        >{a === true ? <Spinner /> : `Update Tables`}
        </Button>}
      </div>

      {added && <AddModal submit={submit} closeAdd={closeAdd} />}
            {edited && (
              <EditModal
                teamLeagueId={teamLeagueId}
                resetEdit={resetEdit}
                closeEdit={closeEdit}
              />
            )}
            {deleted && (
              <DeleteModal
              teamLeagueId={teamLeagueId}
                deleteTeamLeagueNow={deleteTeamLeagueNow}
                cancelDelete={cancelDelete}
                closeDelete={closeDelete}
              />
            )}
    </Container> 
  );
};

export default TeamLeagues;
