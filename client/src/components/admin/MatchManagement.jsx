/* eslint-disable no-unused-vars */
// client/src/components/admin/MatchManagement.jsx
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { matchAPI, teamAPI } from "../../utils/api";
import ScoreEntry from "./ScoreEntry";

const MatchManagement = ({ tournament }) => {
  const [matches, setMatches] = useState([]);
  const [teams, setTeams] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (tournament) {
      fetchMatches();
      fetchTeams();
    }
  }, [tournament]);

  const fetchMatches = async () => {
    try {
      console.log("Fetching matches for tournament:", tournament._id);
      const response = await matchAPI.getByTournament(tournament._id);
      console.log("API Response:", response);
      console.log("Matches data:", response.data.data);
      setMatches(response.data.data || []);
    } catch (error) {
      console.error("Error fetching matches:", error);
    }
  };

  const handleGenerateSchedule = async () => {
    if (!confirm("This will delete all existing matches. Continue?")) {
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const result = await matchAPI.generateSchedule(tournament._id);
      console.log("Generate schedule result:", result);
      setMessage("Schedule generated successfully!");

      // Add a small delay to ensure DB writes complete
      setTimeout(() => {
        fetchMatches();
      }, 500);
    } catch (error) {
      console.error("Generate schedule error:", error);
      setMessage(error.response?.data?.message || "Error generating schedule");
    } finally {
      setLoading(false);
    }
  };

  const fetchTeams = async () => {
    try {
      const response = await teamAPI.getByTournament(tournament._id);
      setTeams(response.data.data);
    } catch (error) {
      console.error("Error fetching teams:", error);
    }
  };

  const handleDeleteMatch = async (matchId) => {
    if (!confirm("Are you sure you want to delete this match?")) {
      return;
    }

    try {
      await matchAPI.delete(matchId);
      setMessage("Match deleted successfully!");
      fetchMatches();
    } catch (error) {
      setMessage(error.response?.data?.message || "Error deleting match");
    }
  };

  const handleScoreUpdate = () => {
    setSelectedMatch(null);
    fetchMatches();
    setMessage("Match updated successfully!");
  };

  if (!tournament) {
    return (
      <div className="bg-secondary rounded-xl p-6 text-center">
        <p className="text-gray-400">Please create a tournament first</p>
      </div>
    );
  }

  if (teams.length < 2) {
    return (
      <div className="bg-secondary rounded-xl p-6 text-center">
        <p className="text-gray-400">
          Please add at least 2 teams before generating matches
        </p>
      </div>
    );
  }

  const hasGroups =
    tournament.format === "groups" || tournament.format === "groups-super4";
  const groupedMatches = hasGroups
    ? matches.reduce((acc, match) => {
        const key = match.group || "Other";
        if (!acc[key]) acc[key] = [];
        acc[key].push(match);
        return acc;
      }, {})
    : { all: matches };

  return (
    <div className="space-y-6">
      {selectedMatch ? (
        <ScoreEntry
          match={selectedMatch}
          onClose={() => setSelectedMatch(null)}
          onUpdate={handleScoreUpdate}
        />
      ) : (
        <>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-secondary rounded-xl p-6 shadow-lg"
          >
            <h2 className="text-2xl font-bold text-primary mb-4">
              Match Schedule
            </h2>

            {message && (
              <div
                className={`mb-4 p-4 rounded-lg ${
                  message.includes("Error")
                    ? "bg-red-600/20 border border-red-600 text-red-200"
                    : "bg-green-600/20 border border-green-600 text-green-200"
                }`}
              >
                {message}
              </div>
            )}

            {matches.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400 mb-4">No matches generated yet</p>
                <button
                  onClick={handleGenerateSchedule}
                  disabled={loading}
                  className="bg-primary hover:bg-blue-600 text-white font-bold px-6 py-3 rounded-lg transition-all duration-300 disabled:opacity-50"
                >
                  {loading ? "Generating..." : "Generate Match Schedule"}
                </button>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-4">
                  <p className="text-gray-400">
                    Total Matches: {matches.length}
                  </p>
                  <button
                    onClick={handleGenerateSchedule}
                    disabled={loading}
                    className="bg-primary hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-all duration-300 disabled:opacity-50"
                  >
                    Regenerate Schedule
                  </button>
                </div>

                <div className="space-y-6">
                  {Object.keys(groupedMatches).map((groupKey) => (
                    <div key={groupKey}>
                      {hasGroups && groupKey !== "all" && (
                        <h3 className="text-xl font-bold text-primary mb-3 bg-gray-800 px-4 py-2 rounded-lg">
                          Group {groupKey}
                        </h3>
                      )}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {groupedMatches[groupKey].map((match, index) => (
                          <motion.div
                            key={match._id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="bg-dark rounded-lg p-4 hover:bg-gray-800 transition-colors"
                          >
                            <div className="flex justify-between items-center mb-3">
                              <span className="text-primary font-bold">
                                Match {match.matchNumber}
                              </span>
                              <span
                                className={`px-2 py-1 rounded text-xs font-semibold ${
                                  match.status === "completed"
                                    ? "bg-green-600 text-white"
                                    : "bg-yellow-600 text-white"
                                }`}
                              >
                                {match.status === "completed"
                                  ? "Completed"
                                  : "Pending"}
                              </span>
                            </div>

                            <div className="space-y-2 mb-3">
                              <div className="flex justify-between">
                                <span className="font-semibold">
                                  {match.team1Name}
                                </span>
                                {match.status === "completed" &&
                                  match.team1Score && (
                                    <span className="text-gray-400">
                                      {match.team1Score.runs}/
                                      {match.team1Score.wickets} (
                                      {match.team1Score.overs})
                                    </span>
                                  )}
                              </div>

                              <div className="text-center text-primary font-bold">
                                VS
                              </div>

                              <div className="flex justify-between">
                                <span className="font-semibold">
                                  {match.team2Name}
                                </span>
                                {match.status === "completed" &&
                                  match.team2Score && (
                                    <span className="text-gray-400">
                                      {match.team2Score.runs}/
                                      {match.team2Score.wickets} (
                                      {match.team2Score.overs})
                                    </span>
                                  )}
                              </div>
                            </div>

                            {match.status === "completed" && match.winner && (
                              <div className="mb-3 pt-2 border-t border-gray-700">
                                <p className="text-center text-green-400 text-sm">
                                  Winner:{" "}
                                  {match.winner === match.team1Id
                                    ? match.team1Name
                                    : match.team2Name}
                                </p>
                              </div>
                            )}

                            <div className="flex gap-2">
                              <button
                                onClick={() => setSelectedMatch(match)}
                                className="flex-1 bg-primary hover:bg-blue-600 text-white px-3 py-2 rounded transition-colors text-sm"
                              >
                                {match.status === "completed"
                                  ? "Update Score"
                                  : "Enter Score"}
                              </button>
                              <button
                                onClick={() => handleDeleteMatch(match._id)}
                                className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded transition-colors text-sm"
                              >
                                Delete
                              </button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </div>
  );
};

export default MatchManagement;
