import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

const NormalRoute = () => {
  const { userInfo } = useSelector((state) => state.auth);
  if(!userInfo) {
    <Navigate to='/login' replace/>
}

  return (userInfo && userInfo?.roles?.NORMAL_USER) ? <Outlet /> : <Navigate to="/login" replace />;
};

export default NormalRoute;
