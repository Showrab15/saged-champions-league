/* eslint-disable no-unused-vars */
// client/src/components/user/Standings.jsx
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { teamAPI, tournamentAPI } from "../../utils/api";

const Standings = ({ tournamentId }) => {
  const [standings, setStandings] = useState([]);
  const [tournament, setTournament] = useState(null);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [tournamentId]);

  const fetchData = async () => {
    try {
      const [standingsRes, tournamentRes] = await Promise.all([
        teamAPI.getStandings(tournamentId),
        tournamentAPI.getById(tournamentId),
      ]);

      setStandings(standingsRes.data.data);
      setTournament(tournamentRes.data.data);

      // Group standings if tournament has groups
      if (
        tournamentRes.data.data.format === "groups" ||
        tournamentRes.data.data.format === "groups-super4"
      ) {
        const groupedData = {};
        standingsRes.data.data.forEach((team) => {
          if (team.group) {
            if (!groupedData[team.group]) {
              groupedData[team.group] = [];
            }
            groupedData[team.group].push(team);
          }
        });
        setGroups(
          Object.keys(groupedData).map((key) => ({
            name: key,
            teams: groupedData[key],
          }))
        );
      }
    } catch (error) {
      console.error("Error fetching standings:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8 text-gray-400">Loading standings...</div>
    );
  }

  const StandingsTable = ({ teams, qualifyCount = 4 }) => (
    <div className="overflow-x-auto bg-secondary rounded-xl shadow-lg">
      <table className="w-full">
        <thead>
          <tr className="bg-primary text-white">
            <th className="px-4 py-3 text-left">Pos</th>
            <th className="px-4 py-3 text-left">Team</th>
            <th className="px-4 py-3 text-center">P</th>
            <th className="px-4 py-3 text-center">W</th>
            <th className="px-4 py-3 text-center">L</th>
            <th className="px-4 py-3 text-center">T</th>
            <th className="px-4 py-3 text-center">NRR</th>
            <th className="px-4 py-3 text-center">Pts</th>
          </tr>
        </thead>
        <tbody>
          {teams.map((team, index) => (
            <motion.tr
              key={team._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`border-b border-gray-700 hover:bg-gray-800 transition-colors ${
                index < qualifyCount ? "bg-green-900/20" : ""
              }`}
            >
              <td className="px-4 py-3 font-bold text-primary">{index + 1}</td>
              <td className="px-4 py-3 font-semibold">{team.teamName}</td>
              <td className="px-4 py-3 text-center">{team.played}</td>
              <td className="px-4 py-3 text-center text-green-400">
                {team.won}
              </td>
              <td className="px-4 py-3 text-center text-red-400">
                {team.lost}
              </td>
              <td className="px-4 py-3 text-center text-yellow-400">
                {team.tied}
              </td>
              <td
                className={`px-4 py-3 text-center font-semibold ${
                  team.nrr > 0
                    ? "text-green-400"
                    : team.nrr < 0
                    ? "text-red-400"
                    : "text-gray-400"
                }`}
              >
                {team.nrr > 0 ? "+" : ""}
                {team.nrr.toFixed(3)}
              </td>
              <td className="px-4 py-3 text-center font-bold text-primary text-lg">
                {team.points}
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div>
      <h2 className="text-3xl font-bold text-primary mb-6">Points Table</h2>

      {groups.length > 0 ? (
        <div className="space-y-8">
          {groups.map((group) => (
            <motion.div
              key={group.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h3 className="text-2xl font-bold text-primary mb-4 bg-gray-800 px-4 py-2 rounded-lg">
                Group {group.name}
              </h3>
              <StandingsTable
                teams={group.teams}
                qualifyCount={tournament?.qualifyPerGroup || 2}
              />
            </motion.div>
          ))}
        </div>
      ) : (
        <StandingsTable teams={standings} />
      )}

      <div className="mt-6 p-4 bg-secondary rounded-lg">
        <p className="text-sm text-gray-400">
          <span className="inline-block w-4 h-4 bg-green-900/20 mr-2"></span>
          Qualified for playoffs
        </p>
        <p className="text-xs text-gray-500 mt-2">
          P: Played | W: Won | L: Lost | T: Tied | NRR: Net Run Rate | Pts:
          Points
        </p>
      </div>
    </div>
  );
};

export default Standings;
