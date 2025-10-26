// client/src/App.jsx
import { Route, Routes } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import SagedianCricketLeague from "./pages/SagedianCricketLeague.jsx";
import PlayerStatsPage from "./pages/PlayerStatsPage.jsx";

function App() {
  return (
    <div className="min-h-screen bg-dark">
      {/* <Header user={user} /> */}
      <Routes>
        <Route path="/" element={<SagedianCricketLeague />} />
        <Route path="/players" element={<PlayerStatsPage />} />

        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </div>
  );
}

export default App;
