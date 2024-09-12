import LoginScreen from "./LoginScreen"
import { useSelector } from 'react-redux'
const HomeScreen = () => {

  const { userInfo } = useSelector((state) => state.auth)
  return (
    <>
    {userInfo ? 
    <div style={{fontWeight: 600}}>Welcome, {userInfo?.firstName}&nbsp;{userInfo?.lastName}</div> : <LoginScreen />}
    <div>
      <div>
        Most Owned Players
      </div>
      <div>
        Team of the week
      </div>
    </div>
    <div>
      Players of a single matchday
    </div>
    </>
  )
}

export default HomeScreen