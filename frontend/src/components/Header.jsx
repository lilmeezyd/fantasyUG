import { Navbar, Nav, Container, NavDropdown, Badge } from "react-bootstrap";
import { FaSignInAlt, FaSignOutAlt } from "react-icons/fa";
import { LinkContainer } from "react-router-bootstrap";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useLogoutMutation } from "../slices/userApiSlice";
import { useGetMatchdaysQuery } from "../slices/matchdayApiSlice";
import { logout } from "../slices/authSlice";

const Header = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [logoutApiCall] = useLogoutMutation();
const { data: matchdays, isLoading: isMatchday } = useGetMatchdaysQuery();
const md = matchdays?.find(matchday => matchday?.next === true)
  const logoutHandler = async () => {
    try {
      await logoutApiCall().unwrap();
      dispatch(logout());
      navigate("/"); 
    } catch (err) {
      console.log(err);
    }
  };
  return (
    <header className="header">
      <Navbar className="bg-body-tertiary" expand="lg" collapseOnSelect>
        <Container>
          <LinkContainer
          className={`hover:text-gray-300 ${
                      location.pathname === "/"
                        ? "text-blue-400"
                        : "text-gray-500"
                    }`} to="/">
            <Navbar.Brand>Fantasy UG</Navbar.Brand>
          </LinkContainer>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              {userInfo && userInfo?.roles?.ADMIN && (
                <>
                <LinkContainer
                className={`hover:text-gray-300 ${
                      location.pathname === "/admin/dashboard"
                        ? "text-blue-400"
                        : "text-gray-500"
                    }`} to="/admin/dashboard">
                  <Nav.Link>Dashboard</Nav.Link>
                </LinkContainer>
                <LinkContainer
                className={`hover:text-gray-300 ${
                      location.pathname === "/admin/dashboard/users"
                        ? "text-blue-400"
                        : "text-gray-500"
                    }`} to="/admin/dashboard/users">
                  <Nav.Link>Users</Nav.Link>
                </LinkContainer>
                <LinkContainer
                className={`hover:text-gray-300 ${
                      location.pathname === "/admin/dashboard/teams"
                        ? "text-blue-400"
                        : "text-gray-500"
                    }`} to="/admin/dashboard/teams">
                  <Nav.Link>Teams</Nav.Link>
                </LinkContainer>
                <LinkContainer
                className={`hover:text-gray-300 ${
                      location.pathname === "/admin/dashboard/positions"
                        ? "text-blue-400"
                        : "text-gray-500"
                    }`} to="/admin/dashboard/positions">
                  <Nav.Link>Positions</Nav.Link>
                </LinkContainer>
                <LinkContainer
                className={`hover:text-gray-300 ${
                      location.pathname === "/admin/dashboard/players"
                        ? "text-blue-400"
                        : "text-gray-500"
                    }`} to="/admin/dashboard/players">
                  <Nav.Link>Players</Nav.Link>
                </LinkContainer>
                <LinkContainer
                className={`hover:text-gray-300 ${
                      location.pathname === "/admin/dashboard/fixtures"
                        ? "text-blue-400"
                        : "text-gray-500"
                    }`} to="/admin/dashboard/fixtures">
                  <Nav.Link>Fixtures</Nav.Link>
                </LinkContainer>
                <LinkContainer
                className={`hover:text-gray-300 ${
                      location.pathname === "/admin/dashboard/matchdays"
                        ? "text-blue-400"
                        : "text-gray-500"
                    }`} to="/admin/dashboard/matchdays">
                  <Nav.Link>Matchdays</Nav.Link>
                </LinkContainer>
                <LinkContainer
                className={`hover:text-gray-300 ${
                      location.pathname === "/admin/dashboard/leagues"
                        ? "text-blue-400"
                        : "text-gray-500"
                    }`} to="/admin/dashboard/leagues">
                  <Nav.Link>leagues</Nav.Link>
                </LinkContainer>
                <LinkContainer
                className={`hover:text-gray-300 ${
                      location.pathname === "/admin/dashboard/actions"
                        ? "text-blue-400"
                        : "text-gray-500"
                    }`} to="/admin/dashboard/actions">
                  <Nav.Link>Actions</Nav.Link>
                </LinkContainer>
                </>
              )}
              {userInfo?.roles?.NORMAL_USER && !userInfo?.hasPicks && 
              <LinkContainer
              className={`hover:text-gray-300 ${
                      location.pathname === "/create"
                        ? "text-blue-400"
                        : "text-gray-500"
                    }`} to="/create">
              <Nav.Link>Create Team</Nav.Link>
            </LinkContainer>} 
              
                  {
                    userInfo?.hasPicks && (
                      <>
                        <LinkContainer
                        className={`hover:text-gray-300 ${
                      location.pathname === '/points'
                        ? "text-blue-400"
                        : "text-gray-500"
                    }`} to="/points">
                          <Nav.Link>Points</Nav.Link>
                        </LinkContainer>
                        <LinkContainer
                        className={`hover:text-gray-300 ${
                      location.pathname === "/pickteam"
                        ? "text-blue-400"
                        : "text-gray-500"
                    }`} to="/pickteam">
                          <Nav.Link>Pick Team</Nav.Link>
                        </LinkContainer>
                        <LinkContainer
                        className={`hover:text-gray-300 ${
                      location.pathname === "/transfers"
                        ? "text-blue-400"
                        : "text-gray-500"
                    }`} to="/transfers">
                          <Nav.Link>Transfers</Nav.Link>
                        </LinkContainer>
                        <LinkContainer
                        className={`hover:text-gray-300 ${
                      location.pathname === "/userleagues"
                        ? "text-blue-400"
                        : "text-gray-500"
                    }`} to="/userleagues">
                          <Nav.Link>Leagues</Nav.Link>
                        </LinkContainer>
                      </>
                    )}
              {userInfo ? (
                <>
                  <NavDropdown title={userInfo.name} id="username">
                    <LinkContainer
                    className={`hover:text-gray-300 ${
                      location.pathname === "/profile"
                        ? "text-blue-400"
                        : "text-gray-500"
                    }`} to="/profile">
                      <NavDropdown.Item>Profile</NavDropdown.Item>
                    </LinkContainer>
                    <NavDropdown.Item onClick={logoutHandler}>
                      Logout
                    </NavDropdown.Item>
                  </NavDropdown>
                </>
              ) : (
                <>
                  {/*<LinkContainer to="/login">
                    <Nav.Link>
                      <FaSignInAlt /> Sign In
                    </Nav.Link>
                  </LinkContainer>*/}
                  <LinkContainer
                  className={`hover:text-gray-300 ${
                      location.pathname === "/register"
                        ? "text-blue-400"
                        : "text-gray-500"
                    }`} to="/register">
                    <Nav.Link>
                      <FaSignOutAlt /> Sign Up
                    </Nav.Link>
                  </LinkContainer>
                </>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </header>
  );
};

export default Header;
