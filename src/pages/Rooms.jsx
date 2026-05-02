// src/pages/Rooms.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import Navbar from '../components/Navbar';

const TAG_CLASSES = {
  Water:       'tag-water',
  Road:        'tag-road',
  Electricity: 'tag-electricity',
  Safety:      'tag-safety',
  Other:       'tag-other',
};

const CITY_EMOJIS = {
  delhi:     '🏛️',
  mumbai:    '🌊',
  bangalore: '🌿',
  chennai:   '🌴',
};

const CITY_GRADIENTS = {
  delhi:     'from-orange-500/10 to-red-500/10 dark:from-orange-900/20 dark:to-red-900/20',
  mumbai:    'from-blue-500/10 to-cyan-500/10 dark:from-blue-900/20 dark:to-cyan-900/20',
  bangalore: 'from-green-500/10 to-teal-500/10 dark:from-green-900/20 dark:to-teal-900/20',
  chennai:   'from-yellow-500/10 to-orange-500/10 dark:from-yellow-900/20 dark:to-orange-900/20',
};

function RoomSkeleton() {
  return (
    <div className="card p-6 space-y-4">
      <div className="skeleton h-8 w-8 rounded-full" />
      <div className="skeleton h-6 w-2/3 rounded" />
      <div className="skeleton h-4 w-1/2 rounded" />
      <div className="flex gap-2">
        <div className="skeleton h-5 w-16 rounded-full" />
        <div className="skeleton h-5 w-16 rounded-full" />
      </div>
    </div>
  );
}

function Rooms() {
  const navigate      = useNavigate();
  const [rooms,   setRooms]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    api.get('/api/rooms')
      .then(({ data }) => setRooms(data))
      .catch(() => setError('Failed to load rooms. Is the backend running?'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-wrapper">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 animate-slide-up">
          <h1 className="text-3xl font-bold text-surface-900 dark:text-surface-100">
            Community <span className="gradient-text">Rooms</span>
          </h1>
          <p className="text-surface-500 dark:text-surface-400 mt-1">
            Join a city room to report and discuss civic issues
          </p>
        </div>

        {error && (
          <div className="mb-6 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 animate-fade-in">
            ⚠️ {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {loading
            ? [1, 2, 3, 4].map((i) => <RoomSkeleton key={i} />)
            : rooms.map((room) => {
                const tags = Object.entries(room.tagBreakdown || {})
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 3);
                const emoji    = CITY_EMOJIS[room.id] || '🏙️';
                const gradient = CITY_GRADIENTS[room.id] || '';

                return (
                  <button
                    key={room.id}
                    id={`room-${room.id}`}
                    onClick={() => navigate(`/rooms/${room.id}`)}
                    className={`card-hover p-6 text-left group bg-gradient-to-br ${gradient} animate-fade-in`}
                  >
                    {/* City emoji */}
                    <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-200">
                      {emoji}
                    </div>

                    {/* Room name */}
                    <h2 className="text-xl font-bold text-surface-900 dark:text-surface-100 mb-1">
                      {room.name}
                    </h2>
                    <p className="text-surface-500 dark:text-surface-400 text-sm mb-4">
                      {room.messageCount} message{room.messageCount !== 1 ? 's' : ''} · {room.city}
                    </p>

                    {/* Issue tag badges */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {tags.length > 0
                        ? tags.map(([tag, count]) => (
                            <span key={tag} className={TAG_CLASSES[tag] || 'tag-other'}>
                              {tag} · {count}
                            </span>
                          ))
                        : <span className="tag-other">No issues yet</span>
                      }
                    </div>

                    {/* Enter CTA */}
                    <div className="flex items-center gap-1.5 text-primary-600 dark:text-primary-400 text-sm font-medium group-hover:gap-3 transition-all duration-200">
                      <span>Enter room</span>
                      <span>→</span>
                    </div>
                  </button>
                );
              })
          }
        </div>
      </main>
    </div>
  );
}

export default Rooms;
