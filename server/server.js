const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

app.use(cors());
app.use(express.json());

// ── In-memory store ──────────────────────────────────────────────────────────

const rooms = [
  { id: 'delhi', name: 'Delhi', city: 'Delhi' },
  { id: 'mumbai', name: 'Mumbai', city: 'Mumbai' },
  { id: 'bangalore', name: 'Bangalore', city: 'Bangalore' },
  { id: 'chennai', name: 'Chennai', city: 'Chennai' },
];

/** @type {Array<{id,roomId,userId,userName,text,issueTag,upvotes,timestamp,edited}>} */
let messages = [];

// Seed some demo messages so the app isn't totally empty
const issueTags = ['Water', 'Road', 'Electricity', 'Safety', 'Other'];
const demoUsers = [
  { userId: 'demo1', userName: 'Priya Sharma' },
  { userId: 'demo2', userName: 'Rahul Verma' },
  { userId: 'demo3', userName: 'Anita Nair' },
  { userId: 'demo4', userName: 'Suresh Kumar' },
];

const demoTexts = {
  delhi: [
    { tag: 'Water', text: 'Water supply has been cut off in Lajpat Nagar since morning. Anyone else affected?' },
    { tag: 'Road', text: 'Massive pothole on Outer Ring Road near Laxmi Nagar. Two bikes fell today.' },
    { tag: 'Electricity', text: 'Power outage in Dwarka Sector 12. No updates from BSES.' },
    { tag: 'Safety', text: 'Streetlights not working near Metro Station. Please report to authorities.' },
  ],
  mumbai: [
    { tag: 'Water', text: 'Low water pressure in Andheri West for 3 days. When will BMC fix this?' },
    { tag: 'Road', text: 'Waterlogging on SV Road making it impossible to commute.' },
    { tag: 'Safety', text: 'Auto-rickshaws overcharging at Bandra station. Need strict action.' },
    { tag: 'Other', text: 'Garbage not collected for a week in Goregaon East.' },
  ],
  bangalore: [
    { tag: 'Road', text: 'Potholes on Sarjapur Road are getting worse after rains. BBMP please act!' },
    { tag: 'Electricity', text: 'Frequent power cuts in Whitefield affecting WFH employees.' },
    { tag: 'Water', text: 'Cauvery water supply stopped in Koramangala. Tanker mafia active again.' },
    { tag: 'Safety', text: 'Stray dogs menace near Marathahalli bridge. Someone please report.' },
  ],
  chennai: [
    { tag: 'Water', text: 'Chennai corporation water quality very poor in T. Nagar area.' },
    { tag: 'Road', text: 'Road dug up for metro work in Adyar not restored properly. Causing accidents.' },
    { tag: 'Electricity', text: 'TNEB not responding to fault reports. Power cut since 6 hours.' },
    { tag: 'Other', text: 'Tree fallen on road near Besant Nagar beach. Blocking one lane.' },
  ],
};

// Populate demo messages spread over last 7 days
(() => {
  let msgIndex = 0;
  rooms.forEach((room) => {
    const roomDemos = demoTexts[room.id] || [];
    roomDemos.forEach((demo, i) => {
      const daysAgo = Math.floor(Math.random() * 7);
      const hoursAgo = Math.floor(Math.random() * 20);
      const ts = new Date(Date.now() - daysAgo * 86400000 - hoursAgo * 3600000);
      messages.push({
        id: uuidv4(),
        roomId: room.id,
        userId: demoUsers[i % demoUsers.length].userId,
        userName: demoUsers[i % demoUsers.length].userName,
        text: demo.text,
        issueTag: demo.tag,
        upvotes: [],
        timestamp: ts.toISOString(),
        edited: false,
      });
      msgIndex++;
    });
  });
  // Sort by timestamp
  messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
})();

// ── REST Endpoints ───────────────────────────────────────────────────────────

app.get('/api/rooms', (req, res) => {
  // Enrich rooms with basic stats
  const enriched = rooms.map((room) => {
    const roomMsgs = messages.filter((m) => m.roomId === room.id);
    const tagBreakdown = {};
    roomMsgs.forEach((m) => {
      tagBreakdown[m.issueTag] = (tagBreakdown[m.issueTag] || 0) + 1;
    });
    return { ...room, messageCount: roomMsgs.length, tagBreakdown };
  });
  res.json(enriched);
});

app.get('/api/rooms/:roomId/messages', (req, res) => {
  const { roomId } = req.params;
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;

  const room = rooms.find((r) => r.id === roomId);
  if (!room) return res.status(404).json({ error: 'Room not found' });

  const roomMessages = messages
    .filter((m) => m.roomId === roomId)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  const total = roomMessages.length;
  const start = (page - 1) * limit;
  const paginated = roomMessages.slice(start, start + limit);
  const hasMore = start + limit < total;

  res.json({ messages: paginated.reverse(), page, limit, total, hasMore });
});

// Stats endpoint for dashboard
app.get('/api/stats', (req, res) => {
  const tagCounts = {};
  const dayCounts = {};
  const roomCounts = {};
  const userSet = new Set();

  messages.forEach((m) => {
    tagCounts[m.issueTag] = (tagCounts[m.issueTag] || 0) + 1;
    roomCounts[m.roomId] = (roomCounts[m.roomId] || 0) + 1;
    userSet.add(m.userId);

    const day = new Date(m.timestamp).toISOString().split('T')[0];
    dayCounts[day] = (dayCounts[day] || 0) + 1;
  });

  // Last 7 days
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000).toISOString().split('T')[0];
    days.push({ date: d, count: dayCounts[d] || 0 });
  }

  res.json({
    totalMessages: messages.length,
    activeRooms: rooms.length,
    issueTypes: Object.keys(tagCounts).length,
    uniqueUsers: userSet.size,
    tagCounts,
    dailyMessages: days,
    roomActivity: rooms.map((r) => ({ name: r.name, count: roomCounts[r.id] || 0 })),
  });
});

// ── Socket.IO ────────────────────────────────────────────────────────────────

io.on('connection', (socket) => {
  console.log(`[Socket] Client connected: ${socket.id}`);

  socket.on('join_room', ({ roomId }) => {
    socket.join(roomId);
    console.log(`[Socket] ${socket.id} joined room: ${roomId}`);
  });

  socket.on('leave_room', ({ roomId }) => {
    socket.leave(roomId);
    console.log(`[Socket] ${socket.id} left room: ${roomId}`);
  });

  socket.on('send_message', ({ roomId, text, issueTag, userId, userName }) => {
    if (!roomId || !text || !userId || !userName) return;

    const message = {
      id: uuidv4(),
      roomId,
      userId,
      userName,
      text: text.trim(),
      issueTag: issueTag || 'Other',
      upvotes: [],
      timestamp: new Date().toISOString(),
      edited: false,
    };

    messages.push(message);
    io.to(roomId).emit('receive_message', message);
  });

  socket.on('edit_message', ({ messageId, text }) => {
    const msg = messages.find((m) => m.id === messageId);
    if (!msg) return;

    msg.text = text.trim();
    msg.edited = true;

    io.to(msg.roomId).emit('message_updated', msg);
  });

  socket.on('delete_message', ({ messageId }) => {
    const msg = messages.find((m) => m.id === messageId);
    if (!msg) return;

    const roomId = msg.roomId;
    messages = messages.filter((m) => m.id !== messageId);
    io.to(roomId).emit('message_deleted', { messageId, roomId });
  });

  socket.on('upvote_message', ({ messageId, userId }) => {
    const msg = messages.find((m) => m.id === messageId);
    if (!msg) return;

    const idx = msg.upvotes.indexOf(userId);
    if (idx === -1) {
      msg.upvotes.push(userId);
    } else {
      msg.upvotes.splice(idx, 1);
    }

    io.to(msg.roomId).emit('message_updated', msg);
  });

  socket.on('disconnect', () => {
    console.log(`[Socket] Client disconnected: ${socket.id}`);
  });
});

// ── Start ────────────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`✅ CivicPulse server running on http://localhost:${PORT}`);
});
