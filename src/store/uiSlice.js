// src/store/uiSlice.js
import { createSlice } from '@reduxjs/toolkit';

// Read persisted dark mode preference
const savedDark = localStorage.getItem('civicpulse_darkmode') === 'true';
if (savedDark) document.documentElement.classList.add('dark');

const initialState = {
  darkMode: savedDark,
  searchQuery: '',
  filterTag: 'All',
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleDark(state) {
      state.darkMode = !state.darkMode;
      if (state.darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      localStorage.setItem('civicpulse_darkmode', String(state.darkMode));
    },
    setSearch(state, action) {
      state.searchQuery = action.payload;
    },
    setFilter(state, action) {
      state.filterTag = action.payload;
    },
  },
});

export const { toggleDark, setSearch, setFilter } = uiSlice.actions;
export default uiSlice.reducer;
