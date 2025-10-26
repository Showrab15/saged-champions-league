/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import { 
  User, Trophy, TrendingUp, Target, Zap, Award,
  Edit2, Trash2, Plus, X, Save, BarChart3
} from 'lucide-react';

// Simulated API - Replace with actual API calls
const playersAPI = {
  getAll: async () => {
    // Replace with actual API call
    return { data: [] };
  },
  create: async (player) => {
    console.log('Creating player:', player);
    return { data: { ...player, _id: Date.now().toString() } };
  },
  update: async (id, player) => {
    console.log('Updating player:', id, player);
    return { data: player };
  },
  delete: async (id) => {
    console.log('Deleting player:', id);
    return { data: { success: true } };
  }
};

const PlayerStatsPage = ({ currentUser, adminCode, teams }) => {
  const [players, setPlayers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTeam, setFilterTeam] = useState('all');

  // AI-generated player images (placeholder URLs - replace with actual AI-generated images)
  const getPlayerImage = (playerId, role) => {
    const batsmanImages = [
      'https://api.dicebear.com/7.x/avataaars/svg?seed=batman1&accessories=sunglasses&clothing=blazerShirt',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=batman2&accessories=prescription02&clothing=hoodie',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=batman3&accessories=wayfarers&clothing=blazerSweater'
    ];
    const bowlerImages = [
      'https://api.dicebear.com/7.x/avataaars/svg?seed=bowler1&accessories=round&clothing=overall',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=bowler2&accessories=sunglasses&clothing=shirtVNeck',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=bowler3&accessories=prescription01&clothing=collarSweater'
    ];
    
    const images = role === 'Batsman' ? batsmanImages : bowlerImages;
    return images[Math.abs(playerId.split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % images.length];
  };

  const [formData, setFormData] = useState({
    name: '',
    teamName: '',
    teamId: '',
    role: 'All-Rounder',
    matchesPlayed: 0,
    wins: 0,
    losses: 0,
    ties: 0,
    runsScored: 0,
    battingAverage: 0,
    battingStrikeRate: 0,
    fours: 0,
    sixes: 0,
    ducks: 0,
    bowlingAverage: 0,
    bowlingStrikeRate: 0,
    maidens: 0,
    wickets: 0
  });

  useEffect(() => {
    loadPlayers();
  }, []);

  const loadPlayers = async () => {
    try {
      setLoading(true);
      const response = await playersAPI.getAll();
      setPlayers(response.data);
    } catch (error) {
      console.error('Failed to load players:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateWinPercentage = (wins, matches) => {
    return matches > 0 ? ((wins / matches) * 100).toFixed(1) : '0.0';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
      alert('Please login to manage players');
      return;
    }

    try {
      const playerData = {
        ...formData,
        winPercentage: calculateWinPercentage(formData.wins, formData.matchesPlayed),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      if (editingPlayer) {
        await playersAPI.update(editingPlayer._id, playerData);
        setPlayers(players.map(p => p._id === editingPlayer._id ? { ...playerData, _id: p._id } : p));
      } else {
        const response = await playersAPI.create(playerData);
        setPlayers([...players, response.data]);
      }

      resetForm();
      setShowModal(false);
    } catch (error) {
      alert('Failed to save player');
    }
  };

  const handleEdit = (player) => {
    if (!currentUser) {
      alert('Please login to edit players');
      return;
    }
    setEditingPlayer(player);
    setFormData(player);
    setShowModal(true);
  };

  const handleDelete = async (playerId) => {
    if (!currentUser) {
      alert('Please login to delete players');
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this player?')) {
      try {
        await playersAPI.delete(playerId);
        setPlayers(players.filter(p => p._id !== playerId));
      } catch (error) {
        alert('Failed to delete player');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      teamName: '',
      teamId: '',
      role: 'All-Rounder',
      matchesPlayed: 0,
      wins: 0,
      losses: 0,
      ties: 0,
      runsScored: 0,
      battingAverage: 0,
      battingStrikeRate: 0,
      fours: 0,
      sixes: 0,
      ducks: 0,
      bowlingAverage: 0,
      bowlingStrikeRate: 0,
      maidens: 0,
      wickets: 0
    });
    setEditingPlayer(null);
  };

  const filteredPlayers = players.filter(player => {
    const matchesSearch = player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         player.teamName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTeam = filterTeam === 'all' || player.teamName === filterTeam;
    return matchesSearch && matchesTeam;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
              <Trophy className="text-yellow-500" size={40} />
              Player Statistics
            </h1>
            <p className="text-slate-300">Manage and track player performance</p>
          </div>
          
          {currentUser && (
            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-all transform hover:scale-105 shadow-lg"
            >
              <Plus size={20} />
              Add Player
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mt-6">
          <input
            type="text"
            placeholder="Search players or teams..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <select
            value={filterTeam}
            onChange={(e) => setFilterTeam(e.target.value)}
            className="px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="all">All Teams</option>
            {teams?.map(team => (
              <option key={team._id} value={team.name}>{team.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Player Cards Grid */}
      <div className="max-w-7xl mx-auto">
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-slate-400 mt-4">Loading players...</p>
          </div>
        ) : filteredPlayers.length === 0 ? (
          <div className="text-center py-20">
            <User size={64} className="mx-auto text-slate-600 mb-4" />
            <p className="text-slate-400 text-xl">No players found</p>
            <p className="text-slate-500 mt-2">Add your first player to get started!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlayers.map((player, index) => (
              <div
                key={player._id}
                className="group relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl overflow-hidden border border-slate-700 hover:border-blue-500 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Animated Background Pattern */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* Cricket Ball Animation */}
                <div className="absolute top-4 right-4 w-12 h-12 bg-red-600 rounded-full opacity-20 group-hover:opacity-40 transition-opacity animate-bounce"></div>

                {/* Admin Controls */}
                {currentUser && (
                  <div className="absolute top-4 left-4 flex gap-2 z-10">
                    <button
                      onClick={() => handleEdit(player)}
                      className="bg-blue-600 hover:bg-blue-700 p-2 rounded-lg transition-all shadow-lg"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(player._id)}
                      className="bg-red-600 hover:bg-red-700 p-2 rounded-lg transition-all shadow-lg"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}

                {/* Player Header */}
                <div className="relative p-6 text-center border-b border-slate-700">
                  <div className="w-24 h-24 mx-auto mb-4 relative">
                    <img
                      src={getPlayerImage(player._id, player.role)}
                      alt={player.name}
                      className="w-full h-full rounded-full border-4 border-blue-500 shadow-lg group-hover:border-yellow-500 transition-all"
                    />
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-600 to-purple-600 px-3 py-1 rounded-full text-xs font-bold">
                      {player.role}
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-1">{player.name}</h3>
                  <p className="text-blue-400 font-semibold">{player.teamName}</p>
                </div>

                {/* Stats Grid */}
                <div className="p-6 space-y-4">
                  {/* Match Stats */}
                  <div className="bg-slate-800/50 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-slate-400 mb-3 flex items-center gap-2">
                      <Trophy size={16} className="text-yellow-500" />
                      Match Statistics
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="text-xs text-slate-500">Matches</div>
                        <div className="text-xl font-bold text-white">{player.matchesPlayed}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">Win %</div>
                        <div className="text-xl font-bold text-emerald-400">{player.winPercentage}%</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">Wins</div>
                        <div className="text-lg font-bold text-emerald-400">{player.wins}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">Losses</div>
                        <div className="text-lg font-bold text-red-400">{player.losses}</div>
                      </div>
                    </div>
                  </div>

                  {/* Batting Stats */}
                  <div className="bg-gradient-to-br from-orange-900/20 to-red-900/20 rounded-lg p-4 border border-orange-800/30">
                    <h4 className="text-sm font-semibold text-orange-400 mb-3 flex items-center gap-2">
                      <Target size={16} />
                      Batting Stats
                    </h4>
                    <div className="grid grid-cols-3 gap-3 mb-3">
                      <div>
                        <div className="text-xs text-slate-400">Runs</div>
                        <div className="text-lg font-bold text-orange-400">{player.runsScored}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-400">Avg</div>
                        <div className="text-lg font-bold text-white">{player.battingAverage}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-400">SR</div>
                        <div className="text-lg font-bold text-white">{player.battingStrikeRate}</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-center">
                        <div className="text-xs text-slate-400">4s</div>
                        <div className="text-sm font-bold text-blue-400">{player.fours}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-slate-400">6s</div>
                        <div className="text-sm font-bold text-purple-400">{player.sixes}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-slate-400">Ducks</div>
                        <div className="text-sm font-bold text-red-400">{player.ducks}</div>
                      </div>
                    </div>
                  </div>

                  {/* Bowling Stats */}
                  <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 rounded-lg p-4 border border-blue-800/30">
                    <h4 className="text-sm font-semibold text-blue-400 mb-3 flex items-center gap-2">
                      <Zap size={16} />
                      Bowling Stats
                    </h4>
                    <div className="grid grid-cols-3 gap-3 mb-3">
                      <div>
                        <div className="text-xs text-slate-400">Wickets</div>
                        <div className="text-lg font-bold text-blue-400">{player.wickets}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-400">Avg</div>
                        <div className="text-lg font-bold text-white">{player.bowlingAverage}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-400">SR</div>
                        <div className="text-lg font-bold text-white">{player.bowlingStrikeRate}</div>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-slate-400">Maidens</div>
                      <div className="text-sm font-bold text-emerald-400">{player.maidens}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-slate-800 border-b border-slate-700 p-6 flex justify-between items-center z-10">
              <h2 className="text-2xl font-bold text-white">
                {editingPlayer ? 'Edit Player' : 'Add New Player'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Player Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Enter player name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Team *
                  </label>
                  <select
                    required
                    value={formData.teamId}
                    onChange={(e) => {
                      const team = teams?.find(t => t._id === e.target.value);
                      setFormData({
                        ...formData,
                        teamId: e.target.value,
                        teamName: team?.name || ''
                      });
                    }}
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="">Select team</option>
                    {teams?.map(team => (
                      <option key={team._id} value={team._id}>{team.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Role
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="Batsman">Batsman</option>
                    <option value="Bowler">Bowler</option>
                    <option value="All-Rounder">All-Rounder</option>
                    <option value="Wicket-Keeper">Wicket-Keeper</option>
                  </select>
                </div>
              </div>

              {/* Match Statistics */}
              <div className="bg-slate-900 rounded-lg p-4">
                <h3 className="text-lg font-bold text-white mb-4">Match Statistics</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs text-slate-400 mb-2">Matches</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.matchesPlayed}
                      onChange={(e) => setFormData({...formData, matchesPlayed: parseInt(e.target.value) || 0})}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-2">Wins</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.wins}
                      onChange={(e) => setFormData({...formData, wins: parseInt(e.target.value) || 0})}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-2">Losses</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.losses}
                      onChange={(e) => setFormData({...formData, losses: parseInt(e.target.value) || 0})}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-2">Ties</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.ties}
                      onChange={(e) => setFormData({...formData, ties: parseInt(e.target.value) || 0})}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Batting Statistics */}
              <div className="bg-orange-900/20 rounded-lg p-4 border border-orange-800/30">
                <h3 className="text-lg font-bold text-orange-400 mb-4">Batting Statistics</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs text-slate-400 mb-2">Runs</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.runsScored}
                      onChange={(e) => setFormData({...formData, runsScored: parseInt(e.target.value) || 0})}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-2">Average</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.battingAverage}
                      onChange={(e) => setFormData({...formData, battingAverage: parseFloat(e.target.value) || 0})}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-2">Strike Rate</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.battingStrikeRate}
                      onChange={(e) => setFormData({...formData, battingStrikeRate: parseFloat(e.target.value) || 0})}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-2">Fours</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.fours}
                      onChange={(e) => setFormData({...formData, fours: parseInt(e.target.value) || 0})}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-2">Sixes</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.sixes}
                      onChange={(e) => setFormData({...formData, sixes: parseInt(e.target.value) || 0})}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-2">Ducks</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.ducks}
                      onChange={(e) => setFormData({...formData, ducks: parseInt(e.target.value) || 0})}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Bowling Statistics */}
              <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-800/30">
                <h3 className="text-lg font-bold text-blue-400 mb-4">Bowling Statistics</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs text-slate-400 mb-2">Wickets</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.wickets}
                      onChange={(e) => setFormData({...formData, wickets: parseInt(e.target.value) || 0})}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-2">Average</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.bowlingAverage}
                      onChange={(e) => setFormData({...formData, bowlingAverage: parseFloat(e.target.value) || 0})}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-2">Strike Rate</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.bowlingStrikeRate}
                      onChange={(e) => setFormData({...formData, bowlingStrikeRate: parseFloat(e.target.value) || 0})}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-2">Maidens</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.maidens}
                      onChange={(e) => setFormData({...formData, maidens: parseInt(e.target.value) || 0})}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 px-6 py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all"
                >
                  <Save size={20} />
                  {editingPlayer ? 'Update Player' : 'Create Player'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg font-bold transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayerStatsPage;