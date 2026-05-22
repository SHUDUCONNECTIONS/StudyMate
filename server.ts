import express from "express";
import path from "path";
import { createServer } from "http";
import { Server } from "socket.io";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

const ALLOWED_ORIGIN = process.env.APP_URL || 'http://localhost:3000';

// Simple in-memory store for socket session tracking
const socketSessions = new Map<string, { userId?: string; joinedRooms: Set<string> }>();

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

  // Security headers
  app.use(helmet({
    contentSecurityPolicy: false, // Vite SPA needs this off in dev; tighten in production
    crossOriginEmbedderPolicy: false,
  }));

  // Body size limit
  app.use(express.json({ limit: '100kb' }));

  // Rate limiter for AI endpoint: 20 requests per minute per IP
  const aiLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests, please slow down.' },
  });

  // API Route for AI responses
  app.post("/api/ai/wellness", aiLimiter, async (req, res) => {
    try {
      const { history } = req.body;

      if (!Array.isArray(history) || history.length === 0) {
        res.status(400).json({ error: "Invalid request: history must be a non-empty array." });
        return;
      }

      if (history.length > 100) {
        res.status(400).json({ error: "History too long." });
        return;
      }

      for (const msg of history) {
        if (typeof msg.role !== 'string' || typeof msg.content !== 'string') {
          res.status(400).json({ error: "Invalid message format." });
          return;
        }
        if (msg.content.length > 4000) {
          res.status(400).json({ error: "Message content too long." });
          return;
        }
      }

      const contents = history
        .filter((msg: any) => msg.role !== 'system')
        .map((msg: any) => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }]
        }));

      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents,
        config: {
          systemInstruction: "You are Yandasm, a supportive student wellness companion. Provide empathetic, non-judgmental, and practical guidance for academic stress, anxiety, and personal well-being. Always include a disclaimer for serious mental health crises to seek professional human help or emergency services.",
          temperature: 0.7,
        }
      });

      res.json({ content: response.text });
    } catch (error) {
      console.error("Gemini API error");
      res.status(500).json({ error: "AI generation failed" });
    }
  });

  // Socket.io Real-time Logic
  io.on("connection", (socket) => {
    socketSessions.set(socket.id, { joinedRooms: new Set() });

    socket.on("join_session", (bookingId) => {
      if (typeof bookingId !== 'string' || bookingId.length > 100) return;
      const session = socketSessions.get(socket.id);
      if (session) {
        session.joinedRooms.add(bookingId);
      }
      socket.join(bookingId);
    });

    socket.on("send_message", ({ bookingId, message }) => {
      if (typeof bookingId !== 'string' || bookingId.length > 100) return;
      if (!message || typeof message.content !== 'string') return;
      if (message.content.length > 4000) return;

      // Only allow sending to rooms this socket has joined
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

  // Vite middleware for development
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
