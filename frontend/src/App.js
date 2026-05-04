import React from "react";
// We use Route in order to define the different routes of our application
import { Route, Routes, useLocation } from "react-router-dom";
import "./css/card.css";
import "./index.css";

// We import all the components we need in our app
import Navbar from "./components/navbar";
import LandingPage from "./components/pages/landingPage";
import HomePage from "./components/pages/homePage";
import Login from "./components/pages/loginPage";
import Signup from "./components/pages/registerPage";
import PrivateUserProfile from "./components/pages/privateUserProfilePage";
// import MbtaAlertsPage from "./components/pages/mbtaAlerts";
//import MbtaRoutesPage from "./components/pages/mbtaRoutes";
import { createContext, useState, useEffect } from "react";
import getUserInfo from "./utilities/decodeJwt";
import ProfilePage from "./components/pages/ProfilePage";
import QuestionCreationPage from "./components/pages/questionCreationPage";
import QuestionModificationPage from "./components/pages/questionModificationPage";

import ExperimentalTableTest from "./components/Users";

import QuestionDatabasePage from "./components/pages/questionDatabasePage";
import AdminDatabasePage from "./components/pages/AdminDatabasePage";
import AddAccountXpPage from "./components/pages/AddAccountXpPage";
import ChatPage from "./components/pages/chatPage";
import SinglePlayerMenuPage from "./components/pages/singlePlayerMenuPage";
import SinglePlayerGamePage from "./components/pages/singlePlayerGamePage";
import MultiplayerPage from "./components/pages/MultiplayerPage";

import MultiplayerHostPage from "./components/pages/MultiplayerHostPage";
import MultiplayerJoinPage from "./components/pages/MultiplayerJoinPage";
import MultiplayerRoomPage from "./components/pages/MultiplayerRoomPage";
import MultiplayerResultsPage from "./components/pages/MultiplayerResultsPage";
import MultiplayerLiveGamePage from "./components/pages/MultiplayerLiveGamePage";
import LeaderboardPage from "./components/pages/LeaderboardPage";

export const UserContext = createContext();

const App = () => {
  const [user, setUser] = useState();
  const [isLightMode, setIsLightMode] = useState(() => {
    const savedTheme = sessionStorage.getItem("isLightMode");
    return savedTheme ? JSON.parse(savedTheme) : false;
  });
  const location = useLocation();

  useEffect(() => {
    setUser(getUserInfo());
  }, [location.pathname]);

  useEffect(() => {
    sessionStorage.setItem("isLightMode", JSON.stringify(isLightMode));
  }, [isLightMode]);

  const toggleTheme = () => {
    setIsLightMode((prev) => !prev);
  };

  return (
    <>
      {user?.id && (
        <Navbar isLightMode={isLightMode} toggleTheme={toggleTheme} />
      )}
      <UserContext.Provider value={{ user, isLightMode, toggleTheme }}>
        <Routes>
          <Route exact path="/" element={<LandingPage />} />
          <Route exact path="/home" element={<HomePage />} />
          <Route exact path="/login" element={<Login />} />
          <Route exact path="/signup" element={<Signup />} />
          <Route path="/privateUserProfile" element={<PrivateUserProfile />} />
          <Route exact path="/profile" element={<ProfilePage />} />
          <Route exact path="/questionCreate" element={<QuestionCreationPage />} />
          <Route exact path="/questionModify" element={<QuestionModificationPage />} />
          <Route exact path="/questionDatabase" element={<QuestionDatabasePage />} />
          <Route exact path="/questionDatabase-A" element={<AdminDatabasePage />} />
          <Route exact path="/usors" element={<ExperimentalTableTest />} />
          {/* <Route exact path="/mbta" element={<MbtaAlertsPage />} /> */}
          <Route exact path="/add-xp" element={<AddAccountXpPage />} />
          <Route exact path="/chat" element={<ChatPage />} />
          <Route path="/singleplayer" element={<SinglePlayerMenuPage />} />
          <Route path="/singleplayer/:difficulty" element={<SinglePlayerGamePage />} />
          <Route path="/multiplayer" element={<MultiplayerPage />} />
          <Route path="/multiplayer/host" element={<MultiplayerHostPage />} />
          <Route path="/multiplayer/join" element={<MultiplayerJoinPage />} />
          <Route path="/multiplayer/room/:roomCode" element={<MultiplayerRoomPage />} />
          <Route path="/multiplayer/results/:roomCode" element={<MultiplayerResultsPage />} />
          <Route path="/multiplayer/live/:roomCode" element={<MultiplayerLiveGamePage />} />
          <Route exact path="/leaderboard" element={<LeaderboardPage />} />
        </Routes>
      </UserContext.Provider>
    </>
  );
};

export default App;