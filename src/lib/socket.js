// src/lib/socket.js
import { io } from 'socket.io-client';

const SOCKET_URL =
  import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace(/^http/, 'http')
    : window.location.origin;

const socket = io(SOCKET_URL, {
  autoConnect: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  transports: ['websocket', 'polling'],
});

export default socket;
