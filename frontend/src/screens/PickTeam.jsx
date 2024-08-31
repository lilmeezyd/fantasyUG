import LeagueDetails from "../components/LeagueDetails";
import ManagerPicks from "../components/ManagerPicks";
import FixtureList from "../components/FixtureList";
import { Container } from "react-bootstrap";
import { useGetManagerInfoQuery } from "../slices/managerInfoApiSlice";

const PickTeam = () => {
  const { data: managerInfo } = useGetManagerInfoQuery();
  console.log(managerInfo);
  return (
    <>
      <div className="main">
        <ManagerPicks teamName={managerInfo?.teamName} />
        <LeagueDetails privateLeagues={managerInfo?.privateLeagues}
        teamLeagues={managerInfo?.teamLeagues}
        overallLeagues={managerInfo?.overallLeagues}
         />
      </div>
      <Container>
        <FixtureList />
      </Container>
    </>
  );
};

export default PickTeam;
