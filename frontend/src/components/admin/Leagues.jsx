import { useReducer, useEffect } from "react";
import { Container, Button } from "react-bootstrap";
import { Link, Outlet, useLocation } from 'react-router-dom'
const Leagues = () => {
  const { pathname } = useLocation()

const reducer = (state, action) => {
  if(action.type === 'TEAM') {
    return {
      ...state,
      teamLeagues: 'league-active',
      overallLeague: '',
      privateLeagues: ''
    }
  }
  if(action.type === 'OVERALL') {
    return {
      ...state,
      teamLeagues: '',
      overallLeague: 'league-active',
      privateLeagues: ''
    }
  }
  if(action.type === 'PRIVATE') {
    return {
      ...state,
      teamLeagues: '',
      overallLeague: '',
      privateLeagues: 'league-active'
    }
  }
}
  const [state, dispatch] = useReducer(reducer, { teamLeagues: '', overallLeague: 'league-active', privateLeagues: ''})
  const { teamLeagues, overallLeague, privateLeagues } = state

  useEffect(() => {
    if(pathname.includes('privateleagues')) {
      dispatch({type: 'PRIVATE'})
    }
    if(pathname.includes('overallleagues')) {
      dispatch({type: 'OVERALL'})
    }
    if(pathname.includes('teamleagues')) {
      dispatch({type: 'TEAM'})
    }
  }, [pathname])
 /* const changeToTeam = () => {
    dispatch({type: 'TEAM'})
  }
  const changeToOverall = () => {
    dispatch({type: 'OVERALL'})
  }
  const changeToPrivate = () => {
    dispatch({type: 'PRIVATE'})
  }
  */
  
  return (
    <Container>
      <div className="leagues p-2">
        <Link className={`${teamLeagues} league-baby`} to='/admin/dashboard/leagues/teamleagues'>Team</Link>
        <Link className={`${overallLeague} league-baby`} to='/admin/dashboard/leagues/overallleagues'>Overall</Link>
        <Link className={`${privateLeagues} league-baby`} to='/admin/dashboard/leagues/privateleagues'>Private</Link>
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