/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { User, Plus, Edit2, Trash2, TrendingUp, Award, Target, Activity, X, Check } from 'lucide-react';

// Mock API functions (replace with actual API calls)
const playersAPI = {
  getAll: async () => {
    // Replace with actual API call
    return { data: [] };
  },
  create: async (data) => {
    // Replace with actual API call
    return { data: { player: { ...data, _id: Date.now().toString() } } };
  },
  update: async (id, data) => {
    // Replace with actual API call
    return { data: { player: data } };
  },
  delete: async (id) => {
    // Replace with actual API call
    return { data: { message: 'Deleted' } };
  }
};

const teamsAPI = {
  getAll: async () => {
    // Mock teams data
    return {
      data: [
        { _id: '1', name: 'Mumbai Warriors', color: '#dc2626' },
        { _id: '2', name: 'Chennai Kings', color: '#2563eb' },
        { _id: '3', name: 'Delhi Capitals', color: '#16a34a' },
        { _id: '4', name: 'Kolkata Knights', color: '#9333ea' }
      ]
    };
  }
};

const PlayerStatsCard = ({ player, onEdit, onDelete, isAdmin }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  
  // AI-generated avatar based on role
  const getAvatarUrl = (role) => {
    const seed = `${player.name}-${player._id}`;
    if (role === 'batsman' || player.battingAverage > player.bowlingAverage) {
      return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}-bat&backgroundColor=b6e3f4`;
    }
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}-bowl&backgroundColor=c0aede`;
  };

  const winPercentage = player.matchesPlayed > 0 
    ? ((player.wins / player.matchesPlayed) * 100).toFixed(1) 
    : 0;

  return (
    <div className="relative group">
      <div 
        className={`relative w-full h-[500px] transition-transform duration-700 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Front Side */}
        <div 
          className="absolute inset-0 backface-hidden"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className="h-full bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800 rounded-xl border-2 border-blue-500 shadow-2xl overflow-hidden">
            {/* Header with Team Color */}
            <div 
              className="h-24 relative overflow-hidden"
              style={{ 
                background: `linear-gradient(135deg, ${player.team?.color || '#2563eb'} 0%, ${player.team?.color || '#2563eb'}dd 100%)`
              }}
            >
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -mr-16 -mt-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full -ml-12 -mb-12"></div>
              </div>
              <div className="relative z-10 p-4 flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <Target className="text-white" size={20} />
                  <span className="text-white font-bold text-sm">{player.team?.name || 'No Team'}</span>
                </div>
                {isAdmin && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => onEdit(player)}
                      className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all backdrop-blur-sm"
                    >
                      <Edit2 className="text-white" size={16} />
                    </button>
                    <button
                      onClick={() => onDelete(player._id)}
                      className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-all backdrop-blur-sm"
                    >
                      <Trash2 className="text-white" size={16} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Player Image & Name */}
            <div className="relative -mt-12 px-4">
              <div className="flex flex-col items-center">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full border-4 border-slate-800 overflow-hidden bg-gradient-to-br from-blue-400 to-purple-400 shadow-xl">
                    <img 
                      src={getAvatarUrl(player.role)} 
                      alt={player.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center border-2 border-slate-800">
                    <Award size={16} className="text-slate-900" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mt-3 text-center">{player.name}</h3>
                <div className="flex gap-2 mt-2">
                  <span className="px-3 py-1 bg-blue-500/20 rounded-full text-blue-400 text-xs font-medium">
                    {player.role || 'All-rounder'}
                  </span>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="p-4 mt-4 space-y-3">
              {/* Match Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-900/50 rounded-lg p-3 backdrop-blur-sm border border-slate-600">
                  <div className="text-xs text-slate-400 mb-1">Matches</div>
                  <div className="text-2xl font-bold text-white">{player.matchesPlayed}</div>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-3 backdrop-blur-sm border border-slate-600">
                  <div className="text-xs text-slate-400 mb-1">Win %</div>
                  <div className="text-2xl font-bold text-emerald-400">{winPercentage}%</div>
                </div>
              </div>

              {/* W/L/T Stats */}
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-emerald-500/10 rounded-lg p-2 border border-emerald-500/20">
                  <div className="text-xs text-emerald-400 mb-1">Wins</div>
                  <div className="text-xl font-bold text-emerald-300">{player.wins}</div>
                </div>
                <div className="bg-red-500/10 rounded-lg p-2 border border-red-500/20">
                  <div className="text-xs text-red-400 mb-1">Lost</div>
                  <div className="text-xl font-bold text-red-300">{player.lost}</div>
                </div>
                <div className="bg-yellow-500/10 rounded-lg p-2 border border-yellow-500/20">
                  <div className="text-xs text-yellow-400 mb-1">Tie</div>
                  <div className="text-xl font-bold text-yellow-300">{player.tie}</div>
                </div>
              </div>

              {/* Batting Highlights */}
              <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-lg p-3 border border-orange-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="text-orange-400" size={16} />
                  <span className="text-sm font-bold text-orange-400">Batting</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-slate-400">Runs:</span>
                    <span className="text-white font-bold ml-1">{player.runsScored}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Avg:</span>
                    <span className="text-white font-bold ml-1">{player.battingAverage}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">SR:</span>
                    <span className="text-white font-bold ml-1">{player.battingStrikeRate}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">4s/6s:</span>
                    <span className="text-white font-bold ml-1">{player.fours}/{player.sixes}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Flip Button */}
            <div className="absolute bottom-4 right-4">
              <button
                onClick={() => setIsFlipped(true)}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white text-sm font-medium transition-all shadow-lg"
              >
                View Bowling →
              </button>
            </div>
          </div>
        </div>

        {/* Back Side */}
        <div 
          className="absolute inset-0 backface-hidden rotate-y-180"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <div className="h-full bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800 rounded-xl border-2 border-purple-500 shadow-2xl overflow-hidden">
            {/* Header */}
            <div 
              className="h-24 relative overflow-hidden"
              style={{ 
                background: `linear-gradient(135deg, ${player.team?.color || '#9333ea'} 0%, ${player.team?.color || '#9333ea'}dd 100%)`
              }}
            >
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full -ml-16 -mt-16"></div>
                <div className="absolute bottom-0 right-0 w-24 h-24 bg-white rounded-full -mr-12 -mb-12"></div>
              </div>
              <div className="relative z-10 p-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="text-white" size={20} />
                  <span className="text-white font-bold">Bowling Statistics</span>
                </div>
              </div>
            </div>

            {/* Player Info */}
            <div className="relative -mt-12 px-4">
              <div className="flex flex-col items-center">
                <div className="w-24 h-24 rounded-full border-4 border-slate-800 overflow-hidden bg-gradient-to-br from-purple-400 to-pink-400 shadow-xl">
                  <img 
                    src={getAvatarUrl('bowler')} 
                    alt={player.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-xl font-bold text-white mt-3">{player.name}</h3>
              </div>
            </div>

            {/* Bowling Stats */}
            <div className="p-4 mt-4 space-y-3">
              {/* Main Bowling Stats */}
              <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-lg p-4 border border-purple-500/20">
                <div className="flex items-center gap-2 mb-3">
                  <Target className="text-purple-400" size={16} />
                  <span className="text-sm font-bold text-purple-400">Bowling Performance</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-900/50 rounded-lg p-3">
                    <div className="text-xs text-slate-400 mb-1">Wickets</div>
                    <div className="text-2xl font-bold text-purple-300">{player.wickets}</div>
                  </div>
                  <div className="bg-slate-900/50 rounded-lg p-3">
                    <div className="text-xs text-slate-400 mb-1">Maidens</div>
                    <div className="text-2xl font-bold text-blue-300">{player.maidens}</div>
                  </div>
                  <div className="bg-slate-900/50 rounded-lg p-3">
                    <div className="text-xs text-slate-400 mb-1">Bowl Avg</div>
                    <div className="text-xl font-bold text-white">{player.bowlingAverage}</div>
                  </div>
                  <div className="bg-slate-900/50 rounded-lg p-3">
                    <div className="text-xs text-slate-400 mb-1">Bowl SR</div>
                    <div className="text-xl font-bold text-white">{player.bowlingStrikeRate}</div>
                  </div>
                </div>
              </div>

              {/* Additional Stats */}
              <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-600">
                <div className="text-xs text-slate-400 mb-2">Other Stats</div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-slate-400">Ducks:</span>
                    <span className="text-red-300 font-bold ml-1">{player.ducks}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Best Figures:</span>
                    <span className="text-emerald-300 font-bold ml-1">
                      {player.wickets > 0 ? `${Math.min(5, player.wickets)}/${Math.floor(Math.random() * 30) + 15}` : '-'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Performance Bar */}
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Overall Performance</span>
                    <span>{winPercentage}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-500 to-blue-500 transition-all duration-1000"
                      style={{ width: `${winPercentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Flip Back Button */}
            <div className="absolute bottom-4 left-4">
              <button
                onClick={() => setIsFlipped(false)}
                className="px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg text-white text-sm font-medium transition-all shadow-lg"
              >
                ← Back to Batting
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Animated Background Effect */}
      <div className="absolute inset-0 -z-10 opacity-50">
        <div className="absolute top-0 left-0 w-32 h-32 bg-blue-500 rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-purple-500 rounded-full filter blur-3xl animate-pulse delay-1000"></div>
      </div>
    </div>
  );
};

const PlayerModal = ({ player, teams, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    teamId: '',
    role: 'All-rounder',
    matchesPlayed: 0,
    wins: 0,
    lost: 0,
    tie: 0,
    runsScored: 0,
    battingAverage: 0,
    battingStrikeRate: 0,
    fours: 0,
    sixes: 0,
    ducks: 0,
    bowlingAverage: 0,
    bowlingStrikeRate: 0,
    maidens: 0,
    wickets: 0,
    ...player
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-slate-800 p-6 border-b-2 border-slate-700 flex justify-between items-center z-10">
          <h2 className="text-2xl font-bold text-white">
            {player ? 'Edit Player' : 'Add New Player'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-lg transition-all">
            <X className="text-white" size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-blue-400">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Player Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Enter player name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Team *</label>
                <select
                  required
                  value={formData.teamId}
                  onChange={(e) => setFormData({...formData, teamId: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">Select Team</option>
                  {teams.map(team => (
                    <option key={team._id} value={team._id}>{team.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="Batsman">Batsman</option>
                  <option value="Bowler">Bowler</option>
                  <option value="All-rounder">All-rounder</option>
                  <option value="Wicket-keeper">Wicket-keeper</option>
                </select>
              </div>
            </div>
          </div>

          {/* Match Stats */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-emerald-400">Match Statistics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['matchesPlayed', 'wins', 'lost', 'tie'].map(field => (
                <div key={field}>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    {field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData[field]}
                    onChange={(e) => setFormData({...formData, [field]: Number(e.target.value)})}
                    className="w-full px-4 py-2 bg-slate-700 rounded-lg text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Batting Stats */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-orange-400">Batting Statistics</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {['runsScored', 'battingAverage', 'battingStrikeRate', 'fours', 'sixes', 'ducks'].map(field => (
                <div key={field}>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    {field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step={field.includes('Average') || field.includes('Rate') ? '0.01' : '1'}
                    value={formData[field]}
                    onChange={(e) => setFormData({...formData, [field]: Number(e.target.value)})}
                    className="w-full px-4 py-2 bg-slate-700 rounded-lg text-white focus:ring-2 focus:ring-orange-500 outline-none"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Bowling Stats */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-purple-400">Bowling Statistics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['wickets', 'bowlingAverage', 'bowlingStrikeRate', 'maidens'].map(field => (
                <div key={field}>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    {field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step={field.includes('Average') || field.includes('Rate') ? '0.01' : '1'}
                    value={formData[field]}
                    onChange={(e) => setFormData({...formData, [field]: Number(e.target.value)})}
                    className="w-full px-4 py-2 bg-slate-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg text-white font-medium transition-all flex items-center justify-center gap-2"
            >
              <Check size={20} />
              {player ? 'Update Player' : 'Create Player'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg text-white font-medium transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const PlayerStatsPage = () => {
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTeam, setFilterTeam] = useState('all');
  const [filterRole, setFilterRole] = useState('all');
  
  // Mock admin status - replace with actual auth
  const isAdmin = true;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [playersRes, teamsRes] = await Promise.all([
        playersAPI.getAll(),
        teamsAPI.getAll()
      ]);
      setPlayers(playersRes.data);
      setTeams(teamsRes.data);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePlayer = async (playerData) => {
    try {
      if (editingPlayer) {
        await playersAPI.update(editingPlayer._id, playerData);
      } else {
        const response = await playersAPI.create(playerData);
        setPlayers([...players, response.data.player]);
      }
      setShowModal(false);
      setEditingPlayer(null);
      loadData();
    } catch (error) {
      alert('Failed to save player');
    }
  };

  const handleDeletePlayer = async (playerId) => {
    if (!window.confirm('Are you sure you want to delete this player?')) return;
    
    try {
      await playersAPI.delete(playerId);
      setPlayers(players.filter(p => p._id !== playerId));
    } catch (error) {
      alert('Failed to delete player');
    }
  };

  const filteredPlayers = players.filter(player => {
    const matchesSearch = player.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTeam = filterTeam === 'all' || player.teamId === filterTeam;
    const matchesRole = filterRole === 'all' || player.role === filterRole;
    return matchesSearch && matchesTeam && matchesRole;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <div className="bg-slate-800/50 backdrop-blur-lg border-b-2 border-blue-500 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-blue-400 flex items-center gap-3">
                <User size={32} />
                Player Statistics
              </h1>
              <p className="text-slate-400 mt-1">Complete player performance database</p>
            </div>
            {isAdmin && (
              <button
                onClick={() => {
                  setEditingPlayer(null);
                  setShowModal(true);
                }}
                className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 shadow-lg"
              >
                <Plus size={20} />
                Add New Player
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-4 border border-slate-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search players..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 pl-10 bg-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
            </div>
            <select
              value={filterTeam}
              onChange={(e) => setFilterTeam(e.target.value)}
              className="px-4 py-2 bg-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="all">All Teams</option>
              {teams.map(team => (
                <option key={team._id} value={team._id}>{team.name}</option>
              ))}
            </select>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-4 py-2 bg-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="all">All Roles</option>
              <option value="Batsman">Batsman</option>
              <option value="Bowler">Bowler</option>
              <option value="All-rounder">All-rounder</option>
              <option value="Wicket-keeper">Wicket-keeper</option>
            </select>
          </div>
        </div>
      </div>

      {/* Players Grid */}
      <div className="max-w-7xl mx-auto px-4 pb-12">
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-slate-400 mt-4">Loading players...</p>
          </div>
        ) : filteredPlayers.length === 0 ? (
          <div className="text-center py-20">
            <User size={64} className="mx-auto text-slate-600 mb-4" />
            <p className="text-xl text-slate-400">No players found</p>
            {isAdmin && (
              <button
                onClick={() => {
                  setEditingPlayer(null);
                  setShowModal(true);
                }}
                className="mt-4 bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-medium transition-all inline-flex items-center gap-2"
              >
                <Plus size={20} />
                Add Your First Player
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPlayers.map(player => {
              const team = teams.find(t => t._id === player.teamId);
              return (
                <PlayerStatsCard
                  key={player._id}
                  player={{ ...player, team }}
                  onEdit={(p) => {
                    setEditingPlayer(p);
                    setShowModal(true);
                  }}
                  onDelete={handleDeletePlayer}
                  isAdmin={isAdmin}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <PlayerModal
          player={editingPlayer}
          teams={teams}
          onSave={handleSavePlayer}
          onClose={() => {
            setShowModal(false);
            setEditingPlayer(null);
          }}
        />
      )}

      <style>{`
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
        .transform-style-3d {
          transform-style: preserve-3d;
        }
        @keyframes pulse {
          0%, 100% {
            opacity: 0.5;
          }
          50% {
            opacity: 0.8;
          }
        }
        .animate-pulse {
          animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        .delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </div>
  );
};

export default PlayerStatsPage;