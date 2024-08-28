import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

const HasNoPicks = () => {
  const { userInfo } = useSelector((state) => state.auth);

  return userInfo?.roles?.NORMAL_USER && !userInfo?.hasPicks ? (
    <Outlet />
  ) : (
    <Navigate to="/" replace />
  );
};

export default HasNoPicks;
