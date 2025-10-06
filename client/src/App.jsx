// client/src/App.jsx
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Header from "./components/shared/Header.jsx";
import PreviousTournamentsPage from "./components/user/PreviousTournamentsPage.jsx";
import { auth } from "./firebase/config";
import AdminPage from "./pages/AdminPage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-primary text-2xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark">
      <Header user={user} />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/previous" element={<PreviousTournamentsPage />} />

        <Route
          path="/admin"
          element={user ? <AdminPage /> : <Navigate to="/login" />}
        />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </div>
  );
}

export default App;
