import LoginScreen from "./LoginScreen"
import { useSelector } from 'react-redux'
import MostOwned from "../components/MostOwned"
import TeamOfWeek from "../components/TeamOfWeek"
import StarsOfWeek from "../components/StarsOfWeek"
const HomeScreen = () => {

  const { userInfo } = useSelector((state) => state.auth)
  return (
    <>
    {userInfo ? 
    <div className="py-2" style={{fontWeight: 600}}>You&#39;re logged in as, {userInfo?.firstName}&nbsp;{userInfo?.lastName}</div> : <LoginScreen />}
    <div className="home-section">
      <MostOwned/>
      <TeamOfWeek/>
    </div>
    <StarsOfWeek/>
    </>
  )
}

export default HomeScreen