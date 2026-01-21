import { Container } from "react-bootstrap";
import { NavLink, Outlet } from "react-router-dom";
import { AiOutlineUser } from "react-icons/ai";
const DashboardScreen = () => {
  return (
    <Container>
      <div className="p-2">
        <div className="p-2 m-2">
          <Outlet />
        </div>
      </div>
    </Container>
  );
};

export default DashboardScreen;
