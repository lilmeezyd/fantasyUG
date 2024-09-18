import { Container, Button } from "react-bootstrap";
import { Link, Outlet } from 'react-router-dom'
const Leagues = () => {   
  
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