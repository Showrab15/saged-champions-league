/* eslint-disable no-unused-vars */
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { tournamentAPI } from "../../utils/api";

const PreviousTournamentsPage = () => {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchTournaments();
  }, []);

  const fetchTournaments = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await tournamentAPI.getAll();
      // Filter completed tournaments
      const completed = response.data.data.filter(
        (t) => t.status === "completed"
      );
      setTournaments(completed);
    } catch (err) {
      console.error("Error fetching tournaments:", err);
      setError("Failed to load tournaments");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-primary text-2xl">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500 text-xl">
        {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-bold text-primary mb-6"
      >
        Previous Tournaments
      </motion.h1>

      {tournaments.length === 0 ? (
        <p className="text-gray-400 text-lg">No previous tournaments found.</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tournaments.map((tournament) => (
            <motion.div
              key={tournament._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-secondary p-6 rounded-xl shadow-md border border-gray-700"
            >
              <h2 className="text-2xl font-bold text-primary mb-2">
                {tournament.name}
              </h2>
              <p>
                <strong>Format:</strong> {tournament.format}
              </p>
              <p>
                <strong>Playoff Format:</strong> {tournament.playoffFormat}
              </p>
              <p>
                <strong>Groups:</strong> {tournament.numGroups}
              </p>
              <p>
                <strong>Qualify Per Group:</strong> {tournament.qualifyPerGroup}
              </p>
              <p>
                <strong>Status:</strong>{" "}
                <span className="text-green-400">{tournament.status}</span>
              </p>
              <p>
                <strong>Created At:</strong>{" "}
                {new Date(tournament.createdAt).toLocaleString()}
              </p>
              <p>
                <strong>Completed At:</strong>{" "}
                {tournament.completedAt
                  ? new Date(tournament.completedAt).toLocaleString()
                  : "-"}
              </p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PreviousTournamentsPage;
