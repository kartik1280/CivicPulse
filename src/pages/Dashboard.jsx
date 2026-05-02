// src/pages/Dashboard.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, Legend
} from 'recharts';
import Navbar from '../components/Navbar';

const TAG_COLORS = {
  Water:       '#3b82f6',
  Road:        '#f59e0b',
  Electricity: '#eab308',
  Safety:      '#ef4444',
  Other:       '#6b7280',
};

const StatCard = ({ icon, label, value, gradient, loading }) => (
  <div className={`card p-6 bg-gradient-to-br ${gradient} border-0 animate-fade-in`}>
    <div className="flex items-center justify-between mb-3">
      <span className="text-3xl">{icon}</span>
      {loading && <div className="skeleton w-10 h-5 rounded" />}
    </div>
    <div className="text-3xl font-bold text-white mb-1">
      {loading ? '—' : value}
    </div>
    <div className="text-white/70 text-sm font-medium">{label}</div>
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="card px-3 py-2 text-sm shadow-xl border-0">
        <p className="font-semibold text-surface-700 dark:text-surface-300">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.fill || p.stroke }}>
            {p.name}: <strong>{p.value}</strong>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

function Dashboard() {
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    axios.get('/api/stats')
      .then(({ data }) => setStats(data))
      .catch(() => setError('Failed to load dashboard data.'))
      .finally(() => setLoading(false));
  }, []);

  const tagData    = stats ? Object.entries(stats.tagCounts).map(([name, count]) => ({ name, count })) : [];
  const dailyData  = stats?.dailyMessages?.map((d) => ({ date: d.date.slice(5), count: d.count })) || [];
  const roomData   = stats?.roomActivity || [];

  const statCards = [
    { icon: '💬', label: 'Total Messages',  value: stats?.totalMessages ?? 0, gradient: 'from-primary-500 to-primary-700' },
    { icon: '🏙️', label: 'Active Rooms',    value: stats?.activeRooms ?? 0,   gradient: 'from-accent-500 to-accent-700' },
    { icon: '🏷️', label: 'Issue Categories',value: stats?.issueTypes ?? 0,    gradient: 'from-purple-500 to-purple-700' },
    { icon: '👥', label: 'Unique Users',     value: stats?.uniqueUsers ?? 0,   gradient: 'from-orange-500 to-orange-700' },
  ];

  return (
    <div className="page-wrapper">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 animate-slide-up">
          <h1 className="text-3xl font-bold text-surface-900 dark:text-surface-100">
            Community <span className="gradient-text">Dashboard</span>
          </h1>
          <p className="text-surface-500 dark:text-surface-400 mt-1">Real-time civic issue analytics across all rooms</p>
        </div>

        {error && (
          <div className="mb-6 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((card) => (
            <StatCard key={card.label} {...card} loading={loading} />
          ))}
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Issue Tags Bar Chart */}
          <div className="card p-6 animate-fade-in">
            <h2 className="text-lg font-semibold text-surface-800 dark:text-surface-200 mb-1">Issues by Category</h2>
            <p className="text-sm text-surface-500 dark:text-surface-400 mb-5">Total reports per issue type</p>
            {loading ? (
              <div className="space-y-3">
                {[1,2,3,4].map(i => <div key={i} className="skeleton h-6 rounded" style={{ width: `${60+i*10}%` }} />)}
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={tagData} barCategoryGap="30%">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.15)" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#64748b' }} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" name="Reports" radius={[6,6,0,0]}>
                    {tagData.map((entry) => (
                      <Cell key={entry.name} fill={TAG_COLORS[entry.name] || '#6366f1'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Daily Messages Line Chart */}
          <div className="card p-6 animate-fade-in">
            <h2 className="text-lg font-semibold text-surface-800 dark:text-surface-200 mb-1">Daily Activity</h2>
            <p className="text-sm text-surface-500 dark:text-surface-400 mb-5">Messages posted in the last 7 days</p>
            {loading ? (
              <div className="skeleton h-[200px] rounded-xl" />
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.15)" />
                  <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#64748b' }} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="count"
                    name="Messages"
                    stroke="#6366f1"
                    strokeWidth={2.5}
                    dot={{ fill: '#6366f1', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Room Activity Horizontal Bar */}
        <div className="card p-6 animate-fade-in">
          <h2 className="text-lg font-semibold text-surface-800 dark:text-surface-200 mb-1">Room Activity</h2>
          <p className="text-sm text-surface-500 dark:text-surface-400 mb-5">Message volume by city room</p>
          {loading ? (
            <div className="skeleton h-[180px] rounded-xl" />
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={roomData} layout="vertical" barCategoryGap="25%">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.15)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 12, fill: '#64748b' }} allowDecimals={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} width={80} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Messages" fill="#14b8a6" radius={[0,6,6,0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
