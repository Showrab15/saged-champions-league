// server/utils/nrrCalculator.js

/**
 * Calculate Net Run Rate (NRR) for a team
 * NRR = (Total Runs Scored / Total Overs Faced) - (Total Runs Conceded / Total Overs Bowled)
 */

const calculateNRR = (teamStats) => {
  const { runsScored, oversPlayed, runsConceded, oversBowled } = teamStats;

  // Prevent division by zero
  if (oversPlayed === 0 || oversBowled === 0) {
    return 0;
  }

  const runRate = runsScored / oversPlayed;
  const concededRate = runsConceded / oversBowled;

  const nrr = runRate - concededRate;

  // Return rounded to 3 decimal places
  return Math.round(nrr * 1000) / 1000;
};

/**
 * Convert overs from decimal (e.g., 20.3) to actual overs (20.5 for 20 overs 3 balls)
 */
const convertOversToDecimal = (overs) => {
  const fullOvers = Math.floor(overs);
  const balls = Math.round((overs - fullOvers) * 10);

  // Each over has 6 balls
  return fullOvers + balls / 6;
};

/**
 * Update team standings after a match
 */
const updateStandingsAfterMatch = (standing, matchData, isTeam1) => {
  const teamScore = isTeam1 ? matchData.team1Score : matchData.team2Score;
  const opponentScore = isTeam1 ? matchData.team2Score : matchData.team1Score;

  // Update match statistics
  standing.played += 1;

  if (matchData.winner === standing.teamId) {
    standing.won += 1;
    standing.points += 2;
  } else if (matchData.winner === null) {
    standing.tied += 1;
    standing.points += 1;
  } else {
    standing.lost += 1;
  }

  // Update NRR data
  if (teamScore && teamScore.runs !== undefined) {
    standing.runsScored += teamScore.runs;
    standing.oversPlayed += convertOversToDecimal(teamScore.overs);
  }

  if (opponentScore && opponentScore.runs !== undefined) {
    standing.runsConceded += opponentScore.runs;
    standing.oversBowled += convertOversToDecimal(opponentScore.overs);
  }

  // Calculate new NRR
  standing.nrr = calculateNRR({
    runsScored: standing.runsScored,
    oversPlayed: standing.oversPlayed,
    runsConceded: standing.runsConceded,
    oversBowled: standing.oversBowled,
  });

  return standing;
};

/**
 * Calculate win percentage
 */
const calculateWinPercentage = (won, played) => {
  if (played === 0) return 0;
  return Math.round((won / played) * 100 * 100) / 100;
};

/**
 * Sort standings by points, then NRR, then wins
 */
const sortStandings = (standings) => {
  return standings.sort((a, b) => {
    // First by points
    if (b.points !== a.points) {
      return b.points - a.points;
    }
    // Then by NRR
    if (b.nrr !== a.nrr) {
      return b.nrr - a.nrr;
    }
    // Then by wins
    return b.won - a.won;
  });
};

module.exports = {
  calculateNRR,
  convertOversToDecimal,
  updateStandingsAfterMatch,
  calculateWinPercentage,
  sortStandings,
};
