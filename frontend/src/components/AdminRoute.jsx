import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

const AdminRoute = () => {
    const { userInfo } = useSelector((state) => state.auth)
    if(!userInfo) {
        <Navigate to='/login' replace/>
    }

    return (userInfo && userInfo?.roles?.ADMIN) ? <Outlet /> : <Navigate to='/' replace />
}

export default AdminRoute