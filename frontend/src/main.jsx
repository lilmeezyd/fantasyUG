import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";
import store from "./store";
import { Provider } from "react-redux";
import PrivateRoute from "./components/PrivateRoute.jsx";
import HomeScreen from "./screens/HomeScreen.jsx";
import LoginScreen from "./screens/LoginScreen.jsx";
import RegisterScreen from "./screens/RegisterScreen.jsx";
import ProfileScreen from "./screens/ProfileScreen.jsx";
import DashboardScreen from "./screens/DashboardScreen.jsx";
import CreateTeam from "./screens/CreateTeam.jsx";
import PickTeam from "./screens/PickTeam.jsx";
import Points from "./screens/Points.jsx";
import Transfers from "./screens/Transfers.jsx";
import UserLeagues from "./screens/Leagues.jsx";
import Fixtures from "./components/admin/Fixtures.jsx";
import Leagues from "./components/admin/Leagues.jsx";
import Matchdays from "./components/admin/Matchdays.jsx";
import Players from "./components/admin/Players.jsx";
import Positions from "./components/admin/Positions.jsx";
import Teams from "./components/admin/Teams.jsx";
import Users from "./components/admin/Users.jsx";
import Actions from "./components/admin/Actions.jsx";
import TeamLeagues from "./components/admin/TeamLeagues.jsx";
import OverallLeagues from "./components/admin/OverallLeagues.jsx";
import PrivateLeagues from "./components/admin/PrivateLeagues.jsx";
import AdminRoute from "./components/AdminRoute.jsx";
import NormalRoute from "./components/NormalRoute.jsx";
import HasPicks from "./components/HasPicks.jsx";
import HasNoPicks from "./components/HasNoPicks.jsx";
import PrivateLeague from "./components/PrivateLeague.jsx"
import OverallLeague from "./components/OverallLeague.jsx"
import TeamLeague from "./components/TeamLeague.jsx"
import RequestPasswordReset from "./components/RequestPasswordReset.jsx"
import ResetPassword from "./components/ResetPassword.jsx"
import OtherPoints from "./screens/OtherPoints.jsx";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      <Route index={true} path="/" element={<HomeScreen />} />
      <Route path="login" element={<LoginScreen />} />
      <Route path="register" element={<RegisterScreen />} />
      <Route
                path="/request-password-reset"
                element={<RequestPasswordReset />}
              />
              <Route path="/password-reset" element={<ResetPassword />} />

      {/* Private Routes */}
      <Route path="" element={<PrivateRoute />}>
        <Route path="/profile" element={<ProfileScreen />} />
      </Route>

      {/* Normal User Routes */}
      <Route path="" element={<NormalRoute />}>
        <Route path="" element={<HasNoPicks />}>
          <Route path="/create" element={<CreateTeam />} />
        </Route>
        <Route path="" element={<HasPicks />}>
          <Route path="/userleagues" element={<UserLeagues />} />
          <Route path="/userleagues/private/:id" element={<PrivateLeague />} />
          <Route path="/userleagues/overall/:id" element={<OverallLeague />} />
          <Route path="/userleagues/team/:id" element={<TeamLeague />} />
          <Route path="/transfers" element={<Transfers />} />
          <Route path="/pickteam" element={<PickTeam />} />
          <Route path="/points" element={<Points />} />
          <Route path="/points/:id" element={<OtherPoints />} />
        </Route>
      </Route>

      {/* Admin Routes */}
      <Route path="" element={<AdminRoute />}>
        <Route path="admin/dashboard" element={<DashboardScreen />}>
          <Route path="fixtures" element={<Fixtures />} />
          <Route path="leagues" element={<Leagues />}>
            <Route path="" element={<OverallLeagues />} />
            <Route path="teamleagues" element={<TeamLeagues />} />
            <Route path="overallleagues" element={<OverallLeagues />} />
            <Route path="privateleagues" element={<PrivateLeagues />} />
          </Route>
          <Route path="matchdays" element={<Matchdays />} />
          <Route path="players" element={<Players />} />
          <Route path="positions" element={<Positions />} />
          <Route path="teams" element={<Teams />} />
          <Route path="users" element={<Users />} />
          <Route path="actions" element={<Actions />} />
        </Route>
      </Route>
    </Route>
  )
);

ReactDOM.createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>
    ,
  </Provider>
);
