import { Navbar, Nav, Container, NavDropdown, Badge } from "react-bootstrap";
import { FaSignInAlt, FaSignOutAlt } from "react-icons/fa";
import { LinkContainer } from "react-router-bootstrap";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useLogoutMutation } from "../slices/userApiSlice";
import { logout } from "../slices/authSlice";

const Header = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [logoutApiCall] = useLogoutMutation();

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
          <LinkContainer to="/">
            <Navbar.Brand>Fantasy UG</Navbar.Brand>
          </LinkContainer>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              {userInfo && userInfo?.roles?.ADMIN && (
                <LinkContainer to="/admin/dashboard">
                  <Nav.Link>Dashboard</Nav.Link>
                </LinkContainer>
              )}
              {userInfo?.roles?.NORMAL_USER && !userInfo?.hasPicks && 
              <LinkContainer to="/create">
              <Nav.Link>Create Team</Nav.Link>
            </LinkContainer>}
              
                  {
                    userInfo?.hasPicks && (
                      <>
                        <LinkContainer to="/points">
                          <Nav.Link>Points</Nav.Link>
                        </LinkContainer>
                        <LinkContainer to="/pickteam">
                          <Nav.Link>Pick Team</Nav.Link>
                        </LinkContainer>
                        <LinkContainer to="/transfers">
                          <Nav.Link>Transfers</Nav.Link>
                        </LinkContainer>
                        <LinkContainer to="/userleagues">
                          <Nav.Link>Leagues</Nav.Link>
                        </LinkContainer>
                      </>
                    )}
              {userInfo ? (
                <>
                  <NavDropdown title={userInfo.name} id="username">
                    <LinkContainer to="/profile">
                      <NavDropdown.Item>Profile</NavDropdown.Item>
                    </LinkContainer>
                    <NavDropdown.Item onClick={logoutHandler}>
                      Logout
                    </NavDropdown.Item>
                  </NavDropdown>
                </>
              ) : (
                <>
                  <LinkContainer to="/login">
                    <Nav.Link>
                      <FaSignInAlt /> Sign In
                    </Nav.Link>
                  </LinkContainer>
                  <LinkContainer to="/register">
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
