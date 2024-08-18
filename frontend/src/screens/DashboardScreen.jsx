import { Container  } from "react-bootstrap"
import { NavLink, Outlet } from 'react-router-dom'

const DashboardScreen = () => {

  return (
    <Container>
        <div className="dashboard-wrapper p-2">
        <div className="dashboard-links p-2 m-2">
            <ul>
                <li><NavLink activeclassname="active" to='/admin/dashboard/users'>Users</NavLink></li>
                <li><NavLink activeclassname="active" to='/admin/dashboard/teams'>Teams</NavLink></li>
                <li><NavLink activeclassname="active" to='/admin/dashboard/positions'>Positions</NavLink></li>
                <li><NavLink activeclassname="active" to='/admin/dashboard/players'>Players</NavLink></li>
                <li><NavLink activeclassname="active" to='/admin/dashboard/fixtures'>Fixtures</NavLink></li>
                <li><NavLink activeclassname="active" to='/admin/dashboard/matchdays'>Matchdays</NavLink></li>
                <li><NavLink activeclassname="active" to='/admin/dashboard/leagues'>Leagues</NavLink></li>
            </ul>
        </div>
        <div className="outlet p-2 m-2">
<Outlet/>
        </div>
    </div>
    </Container>
    
  )
}

export default DashboardScreen