/* eslint-disable no-unused-vars */
// client/src/components/user/Playoffs.jsx
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { matchAPI } from "../../utils/api";

const Playoffs = ({ tournamentId }) => {
  const [playoffMatches, setPlayoffMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlayoffs();
  }, [tournamentId]);

  const fetchPlayoffs = async () => {
    setLoading(true);
    try {
      const response = await matchAPI.getByTournament(tournamentId);
      const allMatches = response.data.data;

      console.log("All matches:", allMatches);
      console.log("First match structure:", allMatches[0]); // Log first match details

      // Filter for playoff matches
      const playoffs = allMatches.filter((match) => {
        console.log(`Match ${match.matchNumber} round:`, match.round); // Log each match's round
        return match.round === "semifinal" || match.round === "final";
      });

      console.log("Filtered playoffs:", playoffs);
      setPlayoffMatches(playoffs);
    } catch (error) {
      console.error("Error fetching playoffs:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8 text-gray-400">Loading playoffs...</div>
    );
  }

  if (playoffMatches.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🔥</div>
        <h3 className="text-2xl font-bold text-primary mb-2">
          Playoffs Not Started
        </h3>
        <p className="text-gray-400 mb-4">
          Complete all league matches to unlock playoffs
        </p>
        <button
          onClick={fetchPlayoffs}
          className="bg-primary hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Refresh
        </button>
      </div>
    );
  }

  const champion = playoffMatches.find(
    (m) => m.round === "final" && m.status === "completed"
  );

  // Separate semifinals and finals
  const semifinals = playoffMatches.filter((m) => m.round === "semifinal");
  const finals = playoffMatches.filter((m) => m.round === "final");

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-primary">Playoffs</h2>
        <button
          onClick={fetchPlayoffs}
          className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Semi-Finals Section */}
      {semifinals.length > 0 && (
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-yellow-400 mb-4">
            🏏 Semi-Finals
          </h3>
          <div className="space-y-6">
            {semifinals.map((match, index) => (
              <motion.div
                key={match._id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="p-6 rounded-xl shadow-xl bg-secondary border-2 border-primary"
              >
                <div className="text-center mb-4">
                  <h4 className="text-xl font-bold text-primary">
                    Semi-Final {index + 1}
                  </h4>
                </div>

                <div className="grid grid-cols-3 items-center gap-4">
                  <div className="text-right">
                    <p className="text-xl font-bold">{match.team1Name}</p>
                    {match.status === "completed" && match.team1Score && (
                      <p className="text-gray-400">
                        {match.team1Score.runs}/{match.team1Score.wickets} (
                        {match.team1Score.overs})
                      </p>
                    )}
                  </div>

                  <div className="text-center text-3xl font-bold text-primary">
                    VS
                  </div>

                  <div className="text-left">
                    <p className="text-xl font-bold">{match.team2Name}</p>
                    {match.status === "completed" && match.team2Score && (
                      <p className="text-gray-400">
                        {match.team2Score.runs}/{match.team2Score.wickets} (
                        {match.team2Score.overs})
                      </p>
                    )}
                  </div>
                </div>

                {match.status === "completed" && match.winner && (
                  <div className="mt-4 pt-4 border-t border-gray-700 text-center">
                    <p className="text-xl font-bold text-green-400">
                      Winner:{" "}
                      {match.winner === match.team1Id
                        ? match.team1Name
                        : match.team2Name}
                    </p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Finals Section */}
      {finals.length > 0 && (
        <div className="space-y-6">
          {finals.map((match, index) => (
            <motion.div
              key={match._id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="p-6 rounded-xl shadow-xl bg-gradient-to-r from-red-900/30 to-orange-900/30 border-2 border-red-500"
            >
              <div className="text-center mb-4">
                <h3 className="text-2xl font-bold text-primary">
                  🏆 GRAND FINAL 🏆
                </h3>
              </div>

              <div className="grid grid-cols-3 items-center gap-4">
                <div className="text-right">
                  <p className="text-xl font-bold">{match.team1Name}</p>
                  {match.status === "completed" && match.team1Score && (
                    <p className="text-gray-400">
                      {match.team1Score.runs}/{match.team1Score.wickets} (
                      {match.team1Score.overs})
                    </p>
                  )}
                </div>

                <div className="text-center text-3xl font-bold text-primary">
                  VS
                </div>

                <div className="text-left">
                  <p className="text-xl font-bold">{match.team2Name}</p>
                  {match.status === "completed" && match.team2Score && (
                    <p className="text-gray-400">
                      {match.team2Score.runs}/{match.team2Score.wickets} (
                      {match.team2Score.overs})
                    </p>
                  )}
                </div>
              </div>

              {match.status === "completed" && match.winner && (
                <div className="mt-4 pt-4 border-t border-gray-700 text-center">
                  <p className="text-xl font-bold text-green-400">
                    Winner:{" "}
                    {match.winner === match.team1Id
                      ? match.team1Name
                      : match.team2Name}
                  </p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Champion Banner */}
      {champion && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.8 }}
          className="mt-8 bg-gradient-to-r from-yellow-600 to-orange-600 p-8 rounded-xl text-center"
        >
          <div className="text-6xl mb-4">🏆</div>
          <h2 className="text-4xl font-bold text-white mb-2">CHAMPIONS!</h2>
          <p className="text-3xl font-bold text-yellow-200">
            {champion.winner === champion.team1Id
              ? champion.team1Name
              : champion.team2Name}
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default Playoffs;
