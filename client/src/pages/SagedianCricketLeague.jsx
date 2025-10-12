/* eslint-disable no-unused-vars */
import {
  Activity,
  BarChart3,
  Calendar,
  Check,
  Edit2,
  Eye,
  Home,
  Lock,
  Plus,
  Search,
  Share2,
  Target,
  Trash2,
  TrendingUp,
  Trophy,
  Users,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { setUserId, teamsAPI, tournamentsAPI } from "../services/api";
const SagedianCricketLeague = () => {
  const [currentView, setCurrentView] = useState("home");
  const [tournaments, setTournaments] = useState([]);
  const [teams, setTeams] = useState([]);
  const [newTeamName, setNewTeamName] = useState("");
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [adminCode, setAdminCode] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [showShareModal, setShowShareModal] = useState(false);
  const [editingMatch, setEditingMatch] = useState(null);
  const [showAdminCodeModal, setShowAdminCodeModal] = useState(false);
  const [newAdminCode, setNewAdminCode] = useState("");

  const [tournamentName, setTournamentName] = useState("");
  const [tournamentType, setTournamentType] = useState("round-robin");
  const [selectedTeams, setSelectedTeams] = useState([]);
  const [groupCount, setGroupCount] = useState(2);
  const [knockoutStage, setKnockoutStage] = useState("semi-final");
  const [knockoutFormat, setKnockoutFormat] = useState("standard");
  const [hasGroupStage, setHasGroupStage] = useState(true);
  const [currentTab, setCurrentTab] = useState("matches");

  const { currentUser, logout } = useAuth();
  const [loading, setLoading] = useState(true);

  // useEffect(() => {
  //   if (currentUser) {
  //     setUserId(currentUser.uid);
  //     loadData();
  //   }
  // }, [currentUser]);

  // replaced with down code ------>

  useEffect(() => {
    // Load data on mount - no auth required for viewing
    loadData();
    if (currentUser) {
      setUserId(currentUser.uid);
    }
  }, [currentUser]);
  const loadData = async () => {
    try {
      setLoading(true);
      const [teamsRes, tournamentsRes] = await Promise.all([
        teamsAPI.getAll(),
        tournamentsAPI.getAll(),
      ]);
      setTeams(teamsRes.data);
      setTournaments(tournamentsRes.data);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  const addTeam = async () => {
    if (!currentUser) {
      alert("Please login to add teams");
      return;
    }
    if (newTeamName.trim()) {
      try {
        const response = await teamsAPI.create({
          name: newTeamName.trim(),
          color: getTeamColor(teams.length),
        });
        setTeams([...teams, response.data.team]);
        setNewTeamName("");
      } catch (error) {
        alert("Failed to add team");
      }
    }
  };

  const createTournament = async () => {
    if (!tournamentName.trim() || selectedTeams.length < 2) return;

    try {
      const { matches, groups } = generateMatches(
        tournamentType,
        selectedTeams,
        groupCount,
        knockoutStage,
        hasGroupStage,
        knockoutFormat
      );

      const response = await tournamentsAPI.create({
        name: tournamentName,
        type: tournamentType,
        teams: selectedTeams,
        matches,
        groups,
        groupCount,
        knockoutStage,
        knockoutFormat,
        hasGroupStage,
      });

      setTournaments([...tournaments, response.data.tournament]);
      setNewAdminCode(response.data.adminCode);
      setShowAdminCodeModal(true);
      setCurrentView("tournaments");
      resetTournamentForm();
    } catch (error) {
      alert("Failed to create tournament");
    }
  };

  // const updateMatchResult = async (tournamentId, matchId, winnerId, scores) => {
  //   try {
  //     await tournamentsAPI.updateMatch(tournamentId, matchId, {
  //       adminCode: adminCode,
  //       winner: winnerId,
  //       team1Score: scores.team1Score,
  //       team2Score: scores.team2Score,
  //     });

  //     // Reload tournament data
  //     await loadData();
  //     setEditingMatch(null);
  //     setAdminCode("");
  //   } catch (error) {
  //     alert("Failed to update match result");
  //   }
  // };

  const deleteTournament = async (_id, code) => {
    try {
      await tournamentsAPI.delete(_id, code);
      setTournaments(tournaments.filter((t) => t._id !== _id));
      alert("Tournament deleted successfully!");
    } catch (error) {
      alert("Invalid admin code or failed to delete!");
    }
  };

  // useEffect(() => {
  //   const sampleTeams = [
  //     "Dhaka Dynamites",
  //     "Chittagong Challengers",
  //     "Sylhet Strikers",
  //     "Rajshahi Raiders",
  //     "Khulna Kings",
  //     "Rangpur Rangers",
  //     "Comilla Crushers",
  //     "Mymensingh Mavericks",
  //   ];
  //   setTeams(
  //     sampleTeams.map((name, idx) => ({
  //       _id: `team-${idx}`,
  //       name,
  //       color: getTeamColor(idx),
  //     }))
  //   );
  // }, []);

  const getTeamColor = (idx) => {
    const colors = [
      "#dc2626",
      "#2563eb",
      "#16a34a",
      "#9333ea",
      "#ea580c",
      "#0891b2",
      "#ca8a04",
      "#db2777",
    ];
    return colors[idx % colors.length];
  };

  const removeTeam = async (_id) => {
    try {
      await teamsAPI.delete(_id); // 🔥 make actual delete request to backend
      setTeams(teams.filter((team) => team._id !== _id)); // then update state
      alert("Team deleted successfully!");
    } catch (error) {
      console.error("Failed to delete team:", error);
      alert(error.response?.data?.message || "Failed to delete team.");
    }
  };

  const generateMatches = (
    type,
    selectedTeams,
    groupCount,
    knockoutStage,
    hasGroupStage,
    knockoutFormat
  ) => {
    let matches = [];
    let groups = {};

    if (type === "round-robin") {
      for (let i = 0; i < selectedTeams.length; i++) {
        for (let j = i + 1; j < selectedTeams.length; j++) {
          matches.push({
            _id: `match-${matches.length}`,
            team1: selectedTeams[i],
            team2: selectedTeams[j],
            winner: null,
            stage: "League",
            team1Score: { runs: 0, overs: 0 },
            team2Score: { runs: 0, overs: 0 },
          });
        }
      }

      // Add knockout stages for round-robin
      if (selectedTeams.length >= 10 && knockoutStage === "quarter-final") {
        for (let i = 0; i < 4; i++) {
          matches.push({
            _id: `match-${matches.length}`,
            team1: null,
            team2: null,
            winner: null,
            stage: "Quarter Final",
            team1Score: { runs: 0, overs: 0 },
            team2Score: { runs: 0, overs: 0 },
          });
        }
      }

      if (knockoutFormat === "ipl-style") {
        matches.push({
          _id: `match-${matches.length}`,
          team1: null,
          team2: null,
          winner: null,
          stage: "Qualifier 1",
          team1Score: { runs: 0, overs: 0 },
          team2Score: { runs: 0, overs: 0 },
        });
        matches.push({
          _id: `match-${matches.length}`,
          team1: null,
          team2: null,
          winner: null,
          stage: "Eliminator",
          team1Score: { runs: 0, overs: 0 },
          team2Score: { runs: 0, overs: 0 },
        });
        matches.push({
          _id: `match-${matches.length}`,
          team1: null,
          team2: null,
          winner: null,
          stage: "Qualifier 2",
          team1Score: { runs: 0, overs: 0 },
          team2Score: { runs: 0, overs: 0 },
        });
      } else if (knockoutFormat === "super-four-mini") {
        for (let i = 0; i < 3; i++) {
          matches.push({
            _id: `match-${matches.length}`,
            team1: null,
            team2: null,
            winner: null,
            stage: "Super Four",
            team1Score: { runs: 0, overs: 0 },
            team2Score: { runs: 0, overs: 0 },
          });
        }
      } else if (
        knockoutFormat === "standard" ||
        knockoutStage === "semi-final"
      ) {
        for (let i = 0; i < 2; i++) {
          matches.push({
            _id: `match-${matches.length}`,
            team1: null,
            team2: null,
            winner: null,
            stage: "Semi Final",
            team1Score: { runs: 0, overs: 0 },
            team2Score: { runs: 0, overs: 0 },
          });
        }
      }

      matches.push({
        _id: `match-${matches.length}`,
        team1: null,
        team2: null,
        winner: null,
        stage: "Final",
        team1Score: { runs: 0, overs: 0 },
        team2Score: { runs: 0, overs: 0 },
      });
    } else if (type === "group-stage") {
      if (hasGroupStage) {
        const teamsPerGroup = Math.ceil(selectedTeams.length / groupCount);

        for (let g = 0; g < groupCount; g++) {
          const groupTeams = selectedTeams.slice(
            g * teamsPerGroup,
            (g + 1) * teamsPerGroup
          );
          groups[`Group ${String.fromCharCode(65 + g)}`] = groupTeams;

          for (let i = 0; i < groupTeams.length; i++) {
            for (let j = i + 1; j < groupTeams.length; j++) {
              matches.push({
                _id: `match-${matches.length}`,
                team1: groupTeams[i],
                team2: groupTeams[j],
                winner: null,
                stage: `Group ${String.fromCharCode(65 + g)}`,
                group: `Group ${String.fromCharCode(65 + g)}`,
                team1Score: { runs: 0, overs: 0 },
                team2Score: { runs: 0, overs: 0 },
              });
            }
          }
        }
      }

      // Super Eight stage
      if (selectedTeams.length >= 10 && knockoutStage === "super-eight") {
        for (let g = 0; g < 2; g++) {
          const groupName = `Super Eight Group ${g + 1}`;
          groups[groupName] = [];
          for (let i = 0; i < 3; i++) {
            matches.push({
              _id: `match-${matches.length}`,
              team1: null,
              team2: null,
              winner: null,
              stage: groupName,
              group: groupName,
              team1Score: { runs: 0, overs: 0 },
              team2Score: { runs: 0, overs: 0 },
            });
          }
        }
      }

      // if (knockoutStage === "super-four") {
      //   for (let i = 0; i < 3; i++) {
      //     matches.push({
      //       _id: `match-${matches.length}`,
      //       team1: null,
      //       team2: null,
      //       winner: null,
      //       stage: "Super Four",
      //       team1Score: { runs: 0, overs: 0 },
      //       team2Score: { runs: 0, overs: 0 },
      //     });
      //   }
      // }

      // Replaced with down->

      if (knockoutStage === "super-four") {
        // Super Four: Top 4 teams play round-robin (6 matches total)
        for (let i = 0; i < 6; i++) {
          matches.push({
            _id: `match-${matches.length}`,
            team1: null,
            team2: null,
            winner: null,
            stage: "Super Four",
            team1Score: { runs: 0, overs: 0 },
            team2Score: { runs: 0, overs: 0 },
          });
        }
      }
      if (knockoutStage === "quarter-final") {
        for (let i = 0; i < 4; i++) {
          matches.push({
            _id: `match-${matches.length}`,
            team1: null,
            team2: null,
            winner: null,
            stage: "Quarter Final",
            team1Score: { runs: 0, overs: 0 },
            team2Score: { runs: 0, overs: 0 },
          });
        }
      }

      // if (
      //   knockoutStage === "semi-final" ||
      //   knockoutStage === "super-four" ||
      //   knockoutStage === "super-eight" ||
      //   knockoutStage === "quarter-final"
      // ) {
      //   for (let i = 0; i < 2; i++) {
      //     matches.push({
      //       _id: `match-${matches.length}`,
      //       team1: null,
      //       team2: null,
      //       winner: null,
      //       stage: "Semi Final",
      //       team1Score: { runs: 0, overs: 0 },
      //       team2Score: { runs: 0, overs: 0 },
      //     });
      //   }
      // }

      // Replaced with down code --->
      // Only add semi-finals if NOT super-four (super-four goes directly to final)
      if (
        knockoutStage === "semi-final" ||
        knockoutStage === "super-eight" ||
        knockoutStage === "quarter-final"
      ) {
        for (let i = 0; i < 2; i++) {
          matches.push({
            _id: `match-${matches.length}`,
            team1: null,
            team2: null,
            winner: null,
            stage: "Semi Final",
            team1Score: { runs: 0, overs: 0 },
            team2Score: { runs: 0, overs: 0 },
          });
        }
      }

      matches.push({
        _id: `match-${matches.length}`,
        team1: null,
        team2: null,
        winner: null,
        stage: "Final",
        team1Score: { runs: 0, overs: 0 },
        team2Score: { runs: 0, overs: 0 },
      });
    } else if (type === "tri-series") {
      for (let round = 0; round < 2; round++) {
        for (let i = 0; i < selectedTeams.length; i++) {
          for (let j = i + 1; j < selectedTeams.length; j++) {
            matches.push({
              _id: `match-${matches.length}`,
              team1: selectedTeams[i],
              team2: selectedTeams[j],
              winner: null,
              stage: "League",
              team1Score: { runs: 0, overs: 0 },
              team2Score: { runs: 0, overs: 0 },
            });
          }
        }
      }

      matches.push({
        _id: `match-${matches.length}`,
        team1: null,
        team2: null,
        winner: null,
        stage: "Final",
        team1Score: { runs: 0, overs: 0 },
        team2Score: { runs: 0, overs: 0 },
      });
    }

    return { matches, groups };
  };

  const calculateNRR = (team, matches) => {
    let runsScored = 0;
    let oversPlayed = 0;
    let runsConceded = 0;
    let oversFaced = 0;

    matches.forEach((match) => {
      if (match.team1 && match.team1._id === team._id && match.winner) {
        runsScored += match.team1Score.runs;
        oversPlayed += match.team1Score.overs;
        runsConceded += match.team2Score.runs;
        oversFaced += match.team2Score.overs;
      } else if (match.team2 && match.team2._id === team._id && match.winner) {
        runsScored += match.team2Score.runs;
        oversPlayed += match.team2Score.overs;
        runsConceded += match.team1Score.runs;
        oversFaced += match.team1Score.overs;
      }
    });

    if (oversPlayed === 0 || oversFaced === 0) return 0;
    return (runsScored / oversPlayed - runsConceded / oversFaced).toFixed(3);
  };

  const calculatePointsTable = (tournament) => {
    const table = {};

    tournament.teams.forEach((team) => {
      table[team._id] = {
        team,
        played: 0,
        won: 0,
        lost: 0,
        points: 0,
        nrr: 0,
      };
    });

    tournament.matches.forEach((match) => {
      if (match.winner && match.team1 && match.team2) {
        table[match.team1._id].played++;
        table[match.team2._id].played++;

        if (match.winner === match.team1._id) {
          table[match.team1._id].won++;
          table[match.team1._id].points += 2;
          table[match.team2._id].lost++;
        } else {
          table[match.team2._id].won++;
          table[match.team2._id].points += 2;
          table[match.team1._id].lost++;
        }
      }
    });

    tournament.teams.forEach((team) => {
      table[team._id].nrr = calculateNRR(team, tournament.matches);
    });

    return Object.values(table).sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      return parseFloat(b.nrr) - parseFloat(a.nrr);
    });
  };

  // Add this new function right after calculatePointsTable
  const calculateGroupPointsTables = (tournament) => {
    if (
      tournament.type !== "group-stage" ||
      !tournament.groups ||
      Object.keys(tournament.groups).length === 0
    ) {
      return null;
    }

    const groupTables = {};

    Object.entries(tournament.groups).forEach(([groupName, groupTeams]) => {
      groupTables[groupName] = {};

      groupTeams.forEach((team) => {
        groupTables[groupName][team._id] = {
          team,
          played: 0,
          won: 0,
          lost: 0,
          points: 0,
          nrr: 0,
        };
      });
    });

    tournament.matches.forEach((match) => {
      if (match.group && match.winner && match.team1 && match.team2) {
        const groupName = match.group;

        if (groupTables[groupName]) {
          const table = groupTables[groupName];

          if (table[match.team1._id]) table[match.team1._id].played++;
          if (table[match.team2._id]) table[match.team2._id].played++;

          if (match.winner === match.team1._id && table[match.team1._id]) {
            table[match.team1._id].won++;
            table[match.team1._id].points += 2;
            if (table[match.team2._id]) table[match.team2._id].lost++;
          } else if (
            match.winner === match.team2._id &&
            table[match.team2._id]
          ) {
            table[match.team2._id].won++;
            table[match.team2._id].points += 2;
            if (table[match.team1._id]) table[match.team1._id].lost++;
          }
        }
      }
    });

    Object.entries(groupTables).forEach(([groupName, table]) => {
      Object.values(table).forEach((entry) => {
        const groupMatches = tournament.matches.filter(
          (m) => m.group === groupName
        );
        entry.nrr = calculateNRR(entry.team, groupMatches);
      });
    });

    Object.keys(groupTables).forEach((groupName) => {
      groupTables[groupName] = Object.values(groupTables[groupName]).sort(
        (a, b) => {
          if (b.points !== a.points) return b.points - a.points;
          return parseFloat(b.nrr) - parseFloat(a.nrr);
        }
      );
    });

    return groupTables;
  };

  const resetTournamentForm = () => {
    setTournamentName("");
    setSelectedTeams([]);
    setTournamentType("round-robin");
  };

  const calculateStats = (tournament) => {
    const playerStats = {};

    tournament.matches.forEach((match) => {
      if (!match.winner) return;

      // Initialize stats for teams
      [match.team1, match.team2].forEach((team) => {
        if (!team) return;
        if (!playerStats[team._id]) {
          playerStats[team._id] = {
            team: team,
            runs: 0,
            wickets: 0,
            matches: 0,
            oversBowled: 0,
            runsGiven: 0,
          };
        }
      });

      // Add match stats
      if (match.team1 && match.team1Score.runs > 0) {
        playerStats[match.team1._id].runs += match.team1Score.runs;
        playerStats[match.team1._id].matches++;
      }
      if (match.team2 && match.team2Score.runs > 0) {
        playerStats[match.team2._id].runs += match.team2Score.runs;
        playerStats[match.team2._id].matches++;
      }

      // Calculate bowling stats (simplified)
      if (match.team1 && match.team2 && match.team2Score.runs > 0) {
        playerStats[match.team1._id].runsGiven += match.team2Score.runs;
        playerStats[match.team1._id].oversBowled += match.team2Score.overs;
      }
      if (match.team2 && match.team1 && match.team1Score.runs > 0) {
        playerStats[match.team2._id].runsGiven += match.team1Score.runs;
        playerStats[match.team2._id].oversBowled += match.team1Score.overs;
      }
    });

    const statsArray = Object.values(playerStats).filter((s) => s.matches > 0);

    return {
      topScorers: statsArray.sort((a, b) => b.runs - a.runs).slice(0, 5),
      mostEconomical: statsArray
        .filter((s) => s.oversBowled > 0)
        .map((s) => ({
          ...s,
          economy: (s.runsGiven / s.oversBowled).toFixed(2),
        }))
        .sort((a, b) => parseFloat(a.economy) - parseFloat(b.economy))
        .slice(0, 5),
      highestScores: tournament.matches
        .filter((m) => m.winner)
        .map((m) => ({
          team1: m.team1,
          team2: m.team2,
          score: Math.max(m.team1Score?.runs || 0, m.team2Score?.runs || 0),
          match: m,
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 5),
    };
  };

  const filteredTournaments = tournaments.filter((t) => {
    const matchesSearch = t.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === "all" || t.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const MatchEditor = ({ match, tournament, onSave, onCancel }) => {
    const [team1Runs, setTeam1Runs] = useState(match.team1Score.runs);
    const [team1Overs, setTeam1Overs] = useState(match.team1Score.overs);
    const [team2Runs, setTeam2Runs] = useState(match.team2Score.runs);
    const [team2Overs, setTeam2Overs] = useState(match.team2Score.overs);
    const [winner, setWinner] = useState(match.winner);

    return (
      <div className="bg-slate-800 p-4 rounded-lg space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-slate-400 mb-2">
              {match.team1 ? match.team1.name : "TBD"}
            </div>
            <div className="flex gap-2">
              <div>
                <label className="text-xs text-slate-500 block mb-1">
                  Runs
                </label>
                <input
                  type="number"
                  placeholder="Runs"
                  value={team1Runs}
                  onChange={(e) => setTeam1Runs(Number(e.target.value))}
                  className="w-20 px-2 py-1 bg-slate-700 rounded text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 block mb-1">
                  Overs
                </label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="Overs"
                  value={team1Overs}
                  onChange={(e) => setTeam1Overs(Number(e.target.value))}
                  className="w-20 px-2 py-1 bg-slate-700 rounded text-sm"
                />
              </div>
            </div>
          </div>
          <div>
            <div className="text-sm text-slate-400 mb-2">
              {match.team2 ? match.team2.name : "TBD"}
            </div>
            <div className="flex gap-2">
              <div>
                <label className="text-xs text-slate-500 block mb-1">
                  Runs
                </label>
                <input
                  type="number"
                  placeholder="Runs"
                  value={team2Runs}
                  onChange={(e) => setTeam2Runs(Number(e.target.value))}
                  className="w-20 px-2 py-1 bg-slate-700 rounded text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 block mb-1">
                  Overs
                </label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="Overs"
                  value={team2Overs}
                  onChange={(e) => setTeam2Overs(Number(e.target.value))}
                  className="w-20 px-2 py-1 bg-slate-700 rounded text-sm"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <div className="text-sm text-slate-400">Winner</div>
          <div className="flex gap-2">
            <button
              onClick={() => setWinner(match.team1 ? match.team1._id : null)}
              className={`flex-1 px-3 py-2 rounded transition-all ${
                winner === (match.team1 ? match.team1._id : null)
                  ? "bg-emerald-600"
                  : "bg-slate-700"
              }`}
            >
              {match.team1 ? match.team1.name : "TBD"}
            </button>
            <button
              onClick={() => setWinner(match.team2 ? match.team2._id : null)}
              className={`flex-1 px-3 py-2 rounded transition-all ${
                winner === (match.team2 ? match.team2._id : null)
                  ? "bg-emerald-600"
                  : "bg-slate-700"
              }`}
            >
              {match.team2 ? match.team2.name : "TBD"}
            </button>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() =>
              onSave(winner, {
                team1Score: { runs: team1Runs, overs: team1Overs },
                team2Score: { runs: team2Runs, overs: team2Overs },
              })
            }
            className="flex-1 bg-emerald-600 px-4 py-2 rounded hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
          >
            <Check size={16} /> Save
          </button>
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-slate-700 rounded hover:bg-slate-600 transition-all"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    );
  };

  const updateKnockoutStages = async (tournament) => {
    try {
      const pointsTable = calculatePointsTable(tournament);
      const groupTables = calculateGroupPointsTables(tournament);
      let updatedMatches = [...tournament.matches];
      let hasUpdates = false;

      if (tournament.type === "round-robin") {
        // Check if all league matches are complete
        const leagueMatches = updatedMatches.filter(
          (m) => m.stage === "League"
        );
        const allLeagueComplete = leagueMatches.every((m) => m.winner);

        if (allLeagueComplete && pointsTable.length >= 4) {
          // Update playoff matches based on format
          if (tournament.knockoutFormat === "ipl-style") {
            // Qualifier 1: 1st vs 2nd
            const q1 = updatedMatches.find((m) => m.stage === "Qualifier 1");
            if (q1 && !q1.team1) {
              q1.team1 = pointsTable[0].team;
              q1.team2 = pointsTable[1].team;
              hasUpdates = true;
            }

            // Eliminator: 3rd vs 4th
            const elim = updatedMatches.find((m) => m.stage === "Eliminator");
            if (elim && !elim.team1) {
              elim.team1 = pointsTable[2].team;
              elim.team2 = pointsTable[3].team;
              hasUpdates = true;
            }

            // Qualifier 2: Loser of Q1 vs Winner of Eliminator
            const q1Match = updatedMatches.find(
              (m) => m.stage === "Qualifier 1"
            );
            const elimMatch = updatedMatches.find(
              (m) => m.stage === "Eliminator"
            );
            if (q1Match?.winner && elimMatch?.winner) {
              const q2 = updatedMatches.find((m) => m.stage === "Qualifier 2");
              if (q2 && !q2.team1) {
                const q1Loser =
                  q1Match.winner === q1Match.team1._id
                    ? q1Match.team2
                    : q1Match.team1;
                const elimWinner =
                  elimMatch.winner === elimMatch.team1._id
                    ? elimMatch.team1
                    : elimMatch.team2;
                q2.team1 = q1Loser;
                q2.team2 = elimWinner;
                hasUpdates = true;
              }
            }

            // Final: Winner of Q1 vs Winner of Q2
            const q2Match = updatedMatches.find(
              (m) => m.stage === "Qualifier 2"
            );
            if (q1Match?.winner && q2Match?.winner) {
              const final = updatedMatches.find((m) => m.stage === "Final");
              if (final && (!final.team1 || !final.winner)) {
                const q1Winner =
                  q1Match.winner === q1Match.team1._id
                    ? q1Match.team1
                    : q1Match.team2;
                const q2Winner =
                  q2Match.winner === q2Match.team1._id
                    ? q2Match.team1
                    : q2Match.team2;
                final.team1 = q1Winner;
                final.team2 = q2Winner;
                hasUpdates = true;
              }
            }
          } else if (tournament.knockoutFormat === "super-four-mini") {
            // Top 4 teams play mini round-robin
            const superFourMatches = updatedMatches.filter(
              (m) => m.stage === "Super Four"
            );
            if (superFourMatches.length > 0 && !superFourMatches[0].team1) {
              const top4 = pointsTable.slice(0, 4);
              superFourMatches[0].team1 = top4[0].team;
              superFourMatches[0].team2 = top4[1].team;
              superFourMatches[1].team1 = top4[0].team;
              superFourMatches[1].team2 = top4[2].team;
              superFourMatches[2].team1 = top4[1].team;
              superFourMatches[2].team2 = top4[2].team;
              hasUpdates = true;
            }

            // Check if Super Four is complete and update final
            const allSuperFourComplete = superFourMatches.every(
              (m) => m.winner
            );
            if (allSuperFourComplete) {
              const superFourTable = calculatePointsTable({
                ...tournament,
                matches: superFourMatches,
                teams: pointsTable.slice(0, 4).map((e) => e.team),
              });
              const final = updatedMatches.find((m) => m.stage === "Final");
              if (
                final &&
                (!final.team1 || !final.winner) &&
                superFourTable.length >= 2
              ) {
                final.team1 = superFourTable[0].team;
                final.team2 = superFourTable[1].team;
                hasUpdates = true;
              }
            }
          } else {
            // Standard semi-finals: 1 vs 4, 2 vs 3
            const semiFinals = updatedMatches.filter(
              (m) => m.stage === "Semi Final"
            );
            if (semiFinals.length >= 2 && !semiFinals[0].team1) {
              semiFinals[0].team1 = pointsTable[0].team;
              semiFinals[0].team2 = pointsTable[3].team;
              semiFinals[1].team1 = pointsTable[1].team;
              semiFinals[1].team2 = pointsTable[2].team;
              hasUpdates = true;
            }
          }

          // Update Quarter Finals if needed
          if (
            tournament.knockoutStage === "quarter-final" &&
            pointsTable.length >= 8
          ) {
            const quarterFinals = updatedMatches.filter(
              (m) => m.stage === "Quarter Final"
            );
            if (quarterFinals.length >= 4 && !quarterFinals[0].team1) {
              quarterFinals[0].team1 = pointsTable[0].team;
              quarterFinals[0].team2 = pointsTable[7].team;
              quarterFinals[1].team1 = pointsTable[1].team;
              quarterFinals[1].team2 = pointsTable[6].team;
              quarterFinals[2].team1 = pointsTable[2].team;
              quarterFinals[2].team2 = pointsTable[5].team;
              quarterFinals[3].team1 = pointsTable[3].team;
              quarterFinals[3].team2 = pointsTable[4].team;
              hasUpdates = true;
            }

            // Update semis from quarters
            const allQFComplete = quarterFinals.every((m) => m.winner);
            if (allQFComplete) {
              const semiFinals = updatedMatches.filter(
                (m) => m.stage === "Semi Final"
              );
              if (semiFinals.length >= 2 && !semiFinals[0].team1) {
                semiFinals[0].team1 =
                  quarterFinals[0].winner === quarterFinals[0].team1._id
                    ? quarterFinals[0].team1
                    : quarterFinals[0].team2;
                semiFinals[0].team2 =
                  quarterFinals[1].winner === quarterFinals[1].team1._id
                    ? quarterFinals[1].team1
                    : quarterFinals[1].team2;
                semiFinals[1].team1 =
                  quarterFinals[2].winner === quarterFinals[2].team1._id
                    ? quarterFinals[2].team1
                    : quarterFinals[2].team2;
                semiFinals[1].team2 =
                  quarterFinals[3].winner === quarterFinals[3].team1._id
                    ? quarterFinals[3].team1
                    : quarterFinals[3].team2;
                hasUpdates = true;
              }
            }
          }
        }

        // Update final based on semi-final results (for standard/super-four)
        // if (tournament.knockoutFormat !== "ipl-style") {
        //   const semiFinals = updatedMatches.filter(
        //     (m) => m.stage === "Semi Final"
        //   );
        //   const allSemisComplete = semiFinals.every((m) => m.winner);
        //   if (allSemisComplete && semiFinals.length === 2) {
        //     const final = updatedMatches.find((m) => m.stage === "Final");
        //     if (final && (!final.team1 || !final.winner)) {
        //       final.team1 =
        //         semiFinals[0].winner === semiFinals[0].team1?._id
        //           ? semiFinals[0].team1
        //           : semiFinals[0].team2;
        //       final.team2 =
        //         semiFinals[1].winner === semiFinals[1].team1?._id
        //           ? semiFinals[1].team1
        //           : semiFinals[1].team2;
        //       hasUpdates = true;
        //     }
        //   }
        // }

        // Replaced with down code--->
        // Update final based on semi-final results (only for tournaments with semi-finals)
        if (
          tournament.knockoutFormat !== "ipl-style" &&
          tournament.knockoutStage !== "super-four"
        ) {
          const semiFinals = updatedMatches.filter(
            (m) => m.stage === "Semi Final"
          );
          const allSemisComplete = semiFinals.every((m) => m.winner);
          if (allSemisComplete && semiFinals.length === 2) {
            const final = updatedMatches.find((m) => m.stage === "Final");
            if (final && (!final.team1 || !final.winner)) {
              final.team1 =
                semiFinals[0].winner === semiFinals[0].team1?._id
                  ? semiFinals[0].team1
                  : semiFinals[0].team2;
              final.team2 =
                semiFinals[1].winner === semiFinals[1].team1?._id
                  ? semiFinals[1].team1
                  : semiFinals[1].team2;
              hasUpdates = true;
            }
          }
        }
      } else if (tournament.type === "group-stage" && groupTables) {
        // Check if all group matches are complete
        const groupMatches = updatedMatches.filter(
          (m) => m.group && !m.group.includes("Super")
        );
        const allGroupsComplete = groupMatches.every((m) => m.winner);

        if (allGroupsComplete) {
          const qualifiers = [];
          Object.values(groupTables).forEach((table) => {
            // Get top 2 from each group - these are full team objects
            qualifiers.push(table[0].team, table[1].team);
          });

          // Super Eight stage
          if (
            tournament.knockoutStage === "super-eight" &&
            qualifiers.length >= 8
          ) {
            const superEightMatches = updatedMatches.filter(
              (m) => m.group && m.group.includes("Super Eight")
            );

            if (superEightMatches.length > 0 && !superEightMatches[0].team1) {
              // Distribute qualified teams into Super Eight groups
              const group1Teams = [
                qualifiers[0],
                qualifiers[3],
                qualifiers[4],
                qualifiers[7],
              ];
              const group2Teams = [
                qualifiers[1],
                qualifiers[2],
                qualifiers[5],
                qualifiers[6],
              ];

              // Generate matches for Super Eight Group 1
              let matchIndex = 0;
              for (let i = 0; i < group1Teams.length; i++) {
                for (let j = i + 1; j < group1Teams.length; j++) {
                  if (superEightMatches[matchIndex]) {
                    superEightMatches[matchIndex].team1 = group1Teams[i];
                    superEightMatches[matchIndex].team2 = group1Teams[j];
                    superEightMatches[matchIndex].group = "Super Eight Group 1";
                    matchIndex++;
                  }
                }
              }

              // Generate matches for Super Eight Group 2
              for (let i = 0; i < group2Teams.length; i++) {
                for (let j = i + 1; j < group2Teams.length; j++) {
                  if (superEightMatches[matchIndex]) {
                    superEightMatches[matchIndex].team1 = group2Teams[i];
                    superEightMatches[matchIndex].team2 = group2Teams[j];
                    superEightMatches[matchIndex].group = "Super Eight Group 2";
                    matchIndex++;
                  }
                }
              }
              hasUpdates = true;
            }

            // Check if Super Eight is complete and update semis
            const allSuperEightComplete = superEightMatches.every(
              (m) => m.winner
            );
            if (allSuperEightComplete) {
              // Calculate Super Eight group tables
              const superEightTables = {
                "Super Eight Group 1": {},
                "Super Eight Group 2": {},
              };

              superEightMatches.forEach((match) => {
                if (!superEightTables[match.group]) return;

                const table = superEightTables[match.group];

                if (!table[match.team1._id]) {
                  table[match.team1._id] = {
                    team: match.team1,
                    played: 0,
                    won: 0,
                    lost: 0,
                    points: 0,
                    nrr: 0,
                  };
                }
                if (!table[match.team2._id]) {
                  table[match.team2._id] = {
                    team: match.team2,
                    played: 0,
                    won: 0,
                    lost: 0,
                    points: 0,
                    nrr: 0,
                  };
                }

                table[match.team1._id].played++;
                table[match.team2._id].played++;

                if (match.winner === match.team1._id) {
                  table[match.team1._id].won++;
                  table[match.team1._id].points += 2;
                  table[match.team2._id].lost++;
                } else {
                  table[match.team2._id].won++;
                  table[match.team2._id].points += 2;
                  table[match.team1._id].lost++;
                }
              });

              // Sort tables and get top 2 from each
              const superEightQualifiers = [];
              Object.keys(superEightTables).forEach((groupName) => {
                const sorted = Object.values(superEightTables[groupName]).sort(
                  (a, b) => {
                    if (b.points !== a.points) return b.points - a.points;
                    return parseFloat(b.nrr) - parseFloat(a.nrr);
                  }
                );
                superEightQualifiers.push(sorted[0].team, sorted[1].team);
              });

              // Update semis
              const semiFinals = updatedMatches.filter(
                (m) => m.stage === "Semi Final"
              );
              if (
                semiFinals.length >= 2 &&
                !semiFinals[0].team1 &&
                superEightQualifiers.length >= 4
              ) {
                semiFinals[0].team1 = superEightQualifiers[0];
                semiFinals[0].team2 = superEightQualifiers[3];
                semiFinals[1].team1 = superEightQualifiers[1];
                semiFinals[1].team2 = superEightQualifiers[2];
                hasUpdates = true;
              }
            }
          } else if (
            tournament.knockoutStage === "super-four" &&
            qualifiers.length >= 4
          ) {
            // Super Four: Top 4 teams play complete round-robin (each team plays 3 matches)
            const superFourMatches = updatedMatches.filter(
              (m) => m.stage === "Super Four"
            );
            if (superFourMatches.length >= 6 && !superFourMatches[0].team1) {
              const top4 = qualifiers.slice(0, 4);
              // Generate all possible matches between 4 teams
              let matchIndex = 0;
              for (let i = 0; i < top4.length; i++) {
                for (let j = i + 1; j < top4.length; j++) {
                  if (superFourMatches[matchIndex]) {
                    superFourMatches[matchIndex].team1 = top4[i];
                    superFourMatches[matchIndex].team2 = top4[j];
                    matchIndex++;
                  }
                }
              }
              hasUpdates = true;
            }

            // Update final from Super Four (no semi-finals)
            const allSuperFourComplete = superFourMatches.every(
              (m) => m.winner
            );
            if (allSuperFourComplete) {
              const superFourTable = calculatePointsTable({
                ...tournament,
                matches: superFourMatches,
                teams: qualifiers.slice(0, 4),
              });
              const final = updatedMatches.find((m) => m.stage === "Final");
              if (
                final &&
                (!final.team1 || !final.winner) &&
                superFourTable.length >= 2
              ) {
                final.team1 = superFourTable[0].team;
                final.team2 = superFourTable[1].team;
                hasUpdates = true;
              }
            }
          } else if (
            tournament.knockoutStage === "semi-final" &&
            qualifiers.length >= 4
          ) {
            const semiFinals = updatedMatches.filter(
              (m) => m.stage === "Semi Final"
            );
            if (semiFinals.length >= 2 && !semiFinals[0].team1) {
              semiFinals[0].team1 = qualifiers[0];
              semiFinals[0].team2 = qualifiers[3];
              semiFinals[1].team1 = qualifiers[1];
              semiFinals[1].team2 = qualifiers[2];
              hasUpdates = true;
            }
          } else if (
            tournament.knockoutStage === "quarter-final" &&
            qualifiers.length >= 8
          ) {
            const quarterFinals = updatedMatches.filter(
              (m) => m.stage === "Quarter Final"
            );
            if (quarterFinals.length >= 4 && !quarterFinals[0].team1) {
              quarterFinals[0].team1 = qualifiers[0];
              quarterFinals[0].team2 = qualifiers[7];
              quarterFinals[1].team1 = qualifiers[1];
              quarterFinals[1].team2 = qualifiers[6];
              quarterFinals[2].team1 = qualifiers[2];
              quarterFinals[2].team2 = qualifiers[5];
              quarterFinals[3].team1 = qualifiers[3];
              quarterFinals[3].team2 = qualifiers[4];
              hasUpdates = true;
            }

            // Update semis from quarters
            const allQFComplete = quarterFinals.every((m) => m.winner);
            if (allQFComplete) {
              const semiFinals = updatedMatches.filter(
                (m) => m.stage === "Semi Final"
              );
              if (semiFinals.length >= 2 && !semiFinals[0].team1) {
                semiFinals[0].team1 =
                  quarterFinals[0].winner === quarterFinals[0].team1._id
                    ? quarterFinals[0].team1
                    : quarterFinals[0].team2;
                semiFinals[0].team2 =
                  quarterFinals[1].winner === quarterFinals[1].team1._id
                    ? quarterFinals[1].team1
                    : quarterFinals[1].team2;
                semiFinals[1].team1 =
                  quarterFinals[2].winner === quarterFinals[2].team1._id
                    ? quarterFinals[2].team1
                    : quarterFinals[2].team2;
                semiFinals[1].team2 =
                  quarterFinals[3].winner === quarterFinals[3].team1._id
                    ? quarterFinals[3].team1
                    : quarterFinals[3].team2;
                hasUpdates = true;
              }
            }
          }
        }

        // Update final for group stage tournaments
        // const semiFinals = updatedMatches.filter(
        //   (m) => m.stage === "Semi Final"
        // );

        // const allSemisComplete = semiFinals.every((m) => m.winner);
        // if (allSemisComplete && semiFinals.length === 2) {
        //   const final = updatedMatches.find((m) => m.stage === "Final");
        //   if (final && (!final.team1 || !final.winner)) {
        //     final.team1 =
        //       semiFinals[0].winner === semiFinals[0].team1?._id
        //         ? semiFinals[0].team1
        //         : semiFinals[0].team2;
        //     final.team2 =
        //       semiFinals[1].winner === semiFinals[1].team1?._id
        //         ? semiFinals[1].team1
        //         : semiFinals[1].team2;
        //     hasUpdates = true;
        //   }
        // }

        // Replaced with down code--->
        // Update final for group stage tournaments (only if not super-four, which handles its own final)
        if (tournament.knockoutStage !== "super-four") {
          const semiFinals = updatedMatches.filter(
            (m) => m.stage === "Semi Final"
          );
          const allSemisComplete = semiFinals.every((m) => m.winner);
          if (allSemisComplete && semiFinals.length === 2) {
            const final = updatedMatches.find((m) => m.stage === "Final");
            if (final && (!final.team1 || !final.winner)) {
              final.team1 =
                semiFinals[0].winner === semiFinals[0].team1?._id
                  ? semiFinals[0].team1
                  : semiFinals[0].team2;
              final.team2 =
                semiFinals[1].winner === semiFinals[1].team1?._id
                  ? semiFinals[1].team1
                  : semiFinals[1].team2;
              hasUpdates = true;
            }
          }
        }
      } else if (tournament.type === "tri-series") {
        // Check if all league matches are complete
        const leagueMatches = updatedMatches.filter(
          (m) => m.stage === "League"
        );
        const allLeagueComplete = leagueMatches.every((m) => m.winner);

        if (allLeagueComplete && pointsTable.length >= 2) {
          const final = updatedMatches.find((m) => m.stage === "Final");
          if (final && (!final.team1 || !final.winner)) {
            final.team1 = pointsTable[0].team;
            final.team2 = pointsTable[1].team;
            hasUpdates = true;
          }
        }
      }

      // Save updates if there are any
      if (hasUpdates) {
        await tournamentsAPI.updateKnockoutTeams(tournament._id, {
          adminCode: adminCode,
          matches: updatedMatches,
        });
        await loadData();
      }
    } catch (error) {
      console.error("Failed to update knockout stages:", error);
    }
  };

  const updateMatchResult = async (tournamentId, matchId, winnerId, scores) => {
    try {
      await tournamentsAPI.updateMatch(tournamentId, matchId, {
        adminCode: adminCode,
        winner: winnerId,
        team1Score: scores.team1Score,
        team2Score: scores.team2Score,
      });

      // Reload tournament data
      const [teamsRes, tournamentsRes] = await Promise.all([
        teamsAPI.getAll(),
        tournamentsAPI.getAll(),
      ]);
      setTeams(teamsRes.data);
      setTournaments(tournamentsRes.data);

      // Get the freshly updated tournament from the API response
      const updatedTournament = tournamentsRes.data.find(
        (t) => t._id === tournamentId
      );
      if (updatedTournament) {
        await updateKnockoutStages(updatedTournament);
      }

      setEditingMatch(null);
      setAdminCode("");
    } catch (error) {
      alert("Failed to update match result");
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <header className="bg-slate-800 border-b-4 border-red-600 sticky top-0 z-50 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 animate-fade-in">
              <Trophy className="text-red-600" size={32} />
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-red-600">
                  SAGED CHAMPIONS LEAGUE
                </h1>
                <p className="text-xs text-slate-400">
                  The Ultimate Cricket Tournament Platform
                </p>
              </div>
            </div>
            <nav className="flex gap-2 flex-wrap justify-center">
              <button
                onClick={() => setCurrentView("home")}
                className={`px-4 py-2 rounded transition-all flex items-center gap-2 ${
                  currentView === "home"
                    ? "bg-red-600"
                    : "bg-slate-700 hover:bg-slate-600"
                }`}
              >
                <Home size={16} /> Home
              </button>
              <button
                onClick={() => setCurrentView("teams")}
                className={`px-4 py-2 rounded transition-all flex items-center gap-2 ${
                  currentView === "teams"
                    ? "bg-red-600"
                    : "bg-slate-700 hover:bg-slate-600"
                }`}
              >
                <Users size={16} /> Teams
              </button>
              <button
                onClick={() => setCurrentView("create")}
                className={`px-4 py-2 rounded transition-all flex items-center gap-2 ${
                  currentView === "create"
                    ? "bg-red-600"
                    : "bg-slate-700 hover:bg-slate-600"
                }`}
              >
                <Plus size={16} /> Create
              </button>
              <button
                onClick={() => setCurrentView("tournaments")}
                className={`px-4 py-2 rounded transition-all flex items-center gap-2 ${
                  currentView === "tournaments"
                    ? "bg-red-600"
                    : "bg-slate-700 hover:bg-slate-600"
                }`}
              >
                <Trophy size={16} /> Tournaments
              </button>
              {currentUser ? (
                <button
                  onClick={logout}
                  className="px-4 py-2 rounded transition-all flex items-center gap-2 bg-red-600 hover:bg-red-700"
                >
                  Logout
                </button>
              ) : (
                <Link to="/login">
                  <button className="px-4 py-2 rounded transition-all flex items-center gap-2 bg-slate-700 hover:bg-slate-600">
                    Login
                  </button>
                </Link>
              )}
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === "home" && (
          <div className="space-y-8 animate-slide-up">
            <div className="text-center space-y-4">
              <h2 className="text-4xl sm:text-5xl font-bold text-red-600">
                Welcome to the Arena
              </h2>
              <p className="text-lg text-slate-300 max-w-2xl mx-auto">
                Create and manage world-class cricket tournaments with real-time
                scoring, advanced statistics, and comprehensive tournament
                management.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-slate-800 p-6 rounded-xl border-2 border-blue-600 hover:scale-105 transition-all cursor-pointer">
                <Target className="text-blue-600 mb-4" size={40} />
                <h3 className="text-xl font-bold mb-2">Multiple Formats</h3>
                <p className="text-slate-400">
                  IPL-style round-robin, World Cup groups, or tri-series
                  tournaments
                </p>
              </div>

              <div className="bg-slate-800 p-6 rounded-xl border-2 border-emerald-600 hover:scale-105 transition-all cursor-pointer">
                <TrendingUp className="text-emerald-600 mb-4" size={40} />
                <h3 className="text-xl font-bold mb-2">Live Scoring</h3>
                <p className="text-slate-400">
                  Update scores with runs and overs, auto-calculate NRR
                </p>
              </div>

              <div className="bg-slate-800 p-6 rounded-xl border-2 border-purple-600 hover:scale-105 transition-all cursor-pointer">
                <BarChart3 className="text-purple-600 mb-4" size={40} />
                <h3 className="text-xl font-bold mb-2">Smart Tables</h3>
                <p className="text-slate-400">
                  Dynamic points tables sorted by points and NRR
                </p>
              </div>

              <div className="bg-slate-800 p-6 rounded-xl border-2 border-orange-600 hover:scale-105 transition-all cursor-pointer">
                <Lock className="text-orange-600 mb-4" size={40} />
                <h3 className="text-xl font-bold mb-2">Admin Control</h3>
                <p className="text-slate-400">
                  Secure admin codes for tournament management
                </p>
              </div>

              <div className="bg-slate-800 p-6 rounded-xl border-2 border-pink-600 hover:scale-105 transition-all cursor-pointer">
                <Activity className="text-pink-600 mb-4" size={40} />
                <h3 className="text-xl font-bold mb-2">Real-time Updates</h3>
                <p className="text-slate-400">
                  All users see live tournament updates instantly
                </p>
              </div>

              <div className="bg-slate-800 p-6 rounded-xl border-2 border-cyan-600 hover:scale-105 transition-all cursor-pointer">
                <Share2 className="text-cyan-600 mb-4" size={40} />
                <h3 className="text-xl font-bold mb-2">Shareable</h3>
                <p className="text-slate-400">
                  Share tournaments with friends and fans
                </p>
              </div>
            </div>

            <div className="bg-slate-800 border-2 border-red-600 rounded-xl p-8 text-center">
              <h3 className="text-3xl font-bold mb-4">
                Active Tournaments: {tournaments.length}
              </h3>
              <p className="text-slate-300 mb-6">
                Join the excitement or create your own championship!
              </p>
              <button
                onClick={() => setCurrentView("create")}
                className="bg-red-600 px-8 py-3 rounded-lg hover:bg-red-700 transition-all font-bold text-lg"
              >
                Create Tournament Now
              </button>
            </div>
          </div>
        )}

        {currentView === "teams" && (
          <div className="space-y-6 animate-slide-up">
            <h2 className="text-3xl font-bold flex items-center gap-3">
              <Users className="text-blue-600" /> Manage Teams
            </h2>

            <div className="bg-slate-800 p-6 rounded-xl">
              <div className="flex gap-2 mb-6">
                <input
                  type="text"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addTeam()}
                  placeholder="Enter team name..."
                  className="flex-1 px-4 py-3 bg-slate-700 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
                />
                <button
                  onClick={addTeam}
                  className="bg-blue-600 px-6 py-3 rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2"
                >
                  <Plus size={20} /> Add Team
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {teams.map((team) => (
                  <div
                    key={team._id}
                    className="bg-slate-700 p-4 rounded-lg flex items-center justify-between hover:scale-105 transition-all"
                    style={{ borderLeft: `4px solid ${team.color}` }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center font-bold"
                        style={{ backgroundColor: team.color }}
                      >
                        {team.name.charAt(0)}
                      </div>
                      <span className="font-medium">{team.name}</span>
                    </div>
                    <button
                      onClick={() => removeTeam(team._id)}
                      className="text-red-500 hover:text-red-400 transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>

              {teams.length === 0 && (
                <div className="text-center text-slate-400 py-12">
                  <Users size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No teams yet. Add your first team to get started!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {currentView === "create" && (
          <div className="space-y-6 animate-slide-up">
            <h2 className="text-3xl font-bold flex items-center gap-3">
              <Calendar className="text-emerald-600" /> Create Tournament
            </h2>

            <div className="bg-slate-800 p-6 rounded-xl space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Tournament Name
                </label>
                <input
                  type="text"
                  value={tournamentName}
                  onChange={(e) => setTournamentName(e.target.value)}
                  placeholder="e.g., SAGED Premier League 2025"
                  className="w-full px-4 py-3 bg-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Tournament Format
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    onClick={() => setTournamentType("round-robin")}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      tournamentType === "round-robin"
                        ? "border-emerald-600 bg-emerald-600/20"
                        : "border-slate-600 hover:border-slate-500"
                    }`}
                  >
                    <div className="font-bold mb-1">Round Robin</div>
                    <div className="text-xs text-slate-400">IPL Style</div>
                  </button>
                  <button
                    onClick={() => setTournamentType("group-stage")}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      tournamentType === "group-stage"
                        ? "border-emerald-600 bg-emerald-600/20"
                        : "border-slate-600 hover:border-slate-500"
                    }`}
                  >
                    <div className="font-bold mb-1">Group Stage</div>
                    <div className="text-xs text-slate-400">
                      World Cup Style
                    </div>
                  </button>
                  <button
                    onClick={() => setTournamentType("tri-series")}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      tournamentType === "tri-series"
                        ? "border-emerald-600 bg-emerald-600/20"
                        : "border-slate-600 hover:border-slate-500"
                    }`}
                  >
                    <div className="font-bold mb-1">Tri-Series</div>
                    <div className="text-xs text-slate-400">3 Teams</div>
                  </button>
                </div>
              </div>

              {tournamentType === "group-stage" && (
                <div className="space-y-4">
                  <div>
                    <label className="flex items-center gap-2 mb-4">
                      <input
                        type="checkbox"
                        checked={hasGroupStage}
                        onChange={(e) => setHasGroupStage(e.target.checked)}
                        className="w-4 h-4"
                      />
                      <span>Include Group Stage</span>
                    </label>
                  </div>

                  {hasGroupStage && (
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Number of Groups
                      </label>
                      <input
                        type="number"
                        min="2"
                        max="4"
                        value={groupCount}
                        onChange={(e) => setGroupCount(Number(e.target.value))}
                        className="w-full px-4 py-3 bg-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-600 outline-none"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Knockout Stage
                    </label>
                    <select
                      value={knockoutStage}
                      onChange={(e) => setKnockoutStage(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-600 outline-none"
                    >
                      <option value="final">Final Only</option>
                      <option value="semi-final">Semi Finals + Final</option>
                      <option value="super-four">Super Four + Final</option>
                      {selectedTeams.length >= 10 && (
                        <option value="super-eight">
                          Super Eight + Semi Finals + Final
                        </option>
                      )}
                      {selectedTeams.length >= 10 && (
                        <option value="quarter-final">
                          Quarter Finals + Semi Finals + Final
                        </option>
                      )}
                    </select>
                  </div>
                </div>
              )}

              {tournamentType === "round-robin" &&
                selectedTeams.length >= 4 && (
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Playoff Format
                    </label>
                    <div className="grid grid-cols-1 gap-3">
                      <button
                        onClick={() => setKnockoutFormat("standard")}
                        className={`p-4 rounded-lg border-2 transition-all text-left ${
                          knockoutFormat === "standard"
                            ? "border-emerald-600 bg-emerald-600/20"
                            : "border-slate-600 hover:border-slate-500"
                        }`}
                      >
                        <div className="font-bold mb-1">
                          Standard Semi Finals
                        </div>
                        <div className="text-xs text-slate-400">
                          1 vs 4, 2 vs 3
                        </div>
                      </button>
                      <button
                        onClick={() => setKnockoutFormat("ipl-style")}
                        className={`p-4 rounded-lg border-2 transition-all text-left ${
                          knockoutFormat === "ipl-style"
                            ? "border-emerald-600 bg-emerald-600/20"
                            : "border-slate-600 hover:border-slate-500"
                        }`}
                      >
                        <div className="font-bold mb-1">IPL Style Playoffs</div>
                        <div className="text-xs text-slate-400">
                          Qualifier 1, Eliminator, Qualifier 2, Final
                        </div>
                      </button>
                      <button
                        onClick={() => setKnockoutFormat("super-four-mini")}
                        className={`p-4 rounded-lg border-2 transition-all text-left ${
                          knockoutFormat === "super-four-mini"
                            ? "border-emerald-600 bg-emerald-600/20"
                            : "border-slate-600 hover:border-slate-500"
                        }`}
                      >
                        <div className="font-bold mb-1">
                          Super Four Mini Round Robin
                        </div>
                        <div className="text-xs text-slate-400">
                          Top 4 play round robin, top 2 to final
                        </div>
                      </button>
                      {selectedTeams.length >= 10 && (
                        <button
                          onClick={() => setKnockoutStage("quarter-final")}
                          className={`p-4 rounded-lg border-2 transition-all text-left ${
                            knockoutStage === "quarter-final"
                              ? "border-emerald-600 bg-emerald-600/20"
                              : "border-slate-600 hover:border-slate-500"
                          }`}
                        >
                          <div className="font-bold mb-1">Quarter Finals</div>
                          <div className="text-xs text-slate-400">
                            Top 8 teams → QF → SF → Final
                          </div>
                        </button>
                      )}
                    </div>
                  </div>
                )}

              <div>
                <label className="block text-sm font-medium mb-2">
                  Select Teams ({selectedTeams.length} selected)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto p-2">
                  {teams.map((team) => (
                    <button
                      key={team._id}
                      onClick={() => {
                        if (
                          tournamentType === "tri-series" &&
                          selectedTeams.length >= 3 &&
                          !selectedTeams.find((t) => t._id === team._id)
                        ) {
                          alert("Tri-series can only have 3 teams");
                          return;
                        }
                        setSelectedTeams((prev) =>
                          prev.find((t) => t._id === team._id)
                            ? prev.filter((t) => t._id !== team._id)
                            : [...prev, team]
                        );
                      }}
                      className={`p-3 rounded-lg border-2 transition-all text-left ${
                        selectedTeams.find((t) => t._id === team._id)
                          ? "border-emerald-600 bg-emerald-600/20"
                          : "border-slate-600 hover:border-slate-500"
                      }`}
                      style={{
                        borderLeftWidth: "4px",
                        borderLeftColor: team.color,
                      }}
                    >
                      {team.name}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={createTournament}
                className="w-full bg-emerald-600 px-6 py-4 rounded-lg hover:bg-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-bold text-lg flex items-center justify-center gap-2"
              >
                <Trophy size={24} /> Create Tournament
              </button>
            </div>
          </div>
        )}

        {currentView === "tournaments" && (
          <div className="space-y-6 animate-slide-up">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-3xl font-bold flex items-center gap-3">
                <Trophy className="text-yellow-500" /> All Tournaments
              </h2>
              <div className="flex gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-initial">
                  <Search
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"
                    size={18}
                  />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search tournaments..."
                    className="w-full sm:w-64 pl-10 pr-4 py-2 bg-slate-700 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
                  />
                </div>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-4 py-2 bg-slate-700 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
                >
                  <option value="all">All Types</option>
                  <option value="round-robin">Round Robin</option>
                  <option value="group-stage">Group Stage</option>
                  <option value="tri-series">Tri-Series</option>
                </select>
              </div>
            </div>

            {filteredTournaments.length === 0 ? (
              <div className="text-center text-slate-400 py-12 bg-slate-800 rounded-xl">
                <Trophy size={48} className="mx-auto mb-4 opacity-50" />
                <p className="text-lg">No tournaments found</p>
                <p className="text-sm mt-2">
                  Create your first tournament to get started!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {filteredTournaments.map((tournament) => (
                  <div
                    key={tournament._id}
                    className="bg-slate-800 rounded-xl overflow-hidden border-2 border-slate-700 hover:border-blue-600 transition-all"
                  >
                    <div className="p-6">
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                        <div className="flex-1">
                          <h3 className="text-2xl font-bold mb-2 text-blue-400">
                            {tournament.name}
                          </h3>
                          <div className="flex flex-wrap gap-3 text-sm text-slate-400">
                            <span className="flex items-center gap-1">
                              <Calendar size={14} />
                              {new Date(
                                tournament.createdAt
                              ).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users size={14} />
                              {tournament.teams.length} Teams
                            </span>
                            <span className="flex items-center gap-1">
                              <Activity size={14} />
                              {
                                tournament.matches.filter((m) => m.winner)
                                  .length
                              }
                              /{tournament.matches.length} Matches
                            </span>
                            <span className="px-2 py-1 bg-blue-600 rounded text-white text-xs">
                              {tournament.type.replace("-", " ").toUpperCase()}
                            </span>
                            {tournament.status === "completed" &&
                              tournament.winner && (
                                <span className="px-2 py-1 bg-yellow-600 rounded text-white text-xs flex items-center gap-1">
                                  <Trophy size={12} /> COMPLETED
                                </span>
                              )}
                          </div>

                          {/* Add Winner/Runner-up Display */}
                          {tournament.winner && (
                            <div className="mt-4 p-3 bg-gradient-to-r from-yellow-900/30 to-slate-800 rounded-lg border border-yellow-600/30">
                              <div className="flex items-center justify-between flex-wrap gap-3">
                                <div className="flex items-center gap-2">
                                  <Trophy
                                    className="text-yellow-500"
                                    size={20}
                                  />
                                  <div>
                                    <div className="text-xs text-slate-400">
                                      Champion
                                    </div>
                                    <div className="font-bold text-yellow-400 flex items-center gap-2">
                                      <div
                                        className="w-4 h-4 rounded-full"
                                        style={{
                                          backgroundColor:
                                            tournament.winner.color,
                                        }}
                                      />
                                      {tournament.winner.name}
                                    </div>
                                  </div>
                                </div>
                                {tournament.runnerUp && (
                                  <div className="flex items-center gap-2">
                                    <div>
                                      <div className="text-xs text-slate-400 text-right">
                                        Runner-up
                                      </div>
                                      <div className="font-semibold text-slate-300 flex items-center gap-2">
                                        <div
                                          className="w-4 h-4 rounded-full"
                                          style={{
                                            backgroundColor:
                                              tournament.runnerUp.color,
                                          }}
                                        />
                                        {tournament.runnerUp.name}
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setSelectedTournament(tournament)}
                            className="bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2"
                          >
                            <Eye size={16} /> View
                          </button>
                          <button
                            onClick={() => {
                              if (
                                window.confirm(
                                  `Are you the admin of "${tournament.name}"?\n\nAdmin Code: ${tournament.adminCode}\n\nClick OK to copy the code.`
                                )
                              ) {
                                navigator.clipboard.writeText(
                                  tournament.adminCode
                                );
                                alert("Admin code copied to clipboard!");
                              }
                            }}
                            className="bg-purple-600 px-4 py-2 rounded-lg hover:bg-purple-700 transition-all"
                            title="View Admin Code"
                          >
                            <Lock size={16} />
                          </button>
                          <button
                            onClick={() => {
                              const code = prompt(
                                "Enter admin code to delete:"
                              );
                              if (code) deleteTournament(tournament._id, code);
                            }}
                            className="bg-red-600 px-4 py-2 rounded-lg hover:bg-red-700 transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {calculatePointsTable(tournament)
                          .slice(0, 4)
                          .map((entry, idx) => (
                            <div
                              key={entry.team._id}
                              className="bg-slate-700 p-3 rounded-lg"
                            >
                              <div className="text-xs text-slate-400 mb-1">
                                #{idx + 1}
                              </div>
                              <div className="font-bold text-sm truncate">
                                {entry.team.name}
                              </div>
                              <div className="text-xs text-slate-400">
                                {entry.points} pts
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {selectedTournament && (
          <div className="fixed inset-0 bg-black/80 z-50 overflow-y-auto">
            <div className="min-h-screen p-4">
              <div className="max-w-6xl mx-auto bg-slate-800 rounded-xl">
                <div className="p-6 border-b-2 border-slate-700">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-3xl font-bold text-blue-400 mb-2">
                        {selectedTournament.name}
                      </h2>
                      <div className="flex flex-wrap gap-3 text-sm text-slate-400">
                        <span className="px-3 py-1 bg-blue-600 rounded-full">
                          {selectedTournament.type
                            .replace("-", " ")
                            .toUpperCase()}
                        </span>
                        <span>{selectedTournament.teams.length} Teams</span>
                        <span>{selectedTournament.matches.length} Matches</span>

                        {/* Winner Badge */}
                        {selectedTournament.winner && (
                          <>
                            <span className="px-3 py-1 bg-yellow-600 rounded-full flex items-center gap-1">
                              <Trophy size={14} />
                              {selectedTournament.winner.name}
                            </span>
                            {selectedTournament.runnerUp && (
                              <span className="px-3 py-1 bg-slate-600 rounded-full">
                                Runner-up: {selectedTournament.runnerUp.name}
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedTournament(null)}
                      className="bg-slate-700 px-4 py-2 rounded-lg hover:bg-slate-600 transition-all"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <input
                      type="text"
                      value={adminCode}
                      onChange={(e) =>
                        setAdminCode(e.target.value.toUpperCase())
                      }
                      placeholder="Enter admin code to edit..."
                      className="flex-1 px-4 py-2 bg-slate-700 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
                    />
                    {adminCode === selectedTournament.adminCode && (
                      <span className="px-4 py-2 bg-emerald-600 rounded-lg flex items-center gap-2">
                        <Check size={16} /> Admin Access
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex border-b-2 border-slate-700 overflow-x-auto">
                  {["matches", "points", "stats"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setCurrentTab(tab)}
                      className={`px-6 py-3 font-medium transition-all border-b-2 whitespace-nowrap ${
                        currentTab === tab
                          ? "border-blue-600 bg-slate-700"
                          : "border-transparent hover:bg-slate-700 hover:border-blue-600"
                      }`}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </div>

                {/* ------------------------------------------------ */}

                {/* Winner Banner */}
                {selectedTournament.winner && (
                  <div className="p-4 bg-gradient-to-r from-yellow-600/20 via-yellow-500/10 to-yellow-600/20 border-y-2 border-yellow-600/50">
                    <div className="max-w-4xl mx-auto flex items-center justify-center gap-4 flex-wrap">
                      <Trophy
                        className="text-yellow-500 animate-bounce"
                        size={32}
                      />
                      <div className="text-center">
                        <div className="text-lg font-bold text-yellow-400 mb-1">
                          🎉 Tournament Champion 🎉
                        </div>
                        <div className="flex items-center gap-2 justify-center">
                          <div
                            className="w-6 h-6 rounded-full"
                            style={{
                              backgroundColor: selectedTournament.winner.color,
                            }}
                          />
                          <span className="text-2xl font-bold text-white">
                            {selectedTournament.winner.name}
                          </span>
                        </div>
                        {selectedTournament.runnerUp && (
                          <div className="text-sm text-slate-300 mt-2">
                            Runner-up: {selectedTournament.runnerUp.name}
                          </div>
                        )}
                      </div>
                      <Trophy
                        className="text-yellow-500 animate-bounce"
                        size={32}
                      />
                    </div>
                  </div>
                )}

                {/* ----------------------------------------- */}
                <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
                  {currentTab === "points" && (
                    <div>
                      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <BarChart3 className="text-yellow-500" /> Points Table
                      </h3>

                      {(() => {
                        const groupTables =
                          calculateGroupPointsTables(selectedTournament);

                        // Check if Super Four stage exists and has matches
                        const superFourMatches =
                          selectedTournament.matches.filter(
                            (m) => m.stage === "Super Four"
                          );
                        const hasSuperFour = superFourMatches.length > 0;
                        const superFourStarted = superFourMatches.some(
                          (m) => m.winner
                        );
                        // If group stage tournament with groups, show separate tables
                        if (groupTables) {
                          return (
                            <div className="space-y-6">
                              {Object.entries(groupTables).map(
                                ([groupName, table]) => (
                                  <div key={groupName}>
                                    <h4 className="text-lg font-bold mb-3 text-blue-400">
                                      {groupName}
                                    </h4>
                                    <div className="bg-slate-900 rounded-lg overflow-hidden">
                                      <table className="w-full">
                                        <thead className="bg-slate-700">
                                          <tr>
                                            <th className="px-4 py-3 text-left">
                                              Pos
                                            </th>
                                            <th className="px-4 py-3 text-left">
                                              Team
                                            </th>
                                            <th className="px-4 py-3 text-center">
                                              P
                                            </th>
                                            <th className="px-4 py-3 text-center">
                                              W
                                            </th>
                                            <th className="px-4 py-3 text-center">
                                              L
                                            </th>
                                            <th className="px-4 py-3 text-center">
                                              Pts
                                            </th>
                                            <th className="px-4 py-3 text-center">
                                              NRR
                                            </th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {table.map((entry, idx) => (
                                            <tr
                                              key={entry.team._id}
                                              className="border-t border-slate-700 hover:bg-slate-800 transition-all"
                                            >
                                              <td className="px-4 py-3 font-bold">
                                                {idx + 1}
                                              </td>
                                              <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                  <div
                                                    className="w-6 h-6 rounded-full"
                                                    style={{
                                                      backgroundColor:
                                                        entry.team.color,
                                                    }}
                                                  />
                                                  <span className="font-medium">
                                                    {entry.team.name}
                                                  </span>
                                                </div>
                                              </td>
                                              <td className="px-4 py-3 text-center">
                                                {entry.played}
                                              </td>
                                              <td className="px-4 py-3 text-center text-emerald-400">
                                                {entry.won}
                                              </td>
                                              <td className="px-4 py-3 text-center text-red-400">
                                                {entry.lost}
                                              </td>
                                              <td className="px-4 py-3 text-center font-bold text-blue-400">
                                                {entry.points}
                                              </td>
                                              <td className="px-4 py-3 text-center">
                                                {entry.nrr}
                                              </td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>
                                )
                              )}

                              {/* Super Four Points Table */}
                              {hasSuperFour && superFourStarted && (
                                <div>
                                  <h4 className="text-lg font-bold mb-3 text-purple-400">
                                    Super Four Points Table
                                  </h4>
                                  {(() => {
                                    // Get teams in Super Four
                                    const superFourTeams = [];
                                    const teamSet = new Set();

                                    superFourMatches.forEach((match) => {
                                      if (
                                        match.team1 &&
                                        !teamSet.has(match.team1._id)
                                      ) {
                                        superFourTeams.push(match.team1);
                                        teamSet.add(match.team1._id);
                                      }
                                      if (
                                        match.team2 &&
                                        !teamSet.has(match.team2._id)
                                      ) {
                                        superFourTeams.push(match.team2);
                                        teamSet.add(match.team2._id);
                                      }
                                    });

                                    // Calculate Super Four points table
                                    const superFourTable = calculatePointsTable(
                                      {
                                        ...selectedTournament,
                                        matches: superFourMatches,
                                        teams: superFourTeams,
                                      }
                                    );

                                    return (
                                      <div className="bg-slate-900 rounded-lg overflow-hidden">
                                        <table className="w-full">
                                          <thead className="bg-slate-700">
                                            <tr>
                                              <th className="px-4 py-3 text-left">
                                                Pos
                                              </th>
                                              <th className="px-4 py-3 text-left">
                                                Team
                                              </th>
                                              <th className="px-4 py-3 text-center">
                                                P
                                              </th>
                                              <th className="px-4 py-3 text-center">
                                                W
                                              </th>
                                              <th className="px-4 py-3 text-center">
                                                L
                                              </th>
                                              <th className="px-4 py-3 text-center">
                                                Pts
                                              </th>
                                              <th className="px-4 py-3 text-center">
                                                NRR
                                              </th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            {superFourTable.map(
                                              (entry, idx) => (
                                                <tr
                                                  key={entry.team._id}
                                                  className={`border-t border-slate-700 hover:bg-slate-800 transition-all ${
                                                    idx < 2
                                                      ? "bg-purple-900/20"
                                                      : ""
                                                  }`}
                                                >
                                                  <td className="px-4 py-3 font-bold">
                                                    {idx + 1}
                                                  </td>
                                                  <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2">
                                                      <div
                                                        className="w-6 h-6 rounded-full"
                                                        style={{
                                                          backgroundColor:
                                                            entry.team.color,
                                                        }}
                                                      />
                                                      <span className="font-medium">
                                                        {entry.team.name}
                                                      </span>
                                                    </div>
                                                  </td>
                                                  <td className="px-4 py-3 text-center">
                                                    {entry.played}
                                                  </td>
                                                  <td className="px-4 py-3 text-center text-emerald-400">
                                                    {entry.won}
                                                  </td>
                                                  <td className="px-4 py-3 text-center text-red-400">
                                                    {entry.lost}
                                                  </td>
                                                  <td className="px-4 py-3 text-center font-bold text-blue-400">
                                                    {entry.points}
                                                  </td>
                                                  <td className="px-4 py-3 text-center">
                                                    {entry.nrr}
                                                  </td>
                                                </tr>
                                              )
                                            )}
                                          </tbody>
                                        </table>
                                        <div className="bg-slate-800 px-4 py-2 text-xs text-slate-400">
                                          Top 2 teams qualify for the Final
                                        </div>
                                      </div>
                                    );
                                  })()}
                                </div>
                              )}
                            </div>
                          );
                        }

                        // Otherwise show regular single table
                        return (
                          <div className="bg-slate-900 rounded-lg overflow-hidden">
                            <table className="w-full">
                              <thead className="bg-slate-700">
                                <tr>
                                  <th className="px-4 py-3 text-left">Pos</th>
                                  <th className="px-4 py-3 text-left">Team</th>
                                  <th className="px-4 py-3 text-center">P</th>
                                  <th className="px-4 py-3 text-center">W</th>
                                  <th className="px-4 py-3 text-center">L</th>
                                  <th className="px-4 py-3 text-center">Pts</th>
                                  <th className="px-4 py-3 text-center">NRR</th>
                                </tr>
                              </thead>
                              <tbody>
                                {calculatePointsTable(selectedTournament).map(
                                  (entry, idx) => (
                                    <tr
                                      key={entry.team._id}
                                      className="border-t border-slate-700 hover:bg-slate-800 transition-all"
                                    >
                                      <td className="px-4 py-3 font-bold">
                                        {idx + 1}
                                      </td>
                                      <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                          <div
                                            className="w-6 h-6 rounded-full"
                                            style={{
                                              backgroundColor: entry.team.color,
                                            }}
                                          />
                                          <span className="font-medium">
                                            {entry.team.name}
                                          </span>
                                        </div>
                                      </td>
                                      <td className="px-4 py-3 text-center">
                                        {entry.played}
                                      </td>
                                      <td className="px-4 py-3 text-center text-emerald-400">
                                        {entry.won}
                                      </td>
                                      <td className="px-4 py-3 text-center text-red-400">
                                        {entry.lost}
                                      </td>
                                      <td className="px-4 py-3 text-center font-bold text-blue-400">
                                        {entry.points}
                                      </td>
                                      <td className="px-4 py-3 text-center">
                                        {entry.nrr}
                                      </td>
                                    </tr>
                                  )
                                )}
                              </tbody>
                            </table>
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  {currentTab === "matches" && (
                    <div>
                      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Activity className="text-blue-500" /> All Matches
                      </h3>
                      <div className="space-y-4">
                        {Object.entries(
                          selectedTournament.matches.reduce((acc, match) => {
                            if (!acc[match.stage]) acc[match.stage] = [];
                            acc[match.stage].push(match);
                            return acc;
                          }, {})
                        ).map(([stage, matches]) => (
                          <div key={stage}>
                            <h4 className="text-lg font-bold mb-3 text-blue-400">
                              {stage}
                            </h4>
                            <div className="space-y-3">
                              {matches.map((match) => (
                                <div
                                  key={match._id}
                                  className="bg-slate-700 p-4 rounded-lg"
                                >
                                  {editingMatch === match._id &&
                                  adminCode === selectedTournament.adminCode ? (
                                    <MatchEditor
                                      match={match}
                                      tournament={selectedTournament}
                                      onSave={(winner, scores) => {
                                        updateMatchResult(
                                          selectedTournament._id,
                                          match._id,
                                          winner,
                                          scores
                                        );
                                        setAdminCode("");
                                      }}
                                      onCancel={() => setEditingMatch(null)}
                                    />
                                  ) : (
                                    <div>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                                        <div
                                          className={`flex items-center justify-between p-3 rounded ${
                                            match.winner ===
                                            (match.team1
                                              ? match.team1._id
                                              : null)
                                              ? "bg-emerald-600/20 border-2 border-emerald-600"
                                              : "bg-slate-800"
                                          }`}
                                        >
                                          <div className="flex items-center gap-2">
                                            {match.team1 && (
                                              <div
                                                className="w-8 h-8 rounded-full"
                                                style={{
                                                  backgroundColor:
                                                    match.team1.color,
                                                }}
                                              />
                                            )}
                                            <span className="font-medium">
                                              {match.team1
                                                ? match.team1.name
                                                : "TBD"}
                                            </span>
                                          </div>
                                          {match.winner && (
                                            <span className="font-bold">
                                              {match.team1Score.runs} (
                                              {match.team1Score.overs} over)
                                            </span>
                                          )}
                                        </div>
                                        <div
                                          className={`flex items-center justify-between p-3 rounded ${
                                            match.winner ===
                                            (match.team2
                                              ? match.team2._id
                                              : null)
                                              ? "bg-emerald-600/20 border-2 border-emerald-600"
                                              : "bg-slate-800"
                                          }`}
                                        >
                                          <div className="flex items-center gap-2">
                                            {match.team2 && (
                                              <div
                                                className="w-8 h-8 rounded-full"
                                                style={{
                                                  backgroundColor:
                                                    match.team2.color,
                                                }}
                                              />
                                            )}
                                            <span className="font-medium">
                                              {match.team2
                                                ? match.team2.name
                                                : "TBD"}
                                            </span>
                                          </div>
                                          {match.winner && (
                                            <span className="font-bold">
                                              {match.team2Score.runs} (
                                              {match.team2Score.overs} over)
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                      {match.winner && (
                                        <div className="text-sm text-emerald-400 mb-2">
                                          Winner:{" "}
                                          {match.team1 &&
                                          match.winner === match.team1._id
                                            ? match.team1.name
                                            : match.team2
                                            ? match.team2.name
                                            : "TBD"}
                                        </div>
                                      )}

                                      {adminCode ===
                                        selectedTournament.adminCode && (
                                        <div className="space-y-2">
                                          {match.team1 && match.team2 ? (
                                            <button
                                              onClick={() =>
                                                setEditingMatch(match._id)
                                              }
                                              className="w-full bg-blue-600 px-4 py-2 rounded hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                                            >
                                              <Edit2 size={16} />{" "}
                                              {match.winner
                                                ? "Edit Result"
                                                : "Add Result"}
                                            </button>
                                          ) : (
                                            <div className="w-full bg-slate-600 px-4 py-2 rounded text-center text-sm text-slate-300">
                                              Waiting for previous matches to
                                              complete
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {currentTab === "stats" && (
                    <div>
                      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <BarChart3 className="text-purple-500" /> Statistics
                      </h3>
                      {(() => {
                        const stats = calculateStats(selectedTournament);
                        return (
                          <div className="space-y-6">
                            <div>
                              <h4 className="text-lg font-bold mb-3 text-blue-400">
                                Top Scorers
                              </h4>
                              <div className="bg-slate-900 rounded-lg overflow-hidden">
                                <table className="w-full">
                                  <thead className="bg-slate-700">
                                    <tr>
                                      <th className="px-4 py-3 text-left">
                                        Team
                                      </th>
                                      <th className="px-4 py-3 text-center">
                                        Runs
                                      </th>
                                      <th className="px-4 py-3 text-center">
                                        Matches
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {stats.topScorers.map((scorer, idx) => (
                                      <tr
                                        key={scorer.team._id}
                                        className="border-t border-slate-700"
                                      >
                                        <td className="px-4 py-3">
                                          <div className="flex items-center gap-2">
                                            <div
                                              className="w-6 h-6 rounded-full"
                                              style={{
                                                backgroundColor:
                                                  scorer.team.color,
                                              }}
                                            />
                                            <span>{scorer.team.name}</span>
                                          </div>
                                        </td>
                                        <td className="px-4 py-3 text-center font-bold text-emerald-400">
                                          {scorer.runs}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                          {scorer.matches}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>

                            <div>
                              <h4 className="text-lg font-bold mb-3 text-blue-400">
                                Most Economical
                              </h4>
                              <div className="bg-slate-900 rounded-lg overflow-hidden">
                                <table className="w-full">
                                  <thead className="bg-slate-700">
                                    <tr>
                                      <th className="px-4 py-3 text-left">
                                        Team
                                      </th>
                                      <th className="px-4 py-3 text-center">
                                        Economy
                                      </th>
                                      <th className="px-4 py-3 text-center">
                                        Overs
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {stats.mostEconomical.map((bowler) => (
                                      <tr
                                        key={bowler.team._id}
                                        className="border-t border-slate-700"
                                      >
                                        <td className="px-4 py-3">
                                          <div className="flex items-center gap-2">
                                            <div
                                              className="w-6 h-6 rounded-full"
                                              style={{
                                                backgroundColor:
                                                  bowler.team.color,
                                              }}
                                            />
                                            <span>{bowler.team.name}</span>
                                          </div>
                                        </td>
                                        <td className="px-4 py-3 text-center font-bold text-blue-400">
                                          {bowler.economy}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                          {bowler.oversBowled}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>

                            <div>
                              <h4 className="text-lg font-bold mb-3 text-blue-400">
                                Highest Scores
                              </h4>
                              <div className="space-y-2">
                                {stats.highestScores.map((scoreData, idx) => {
                                  const team1Score =
                                    scoreData.match.team1Score?.runs || 0;
                                  const team2Score =
                                    scoreData.match.team2Score?.runs || 0;
                                  const highestScoringTeam =
                                    team1Score > team2Score
                                      ? scoreData.match.team1
                                      : scoreData.match.team2;
                                  const opposingTeam =
                                    team1Score > team2Score
                                      ? scoreData.match.team2
                                      : scoreData.match.team1;
                                  const highestScore = Math.max(
                                    team1Score,
                                    team2Score
                                  );
                                  const scoringTeamOvers =
                                    team1Score > team2Score
                                      ? scoreData.match.team1Score?.overs
                                      : scoreData.match.team2Score?.overs;

                                  return (
                                    <div
                                      key={idx}
                                      className="bg-slate-900 p-4 rounded-lg"
                                    >
                                      <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-3">
                                          <div className="text-2xl font-bold text-emerald-400">
                                            {highestScore}/{scoringTeamOvers}
                                          </div>
                                          <div>
                                            <div className="flex items-center gap-2">
                                              {highestScoringTeam && (
                                                <div
                                                  className="w-5 h-5 rounded-full"
                                                  style={{
                                                    backgroundColor:
                                                      highestScoringTeam.color,
                                                  }}
                                                />
                                              )}
                                              <span className="font-medium text-white">
                                                {highestScoringTeam?.name}
                                              </span>
                                            </div>
                                            <div className="text-xs text-slate-500 mt-1">
                                              vs {opposingTeam?.name}
                                            </div>
                                          </div>
                                        </div>
                                        <div className="text-sm text-slate-500">
                                          {scoreData.match.stage}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {showAdminCodeModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-xl p-6 max-w-md w-full">
            <h3 className="text-2xl font-bold mb-4 text-emerald-400">
              Tournament Created!
            </h3>
            <p className="text-slate-300 mb-4">
              Save this admin code to manage your tournament:
            </p>
            <div className="bg-slate-900 p-4 rounded-lg mb-4">
              <div className="text-3xl font-bold text-center text-blue-400 tracking-wider">
                {newAdminCode}
              </div>
            </div>
            <p className="text-sm text-slate-400 mb-4">
              You'll need this code to edit match results and manage the
              tournament. Keep it safe!
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(newAdminCode);
                  alert("Admin code copied to clipboard!");
                }}
                className="flex-1 bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700 transition-all"
              >
                Copy Code
              </button>
              <button
                onClick={() => setShowAdminCodeModal(false)}
                className="px-4 py-2 bg-slate-700 rounded-lg hover:bg-slate-600 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="bg-slate-800 border-t-2 border-red-600 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-slate-400">
            <p className="mb-2">
              © 2025 SAGED CHAMPIONS LEAGUE - The Ultimate Cricket Tournament
              Platform
            </p>
            <p className="text-sm">
              Powered by passion for cricket | Real-time scoring | Advanced
              analytics
            </p>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
        .animate-slide-up {
          animation: slide-up 0.5s ease-out;
        }
        input[type="number"]::-webkit-inner-spin-button,
        input[type="number"]::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
      `}</style>
    </div>
  );
};

export default SagedianCricketLeague;
