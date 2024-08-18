import { useMemo, useState } from "react";
import {
  useGetLeaguesQuery,
  useAddLeagueMutation,
  useDeleteLeagueMutation
} from "../../slices/leagueApiSlice";
import { Container, Button, Spinner } from "react-bootstrap";
import { Link, Outlet } from 'react-router-dom'

const Leagues = () => {  
  const [show, setShow] = useState({
    edited: false,
    deleted: false,
    added: false,
  });
  const [leagueId, setLeagueId] = useState("");
  const [leagueName, setLeagueName] = useState({});
  const [curPage, setCurPage] = useState(1);
  const [page, setPage] = useState(1);
  const { data: leagues,  isLoading} = useGetLeaguesQuery()
  const [addLeague ] = useAddLeagueMutation()
  const [ deleteLeague ] = useDeleteLeagueMutation()
  const {deleted, edited, added } = show


 const closeAdd = () => {
  setShow((prevState) => ({
    ...prevState,
    added: false,
  }));
};

const addLeaguePop = () => {
  setShow((prevState) => ({
    ...prevState,
    added: true,
  }));
};

 const submit = async (data) => {
  try {
    await addLeague(data).unwrap();
  } catch (error) {
    console.log(error);
  }
  setShow((prevState) => ({
    ...prevState,
    added: false,
  }));
  setLeagueId("");
};
 if(isLoading) {
    return <div className="spinner"><Spinner /></div>
 }
  return (
    <Container>
      <div className="leagues p-2">
        <Link to='/admin/dashboard/leagues/teamleagues'><Button>Team Leagues</Button></Link>
        <Link to='/admin/dashboard/leagues/overallleagues'><Button>Overall Leagues</Button></Link>
        <Link to='/admin/dashboard/leagues/privateleagues'><Button>Private Leagues</Button></Link>
      </div>
      <Outlet />
      {/*<div className="add-button p-2">
        <Button onClick={addLeaguePop} className="btn btn-success">Add League</Button>
      </div>
      <AddModal submit={submit} show={added} closeAdd={closeAdd}></AddModal>*/}
    </Container>
  )
}

export default Leagues