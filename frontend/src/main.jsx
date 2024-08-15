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
import Fixtures from "./components/admin/Fixtures.jsx";
import Leagues from "./components/admin/Leagues.jsx";
import Matchdays from "./components/admin/Matchdays.jsx";
import Players from "./components/admin/Players.jsx";
import Positions from "./components/admin/Positions.jsx";
import Teams from "./components/admin/Teams.jsx";
import Users from "./components/admin/Users.jsx";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      <Route index={true} path="/" element={<HomeScreen />} />
      <Route path="login" element={<LoginScreen />} />
      <Route path="register" element={<RegisterScreen />} />

      {/* Private Routes */}
      <Route path="" element={<PrivateRoute />}>
        <Route path="/profile" element={<ProfileScreen />} />
        <Route path="admin/dashboard" element={<DashboardScreen />}>
          <Route path="fixtures" element={<Fixtures />} />
          <Route path="leagues" element={<Leagues />} />
          <Route path="matchdays" element={<Matchdays />} />
          <Route path="players" element={<Players />} />
          <Route path="positions" element={<Positions />} />
          <Route path="teams" element={<Teams />} />
          <Route path="users" element={<Users />} />
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
