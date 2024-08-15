import { useMemo, useState } from "react";
import {
  useGetLeaguesQuery,
  useAddLeagueMutation,
  useDeleteLeagueMutation
} from "../../slices/leagueApiSlice";
import { Container, Button, Spinner } from "react-bootstrap";
import AddModal from "./leagueModals/AddModal";

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
      <div>Leagues</div>
      <div className="add-button p-2">
        <Button onClick={addLeaguePop} className="btn btn-success">Add League</Button>
      </div>
      <AddModal submit={submit} show={added} closeAdd={closeAdd}></AddModal>
    </Container>
  )
}

export default Leagues