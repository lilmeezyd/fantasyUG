import { useEffect, useMemo, useState } from "react";
import {
  useGetLeaguesMutation,
  useGetLeagueMutation,
  useAddLeagueMutation,
  useDeleteLeagueMutation,
  useEditLeagueMutation,
} from "../../slices/leagueApiSlice";
import { Container, Button, Spinner } from "react-bootstrap";

const Leagues = () => {  
  const [leagues, setLeagues] = useState([]);
  const [show, setShow] = useState({
    edited: false,
    deleted: false,
    added: false,
  });
  const [leagueId, setLeagueId] = useState("");
  const [leagueName, setLeagueName] = useState({});
  const [curPage, setCurPage] = useState(1);
  const [page, setPage] = useState(1);
  const [ getLeagues, { isLoading} ] = useGetLeaguesMutation()
  const [ getLeague ] = useGetLeagueMutation()
  const [addLeague ] = useAddLeagueMutation()
  const [ editLeague ] = useEditLeagueMutation()
  const [ deleteLeague ] = useDeleteLeagueMutation()

  useEffect(() => {
    const fetchLeagues = async () => {
       try {
         const res = await getLeagues().unwrap()
         setLeagues(res)
         console.log(res)
       } catch (error) {
         console.log(error)
       }
   }
   fetchLeagues()
 
   
 }, [getLeagues])
 if(isLoading) {
    return <div className="spinner"><Spinner /></div>
 }
  return (
    <div>Leagues</div>
  )
}

export default Leagues