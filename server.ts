import express from "express";
import path from "path";
import { createServer } from "http";
import { Server } from "socket.io";
import { createServer as createViteServer } from "vite";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";

dotenv.config();

const ALLOWED_ORIGIN = process.env.APP_URL || 'http://localhost:3000';

const socketSessions = new Map<string, { joinedRooms: Set<string> }>();

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: ALLOWED_ORIGIN,
      methods: ['GET', 'POST'],
    }
  });

  const PORT = 3000;

  app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  }));

  app.use(express.json({ limit: '100kb' }));

  const apiLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 60,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests, please slow down.' },
  });

  app.use('/api', apiLimiter);

  // Socket.io Real-time Logic
  io.on("connection", (socket) => {
    socketSessions.set(socket.id, { joinedRooms: new Set() });

    socket.on("join_session", (bookingId) => {
      if (typeof bookingId !== 'string' || bookingId.length > 100) return;
      const session = socketSessions.get(socket.id);
      if (session) session.joinedRooms.add(bookingId);
      socket.join(bookingId);
    });

    socket.on("send_message", ({ bookingId, message }) => {
      if (typeof bookingId !== 'string' || bookingId.length > 100) return;
      if (!message || typeof message.content !== 'string') return;
      if (message.content.length > 4000) return;
      const session = socketSessions.get(socket.id);
      if (!session?.joinedRooms.has(bookingId)) return;
      io.to(bookingId).emit("new_message", { bookingId, message });
    });

    socket.on("booking_update", (data) => {
      socket.broadcast.emit("bookings_changed", data);
    });

    socket.on("user_update", (data) => {
      socket.broadcast.emit("users_changed", data);
    });

    socket.on("notification", ({ userId, notification }) => {
      if (typeof userId !== 'string' || userId.length > 128) return;
      io.emit("new_notification", { userId, notification });
    });

    socket.on("disconnect", () => {
      socketSessions.delete(socket.id);
    });
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
