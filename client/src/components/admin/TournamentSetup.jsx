/* eslint-disable no-unused-vars */
// client/src/components/admin/TournamentSetup.jsx
import { motion } from "framer-motion";
import { useState } from "react";
import { tournamentAPI } from "../../utils/api";

const TournamentSetup = ({ tournament, onTournamentChange }) => {
  const [formData, setFormData] = useState({
    name: "",
    format: "round-robin",
    playoffFormat: "semi-final",
    numGroups: 2,
    qualifyPerGroup: 2,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      await tournamentAPI.create(formData);
      setMessage("Tournament created successfully!");
      onTournamentChange();
      setFormData({
        name: "",
        format: "round-robin",
        playoffFormat: "semi-final",
        numGroups: 2,
        qualifyPerGroup: 2,
      });
    } catch (error) {
      setMessage(error.response?.data?.message || "Error creating tournament");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this tournament? All data will be lost."
      )
    ) {
      return;
    }

    try {
      await tournamentAPI.delete(tournament._id);
      setMessage("Tournament deleted successfully!");
      onTournamentChange();
    } catch (error) {
      setMessage(error.response?.data?.message || "Error deleting tournament");
    }
  };

  const handleComplete = async () => {
    if (!confirm("Mark this tournament as completed?")) {
      return;
    }

    try {
      await tournamentAPI.complete(tournament._id);
      setMessage("Tournament marked as completed!");
      onTournamentChange();
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Error completing tournament"
      );
    }
  };

  return (
    <div className="space-y-6">
      {tournament ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-secondary rounded-xl p-6 shadow-lg"
        >
          <h2 className="text-2xl font-bold text-primary mb-4">
            Current Tournament
          </h2>
          <div className="space-y-2 mb-4">
            <p>
              <span className="text-gray-400">Name:</span>{" "}
              <span className="font-semibold">{tournament.name}</span>
            </p>
            <p>
              <span className="text-gray-400">Format:</span>{" "}
              <span className="font-semibold">
                {tournament.format.replace(/-/g, " ").toUpperCase()}
              </span>
            </p>
            <p>
              <span className="text-gray-400">Status:</span>{" "}
              <span className="font-semibold">{tournament.status}</span>
            </p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={handleComplete}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-all duration-300"
            >
              Mark as Completed
            </button>
            <button
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-all duration-300"
            >
              Delete Tournament
            </button>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-secondary rounded-xl p-6 shadow-lg"
        >
          <h2 className="text-2xl font-bold text-primary mb-4">
            Create New Tournament
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

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-400 mb-2">
                Tournament Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full bg-dark border border-primary rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div>
              <label className="block text-gray-400 mb-2">
                Tournament Format
              </label>
              <select
                value={formData.format}
                onChange={(e) =>
                  setFormData({ ...formData, format: e.target.value })
                }
                className="w-full bg-dark border border-primary rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="round-robin">Round Robin (IPL Style)</option>
                <option value="groups">Group Stage + Knockout</option>
                <option value="groups-super4">
                  Group Stage + Super 4 + Knockout
                </option>
                <option value="knockout">Direct Knockout</option>
              </select>
            </div>

            {(formData.format === "groups" ||
              formData.format === "groups-super4") && (
              <>
                <div>
                  <label className="block text-gray-400 mb-2">
                    Number of Groups
                  </label>
                  <select
                    value={formData.numGroups}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        numGroups: parseInt(e.target.value),
                      })
                    }
                    className="w-full bg-dark border border-primary rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="2">2 Groups</option>
                    <option value="4">4 Groups</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-400 mb-2">
                    Teams Qualifying per Group
                  </label>
                  <select
                    value={formData.qualifyPerGroup}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        qualifyPerGroup: parseInt(e.target.value),
                      })
                    }
                    className="w-full bg-dark border border-primary rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="1">Top 1</option>
                    <option value="2">Top 2</option>
                  </select>
                </div>
              </>
            )}

            <div>
              <label className="block text-gray-400 mb-2">Playoff Format</label>
              <select
                value={formData.playoffFormat}
                onChange={(e) =>
                  setFormData({ ...formData, playoffFormat: e.target.value })
                }
                className="w-full bg-dark border border-primary rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="semi-final">Semi-Final + Final</option>
                <option value="qualifier">
                  Qualifier + Eliminator (IPL Style)
                </option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-blue-600 text-white font-bold py-3 rounded-lg transition-all duration-300 disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Tournament"}
            </button>
          </form>
        </motion.div>
      )}
    </div>
  );
};

export default TournamentSetup;
