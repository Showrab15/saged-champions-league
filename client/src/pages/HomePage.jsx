/* eslint-disable no-unused-vars */
// client/src/pages/HomePage.jsx
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import Matches from "../components/user/Matches";
import Playoffs from "../components/user/Playoffs";
import Standings from "../components/user/Standings";
import Statistics from "../components/user/Statistics";
import { tournamentAPI } from "../utils/api";

const HomePage = () => {
  const [activeTournament, setActiveTournament] = useState(null);
  const [activeTab, setActiveTab] = useState("standings");
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
    { id: "standings", label: "Standings", icon: "📊" },
    { id: "matches", label: "Matches", icon: "🏏" },
    { id: "playoffs", label: "Playoffs", icon: "🔥" },
    { id: "stats", label: "Statistics", icon: "📈" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-primary text-2xl">Loading tournament...</div>
      </div>
    );
  }

  if (!activeTournament) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="text-6xl mb-4">🏆</div>
          <h2 className="text-3xl font-bold text-primary mb-2">
            No Active Tournament
          </h2>
          <p className="text-gray-400">
            Check back later for upcoming matches!
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-secondary rounded-xl p-6 mb-8"
      >
        <h2 className="text-3xl font-bold text-primary mb-2">
          {activeTournament.name}
        </h2>
        <p className="text-gray-400">
          Format: {activeTournament.format.replace(/-/g, " ").toUpperCase()}
        </p>
      </motion.div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
              activeTab === tab.id
                ? "bg-primary text-white"
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
        {activeTab === "standings" && (
          <Standings tournamentId={activeTournament._id} />
        )}
        {activeTab === "matches" && (
          <Matches tournamentId={activeTournament._id} />
        )}
        {activeTab === "playoffs" && (
          <Playoffs tournamentId={activeTournament._id} />
        )}
        {activeTab === "stats" && (
          <Statistics tournamentId={activeTournament._id} />
        )}
      </motion.div>
    </div>
  );
};

export default HomePage;
