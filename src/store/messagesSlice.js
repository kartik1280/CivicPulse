// src/store/messagesSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  messages: [],
  page: 1,
  hasMore: true,
  loading: false,
  error: null,
};

const messagesSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    setMessages(state, action) {
      state.messages = action.payload;
      state.error = null;
    },
    appendMessages(state, action) {
      // Prepend older messages (pagination loads older ones)
      const existing = new Set(state.messages.map((m) => m.id));
      const newOnes = action.payload.filter((m) => !existing.has(m.id));
      state.messages = [...newOnes, ...state.messages];
    },
    addMessage(state, action) {
      const exists = state.messages.find((m) => m.id === action.payload.id);
      if (!exists) state.messages.push(action.payload);
    },
    updateMessage(state, action) {
      const idx = state.messages.findIndex((m) => m.id === action.payload.id);
      if (idx !== -1) state.messages[idx] = action.payload;
    },
    removeMessage(state, action) {
      state.messages = state.messages.filter((m) => m.id !== action.payload);
    },
    setPage(state, action) {
      state.page = action.payload;
    },
    setHasMore(state, action) {
      state.hasMore = action.payload;
    },
    setLoading(state, action) {
      state.loading = action.payload;
    },
    setError(state, action) {
      state.error = action.payload;
    },
    resetMessages() {
      return initialState;
    },
  },
});

export const {
  setMessages,
  appendMessages,
  addMessage,
  updateMessage,
  removeMessage,
  setPage,
  setHasMore,
  setLoading,
  setError,
  resetMessages,
} = messagesSlice.actions;

export default messagesSlice.reducer;
