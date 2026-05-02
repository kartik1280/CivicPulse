// src/components/MessageItem.jsx
import { useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import socket from '../lib/socket';

const TAG_CLASSES = {
  Water:       'tag-water',
  Road:        'tag-road',
  Electricity: 'tag-electricity',
  Safety:      'tag-safety',
  Other:       'tag-other',
};

function timeAgo(ts) {
  const diff = Date.now() - new Date(ts).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins  < 1)  return 'just now';
  if (mins  < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

const UpvoteIcon = ({ filled }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill={filled ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
  </svg>
);
const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-5m-1.414-9.414a2 2 0 1 1 2.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);
const DeleteIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0 1 16.138 21H7.862a2 2 0 0 1-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v3M4 7h16" />
  </svg>
);

function MessageItem({ message }) {
  const { currentUser }   = useAuth();
  const [editing, setEditing]     = useState(false);
  const [editText, setEditText]   = useState(message.text);
  const [saving,  setSaving]      = useState(false);

  const isOwn    = currentUser && currentUser.uid === message.userId;
  const hasUpvoted = currentUser && message.upvotes.includes(currentUser.uid);
  const tagClass = TAG_CLASSES[message.issueTag] || 'tag-other';

  const handleUpvote = useCallback(() => {
    if (!currentUser) return;
    socket.emit('upvote_message', { messageId: message.id, userId: currentUser.uid });
  }, [message.id, currentUser]);

  const handleEdit = useCallback(() => {
    setEditText(message.text);
    setEditing(true);
  }, [message.text]);

  const handleSave = useCallback(() => {
    const trimmed = editText.trim();
    if (!trimmed || trimmed === message.text) { setEditing(false); return; }
    setSaving(true);
    socket.emit('edit_message', { messageId: message.id, text: trimmed });
    setEditing(false);
    setSaving(false);
  }, [editText, message.id, message.text]);

  const handleDelete = useCallback(() => {
    if (window.confirm('Delete this message? This cannot be undone.')) {
      socket.emit('delete_message', { messageId: message.id });
    }
  }, [message.id]);

  const initials = (message.userName || '?')[0].toUpperCase();
  const avatarColors = ['from-purple-400 to-pink-400', 'from-blue-400 to-cyan-400', 'from-green-400 to-teal-400', 'from-orange-400 to-red-400'];
  const colorIdx = message.userId.charCodeAt(0) % avatarColors.length;

  return (
    <div className={`group flex gap-3 py-3 px-4 rounded-2xl transition-colors duration-150 hover:bg-surface-50 dark:hover:bg-surface-800/50 animate-fade-in ${isOwn ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div className={`flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br ${avatarColors[colorIdx]} flex items-center justify-center shadow-sm`}>
        <span className="text-white text-sm font-bold">{initials}</span>
      </div>

      {/* Bubble */}
      <div className={`flex flex-col gap-1 max-w-[75%] ${isOwn ? 'items-end' : 'items-start'}`}>
        {/* Meta row */}
        <div className={`flex items-center gap-2 flex-wrap ${isOwn ? 'flex-row-reverse' : ''}`}>
          <span className="text-xs font-semibold text-surface-700 dark:text-surface-300">{message.userName}</span>
          <span className={tagClass}>{message.issueTag}</span>
          {message.edited && <span className="text-xs text-surface-400 dark:text-surface-500 italic">edited</span>}
          <span className="text-xs text-surface-400 dark:text-surface-500">{timeAgo(message.timestamp)}</span>
        </div>

        {/* Text / Edit area */}
        {editing ? (
          <div className="w-full space-y-2">
            <textarea
              className="input text-sm resize-none min-h-[80px]"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <button className="btn-secondary btn-sm" onClick={() => setEditing(false)}>Cancel</button>
              <button className="btn-primary btn-sm" onClick={handleSave} disabled={saving}>Save</button>
            </div>
          </div>
        ) : (
          <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
            isOwn
              ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-tr-sm'
              : 'bg-white dark:bg-surface-800 text-surface-800 dark:text-surface-200 border border-surface-200 dark:border-surface-700 rounded-tl-sm'
          }`}>
            {message.text}
          </div>
        )}

        {/* Actions row */}
        <div className={`flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${isOwn ? 'flex-row-reverse' : ''}`}>
          {/* Upvote */}
          <button
            onClick={handleUpvote}
            id={`upvote-${message.id}`}
            className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg transition-colors ${
              hasUpvoted
                ? 'text-primary-600 bg-primary-50 dark:bg-primary-900/30 dark:text-primary-400'
                : 'text-surface-500 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20'
            }`}
          >
            <UpvoteIcon filled={hasUpvoted} />
            <span>{message.upvotes.length}</span>
          </button>

          {/* Edit / Delete — own messages only */}
          {isOwn && !editing && (
            <>
              <button
                onClick={handleEdit}
                id={`edit-${message.id}`}
                className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg text-surface-500 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
              >
                <EditIcon /> Edit
              </button>
              <button
                onClick={handleDelete}
                id={`delete-${message.id}`}
                className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg text-surface-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <DeleteIcon /> Delete
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default MessageItem;
