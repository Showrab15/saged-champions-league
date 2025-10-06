/* eslint-disable no-unused-vars */
// client/src/pages/AdminPage.jsx
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import MatchManagement from "../components/admin/MatchManagement";
import TeamManagement from "../components/admin/TeamManagement";
import TournamentSetup from "../components/admin/TournamentSetup";
import { tournamentAPI } from "../utils/api";

const AdminPage = () => {
  const [activeTournament, setActiveTournament] = useState(null);
  const [activeTab, setActiveTab] = useState("tournament");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActiveTournament();
  }, []);

  const fetchActiveTournament = async () => {
    try {
      const response = await tournamentAPI.getActive();
      setActiveTournament(response.data.data);
    } catch (error) {
      console.error("Error fetching tournament:", error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "tournament", label: "Tournament", icon: "🏆" },
    { id: "teams", label: "Teams", icon: "👥" },
    { id: "matches", label: "Matches", icon: "🏏" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-primary text-2xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold text-primary mb-2">
          Admin Dashboard
        </h1>
        <p className="text-gray-400">Manage tournaments, teams, and matches</p>
      </motion.div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
              activeTab === tab.id
                ? "bg-primary text-red-500"
                : "bg-secondary text-gray-400 hover:bg-gray-700"
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === "tournament" && (
          <TournamentSetup
            tournament={activeTournament}
            onTournamentChange={fetchActiveTournament}
          />
        )}
        {activeTab === "teams" && (
          <TeamManagement tournament={activeTournament} />
        )}
        {activeTab === "matches" && (
          <MatchManagement tournament={activeTournament} />
        )}
      </motion.div>
    </div>
  );
};

export default AdminPage;
