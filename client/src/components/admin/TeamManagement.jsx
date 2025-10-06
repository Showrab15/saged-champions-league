/* eslint-disable no-unused-vars */
// client/src/components/admin/TeamManagement.jsx
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { teamAPI } from "../../utils/api";

const TeamManagement = ({ tournament }) => {
  const [teams, setTeams] = useState([]);
  const [teamName, setTeamName] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("A");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (tournament) {
      fetchTeams();
    }
  }, [tournament]);

  const fetchTeams = async () => {
    try {
      const response = await teamAPI.getByTournament(tournament._id);
      setTeams(response.data.data);
    } catch (error) {
      console.error("Error fetching teams:", error);
    }
  };

  const handleAddTeam = async (e) => {
    e.preventDefault();
    if (!tournament) {
      setMessage("Please create a tournament first");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const hasGroups =
        tournament.format === "groups" || tournament.format === "groups-super4";
      await teamAPI.create({
        tournamentId: tournament._id,
        name: teamName,
        group: hasGroups ? selectedGroup : null,
      });
      setMessage("Team added successfully!");
      setTeamName("");
      fetchTeams();
    } catch (error) {
      setMessage(error.response?.data?.message || "Error adding team");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTeam = async (teamId) => {
    if (!confirm("Are you sure you want to delete this team?")) {
      return;
    }

    try {
      await teamAPI.delete(teamId);
      setMessage("Team deleted successfully!");
      fetchTeams();
    } catch (error) {
      setMessage(error.response?.data?.message || "Error deleting team");
    }
  };

  if (!tournament) {
    return (
      <div className="bg-secondary rounded-xl p-6 text-center">
        <p className="text-gray-400">Please create a tournament first</p>
      </div>
    );
  }

  const hasGroups =
    tournament.format === "groups" || tournament.format === "groups-super4";
  const groupedTeams = hasGroups
    ? teams.reduce((acc, team) => {
        if (!acc[team.group]) acc[team.group] = [];
        acc[team.group].push(team);
        return acc;
      }, {})
    : { all: teams };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-secondary rounded-xl p-6 shadow-lg"
      >
        <h2 className="text-2xl font-bold text-primary mb-4">Add New Team</h2>

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

        <form onSubmit={handleAddTeam} className="space-y-4">
          <div>
            <label className="block text-gray-400 mb-2">Team Name</label>
            <input
              type="text"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              className="w-full bg-dark border border-primary rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Enter team name"
              required
            />
          </div>

          {hasGroups && (
            <div>
              <label className="block text-gray-400 mb-2">Group</label>
              <select
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
                className="w-full bg-dark border border-primary rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {Array.from({ length: tournament.numGroups }, (_, i) => (
                  <option key={i} value={String.fromCharCode(65 + i)}>
                    Group {String.fromCharCode(65 + i)}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-blue-600 text-white font-bold py-3 rounded-lg transition-all duration-300 disabled:opacity-50"
          >
            {loading ? "Adding..." : "Add Team"}
          </button>
        </form>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-secondary rounded-xl p-6 shadow-lg"
      >
        <h2 className="text-2xl font-bold text-primary mb-4">
          Current Teams ({teams.length})
        </h2>

        {teams.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No teams added yet</p>
        ) : (
          <div className="space-y-6">
            {Object.keys(groupedTeams).map((groupKey) => (
              <div key={groupKey}>
                {hasGroups && (
                  <h3 className="text-xl font-bold text-primary mb-3 bg-gray-800 px-4 py-2 rounded-lg">
                    Group {groupKey}
                  </h3>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {groupedTeams[groupKey].map((team, index) => (
                    <motion.div
                      key={team._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center justify-between bg-dark px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      <span className="font-semibold">{team.name}</span>
                      <button
                        onClick={() => handleDeleteTeam(team._id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded transition-colors"
                      >
                        Delete
                      </button>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default TeamManagement;
