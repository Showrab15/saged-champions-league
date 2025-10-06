/* eslint-disable no-unused-vars */
// client/src/components/user/Statistics.jsx
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { adminAPI } from "../../utils/api";

const Statistics = ({ tournamentId }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [tournamentId]);

  const fetchStats = async () => {
    try {
      const response = await adminAPI.getDashboardStats(tournamentId);
      setStats(response.data.data);
    } catch (error) {
      console.error("Error fetching statistics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8 text-gray-400">
        Loading statistics...
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-8 text-gray-400">
        No statistics available
      </div>
    );
  }

  const statCards = [
    {
      label: "Total Teams",
      value: stats.totalTeams,
      icon: "👥",
      color: "from-blue-600 to-blue-800",
    },
    {
      label: "Total Matches",
      value: stats.totalMatches,
      icon: "🏏",
      color: "from-green-600 to-green-800",
    },
    {
      label: "Completed",
      value: stats.completedMatches,
      icon: "✅",
      color: "from-purple-600 to-purple-800",
    },
    {
      label: "Pending",
      value: stats.pendingMatches,
      icon: "⏳",
      color: "from-orange-600 to-orange-800",
    },
  ];

  return (
    <div>
      <h2 className="text-3xl font-bold text-primary mb-6">
        Tournament Statistics
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`bg-gradient-to-br ${stat.color} rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow`}
          >
            <div className="text-5xl mb-2">{stat.icon}</div>
            <div className="text-4xl font-bold text-white mb-2">
              {stat.value}
            </div>
            <div className="text-gray-200 font-semibold">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {stats.topTeam && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-secondary rounded-xl p-6 shadow-lg"
        >
          <h3 className="text-2xl font-bold text-primary mb-4">Top Team</h3>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-3xl font-bold">{stats.topTeam.teamName}</p>
              <p className="text-gray-400 mt-2">
                {stats.topTeam.won} wins • {stats.topTeam.points} points • NRR:{" "}
                <span
                  className={
                    stats.topTeam.nrr > 0 ? "text-green-400" : "text-red-400"
                  }
                >
                  {stats.topTeam.nrr > 0 ? "+" : ""}
                  {stats.topTeam.nrr.toFixed(3)}
                </span>
              </p>
            </div>
            <div className="text-6xl">👑</div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Statistics;
