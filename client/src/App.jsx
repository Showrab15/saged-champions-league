// client/src/App.jsx
import { Route, Routes } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import SagedianCricketLeague from "./pages/SagedianCricketLeague.jsx";

function App() {
  return (
    <div className="min-h-screen bg-dark">
      <Routes>
        <Route path="/" element={<SagedianCricketLeague />} />

        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </div>
  );
}

export default App;
