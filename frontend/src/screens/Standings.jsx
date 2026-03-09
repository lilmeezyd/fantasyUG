import { useReducer, useEffect } from "react";
import { Container } from "react-bootstrap";
import { Link, Outlet, useLocation, useParams } from "react-router-dom";
import { useGetCurrentMDQuery } from "../slices/matchdayApiSlice";

const Standings = () => {
  const { pathname } = useLocation();
  const { id } = useParams();
  const { data: currentId } = useGetCurrentMDQuery();

  const reducer = (state, action) => {
    if (action.type === "WEEKLY") {
      return {
        ...state,
        weekly: "league-active",
        overall: "",
        monthly: "",
      };
    }
    if (action.type === "OVERALL") {
      return {
        ...state,
        weekly: "",
        overall: "league-active",
        monthly: "",
      };
    }
    if (action.type === "MONTHLY") {
      return {
        ...state,
        weekly: "",
        overall: "",
        monthly: "league-active",
      };
    }
  };
  const [state, dispatch] = useReducer(reducer, {
    weekly: "",
    overall: "league-active",
    monthly: "",
  });
  const { weekly, overall, monthly } = state;

  useEffect(() => {
    if (pathname.includes("monthly")) {
      dispatch({ type: "MONTHLY" });
    }
    if (!pathname.includes("matchday") && !pathname.includes("monthly")) {
      dispatch({ type: "OVERALL" });
    }
    if (pathname.includes("matchday")) {
      dispatch({ type: "WEEKLY" });
    }
  }, [pathname]);
  return (
    <Container>
      <div className="leagues p-2">
        <Link
          className={`${overall} league-baby`}
          to={`/leagues/${id}/standings`}
        >
          Total
        </Link>
        <Link
          className={`${weekly} league-baby`}
          to={`/leagues/${id}/standings/matchday/${currentId}`}
        >
          Weekly
        </Link>
      </div>
      <Outlet />
    </Container>
  );
};

export default Standings;
