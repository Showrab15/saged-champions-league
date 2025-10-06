// client/src/components/user/Matches.jsx
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { matchAPI, tournamentAPI } from "../../utils/api";

const Matches = ({ tournamentId }) => {
  const [matches, setMatches] = useState([]);
  const [tournament, setTournament] = useState(null);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [tournamentId]);

  const fetchData = async () => {
    try {
      const [matchesRes, tournamentRes] = await Promise.all([
        matchAPI.getByTournament(tournamentId),
        tournamentAPI.getById(tournamentId),
      ]);

      setMatches(matchesRes.data.data);
      setTournament(tournamentRes.data.data);

      // Group matches if tournament has groups
      if (
        tournamentRes.data.data.format === "groups" ||
        tournamentRes.data.data.format === "groups-super4"
      ) {
        const groupedData = {};
        matchesRes.data.data.forEach((match) => {
          if (match.group) {
            if (!groupedData[match.group]) {
              groupedData[match.group] = [];
            }
            groupedData[match.group].push(match);
          }
        });
        setGroups(
          Object.keys(groupedData).map((key) => ({
            name: key,
            matches: groupedData[key],
          }))
        );
      }
    } catch (error) {
      console.error("Error fetching matches:", error);
    } finally {
      setLoading(false);
    }
  };

  const MatchCard = ({ match, index }) => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-secondary rounded-lg p-5 shadow-lg hover:shadow-xl transition-shadow"
    >
      <div className="flex justify-between items-center mb-3">
        <span className="text-primary font-bold">
          Match {match.matchNumber}
        </span>
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            match.status === "completed"
              ? "bg-green-600 text-white"
              : "bg-yellow-600 text-white"
          }`}
        >
          {match.status === "completed" ? "Completed" : "Pending"}
        </span>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="font-semibold text-lg">{match.team1Name}</span>
          {match.status === "completed" && match.team1Score && (
            <span className="text-gray-400">
              {match.team1Score.runs}/{match.team1Score.wickets}(
              {match.team1Score.overs} ov)
            </span>
          )}
        </div>

        <div className="text-center text-primary font-bold text-xl">VS</div>

        <div className="flex justify-between items-center">
          <span className="font-semibold text-lg">{match.team2Name}</span>
          {match.status === "completed" && match.team2Score && (
            <span className="text-gray-400">
              {match.team2Score.runs}/{match.team2Score.wickets}(
              {match.team2Score.overs} ov)
            </span>
          )}
        </div>
      </div>

      {match.status === "completed" && match.winner && (
        <div className="mt-4 pt-3 border-t border-gray-700">
          <p className="text-center text-green-400 font-semibold">
            Winner:{" "}
            {match.winner === match.team1Id ? match.team1Name : match.team2Name}
          </p>
        </div>
      )}
    </motion.div>
  );

  if (loading) {
    return (
      <div className="text-center py-8 text-gray-400">Loading matches...</div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🏏</div>
        <h3 className="text-2xl font-bold text-primary mb-2">No Matches Yet</h3>
        <p className="text-gray-400">
          Matches will appear here once the schedule is generated
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-3xl font-bold text-primary mb-6">Matches Schedule</h2>

      {groups.length > 0 ? (
        <div className="space-y-8">
          {groups.map((group) => (
            <div key={group.name}>
              <h3 className="text-2xl font-bold text-primary mb-4 bg-gray-800 px-4 py-2 rounded-lg">
                Group {group.name}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {group.matches.map((match, index) => (
                  <MatchCard key={match._id} match={match} index={index} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {matches.map((match, index) => (
            <MatchCard key={match._id} match={match} index={index} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Matches;
