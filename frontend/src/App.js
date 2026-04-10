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
import QuestionDatabasePage from "./components/pages/questionDatabasePage";
import AddAccountXpPage from "./components/pages/AddAccountXpPage";
import ChatPage from "./components/pages/chatPage";

export const UserContext = createContext();
//test change
//test again
//Test everything
const App = () => {
  const [user, setUser] = useState();
  const [isLightMode, setIsLightMode] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setUser(getUserInfo());
  }, [location.pathname]);

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
          <Route exact path="/questionDatabase" element={<QuestionDatabasePage />} />
          {/* <Route exact path="/mbta" element={<MbtaAlertsPage />} /> */}
          
          <Route exact path="/add-xp" element={<AddAccountXpPage />} /> 
          <Route exact path="/chat" element={<ChatPage />} />
        </Routes>
      </UserContext.Provider>
    </>
  );
};

export default App;