import { useEffect } from "react"
import { Outlet, useNavigate } from "react-router-dom"
import { Container} from 'react-bootstrap'
import Header from "./components/Header"
import Footer from "./components/Footer"
import { ToastContainer } from 'react-toastify'
import { useSelector } from "react-redux"
import 'react-toastify/dist/ReactToastify.css'
import { useGetMeQuery } from "./slices/userApiSlice"

const App = () => {
  const { userInfo } = useSelector(state => state.auth);
  const { data, isLoading } = useGetMeQuery(undefined, {
    skip: !userInfo
  });
  return (
    <>
    <Header/>
    <ToastContainer />
    <Container className="my-2">
      <Outlet />
    </Container>
    <Footer />
    </>
  )
}

export default App