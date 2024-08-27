import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

const HasPicks = () => {
  const { userInfo } = useSelector((state) => state.auth);
  console.log(userInfo)

  return userInfo && userInfo?.roles?.NORMAL_USER && userInfo?.hasPicks ? (
    <Outlet />
  ) : (
    <Navigate to="/create" replace />
  );
};

export default HasPicks;
