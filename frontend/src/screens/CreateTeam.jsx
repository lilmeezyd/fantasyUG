import Players from "../components/Players"
import PicksPlatform from "../components/PicksPlatform"
import FixtureList from "../components/FixtureList"
const CreateTeam = () => {
  return (
    <div className="main">
      <PicksPlatform />
      <Players />
    </div>
  )
}

export default CreateTeam