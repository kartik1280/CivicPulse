// src/pages/ChatRoom.jsx
import { useEffect, useRef, useCallback, useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import Navbar from '../components/Navbar';
import MessageItem from '../components/MessageItem';
import WeatherWidget from '../components/WeatherWidget';
import { useAuth } from '../contexts/AuthContext';
import { useDebounce } from '../hooks/useDebounce';
import socket from '../lib/socket';
import {
  setMessages, appendMessages, addMessage,
  updateMessage, removeMessage,
  setPage, setHasMore, setLoading, setError, resetMessages,
} from '../store/messagesSlice';
import { setSearch, setFilter } from '../store/uiSlice';

const ISSUE_TAGS = ['Water', 'Road', 'Electricity', 'Safety', 'Other'];
const ROOM_META = {
  delhi:     { name: 'Delhi',     city: 'Delhi',     emoji: '🏛️' },
  mumbai:    { name: 'Mumbai',    city: 'Mumbai',     emoji: '🌊' },
  bangalore: { name: 'Bangalore', city: 'Bangalore',  emoji: '🌿' },
  chennai:   { name: 'Chennai',   city: 'Chennai',    emoji: '🌴' },
};

const SendIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
  </svg>
);
const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0z" />
  </svg>
);
const BackIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

function ChatRoom() {
  const { roomId }    = useParams();
  const navigate      = useNavigate();
  const dispatch      = useDispatch();
  const { currentUser } = useAuth();

  const { messages, page, hasMore, loading, error } = useSelector((s) => s.messages);
  const { searchQuery, filterTag } = useSelector((s) => s.ui);

  const [text,    setText]    = useState('');
  const [tag,     setTag]     = useState('Other');
  const [sending, setSending] = useState(false);
  const [rawSearch, setRawSearch] = useState('');

  const debouncedSearch = useDebounce(rawSearch, 300);
  const bottomRef       = useRef(null);
  const listRef         = useRef(null);
  const room            = ROOM_META[roomId] || { name: roomId, city: roomId, emoji: '🏙️' };

  // Sync debounced search to Redux
  useEffect(() => {
    dispatch(setSearch(debouncedSearch));
  }, [debouncedSearch, dispatch]);

  // Reset on room change
  useEffect(() => {
    dispatch(resetMessages());
    dispatch(setSearch(''));
    dispatch(setFilter('All'));
    setRawSearch('');
  }, [roomId, dispatch]);

  // Fetch messages (paginated)
  const fetchMessages = useCallback(async (pg = 1) => {
    dispatch(setLoading(true));
    try {
      const { data } = await axios.get(`/api/rooms/${roomId}/messages`, {
        params: { page: pg, limit: 20 },
      });
      if (pg === 1) {
        dispatch(setMessages(data.messages));
      } else {
        dispatch(appendMessages(data.messages));
      }
      dispatch(setPage(pg));
      dispatch(setHasMore(data.hasMore));
    } catch {
      dispatch(setError('Failed to load messages.'));
    } finally {
      dispatch(setLoading(false));
    }
  }, [roomId, dispatch]);

  // Mount: fetch + join socket room
  useEffect(() => {
    fetchMessages(1);
    socket.emit('join_room', { roomId });

    socket.on('receive_message',  (msg)        => dispatch(addMessage(msg)));
    socket.on('message_updated',  (msg)        => dispatch(updateMessage(msg)));
    socket.on('message_deleted',  ({ messageId }) => dispatch(removeMessage(messageId)));

    return () => {
      socket.emit('leave_room', { roomId });
      socket.off('receive_message');
      socket.off('message_updated');
      socket.off('message_deleted');
    };
  }, [roomId, fetchMessages, dispatch]);

  // Scroll to bottom on new messages (first page only)
  useEffect(() => {
    if (page === 1) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length, page]);

  // Filtered + searched messages (memoized)
  const filteredMessages = useMemo(() => {
    let list = messages;
    if (filterTag !== 'All') {
      list = list.filter((m) => m.issueTag === filterTag);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (m) =>
          m.text.toLowerCase().includes(q) ||
          m.userName.toLowerCase().includes(q)
      );
    }
    return list;
  }, [messages, filterTag, searchQuery]);

  const handleSend = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed || !currentUser) return;
    setSending(true);
    socket.emit('send_message', {
      roomId,
      text: trimmed,
      issueTag: tag,
      userId:   currentUser.uid,
      userName: currentUser.displayName || currentUser.email,
    });
    setText('');
    setSending(false);
  }, [text, tag, roomId, currentUser]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const loadMore = () => {
    if (!hasMore || loading) return;
    fetchMessages(page + 1);
  };

  if (!ROOM_META[roomId]) {
    navigate('/rooms');
    return null;
  }

  return (
    <div className="page-wrapper flex flex-col" style={{ height: '100vh' }}>
      <Navbar />

      {/* Room header */}
      <div className="glass border-b border-surface-200/60 dark:border-surface-700/60 px-4 sm:px-6 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Link
              to="/rooms"
              className="btn-ghost btn-icon text-surface-500"
              aria-label="Back to rooms"
            >
              <BackIcon />
            </Link>
            <span className="text-2xl">{room.emoji}</span>
            <div>
              <h1 className="text-lg font-bold text-surface-900 dark:text-surface-100 leading-tight">
                {room.name} Community Room
              </h1>
              <p className="text-xs text-surface-500 dark:text-surface-400">
                Real-time civic issue reporting
              </p>
            </div>
          </div>
          <WeatherWidget city={room.city} />
        </div>
      </div>

      {/* Toolbar: search + filter */}
      <div className="border-b border-surface-200 dark:border-surface-700 bg-white/80 dark:bg-surface-900/80 backdrop-blur px-4 sm:px-6 py-2.5">
        <div className="max-w-4xl mx-auto flex items-center gap-3 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-[160px]">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400 dark:text-surface-500">
              <SearchIcon />
            </span>
            <input
              id="chat-search"
              type="text"
              className="input pl-9 py-2 text-sm"
              placeholder="Search messages…"
              value={rawSearch}
              onChange={(e) => setRawSearch(e.target.value)}
            />
          </div>

          {/* Filter dropdown */}
          <select
            id="chat-filter"
            className="select py-2 text-sm w-36"
            value={filterTag}
            onChange={(e) => dispatch(setFilter(e.target.value))}
          >
            <option value="All">All Issues</option>
            {ISSUE_TAGS.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          {/* Active filters indicator */}
          {(filterTag !== 'All' || searchQuery) && (
            <button
              className="btn-ghost btn-sm text-surface-500 text-xs"
              onClick={() => { dispatch(setFilter('All')); dispatch(setSearch('')); setRawSearch(''); }}
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Message list */}
      <div
        ref={listRef}
        className="flex-1 overflow-y-auto scrollbar-thin px-4 sm:px-6 py-4"
      >
        <div className="max-w-4xl mx-auto space-y-1">
          {/* Load more */}
          {hasMore && (
            <div className="text-center py-2">
              <button
                id="load-more-btn"
                onClick={loadMore}
                disabled={loading}
                className="btn-secondary btn-sm"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 border-2 border-surface-400 border-t-transparent rounded-full animate-spin" />
                    Loading…
                  </span>
                ) : 'Load older messages'}
              </button>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="text-center py-4 text-red-500 dark:text-red-400 text-sm animate-fade-in">
              ⚠️ {error}
            </div>
          )}

          {/* Empty state */}
          {!loading && filteredMessages.length === 0 && (
            <div className="text-center py-16 animate-fade-in">
              <div className="text-5xl mb-3">💬</div>
              <p className="text-surface-500 dark:text-surface-400 font-medium">
                {searchQuery || filterTag !== 'All'
                  ? 'No messages match your filters.'
                  : 'No messages yet. Be the first to report an issue!'}
              </p>
            </div>
          )}

          {/* Messages */}
          {filteredMessages.map((msg) => (
            <MessageItem key={msg.id} message={msg} />
          ))}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Message composer */}
      <div className="border-t border-surface-200 dark:border-surface-700 bg-white/90 dark:bg-surface-900/90 backdrop-blur px-4 sm:px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-3 items-end">
            {/* Tag selector */}
            <select
              id="message-tag"
              className="select py-2.5 text-sm w-36 flex-shrink-0"
              value={tag}
              onChange={(e) => setTag(e.target.value)}
            >
              {ISSUE_TAGS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>

            {/* Text input */}
            <textarea
              id="message-input"
              rows={1}
              className="input flex-1 resize-none py-2.5 text-sm leading-relaxed"
              placeholder="Describe the civic issue… (Enter to send)"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              style={{ maxHeight: '120px', overflowY: 'auto' }}
            />

            {/* Send */}
            <button
              id="send-btn"
              onClick={handleSend}
              disabled={sending || !text.trim()}
              className="btn-primary flex-shrink-0 px-4 py-2.5 shadow-lg shadow-primary-500/20"
              aria-label="Send message"
            >
              <SendIcon />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatRoom;
