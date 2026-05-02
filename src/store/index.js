// src/store/index.js
import { configureStore } from '@reduxjs/toolkit';
import messagesReducer from './messagesSlice';
import uiReducer from './uiSlice';

const store = configureStore({
  reducer: {
    messages: messagesReducer,
    ui: uiReducer,
  },
});

export default store;
