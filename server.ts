import express from "express";
import path from "path";
import { createServer } from "http";
import { Server } from "socket.io";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
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

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
    }
  });

  const PORT = 3000;

  app.use(express.json());

  // API Route for AI responses
  app.post("/api/ai/wellness", async (req, res) => {
    try {
      const { history } = req.body;
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
      console.error("Gemini Error:", error);
      res.status(500).json({ error: "AI generation failed" });
    }
  });

  // Socket.io Real-time Logic
  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    socket.on("join_session", (bookingId) => {
      socket.join(bookingId);
      console.log(`Socket ${socket.id} joined session ${bookingId}`);
    });

    socket.on("send_message", ({ bookingId, message }) => {
      // Broadcast to everyone in the room EXCEPT the sender? 
      // Actually, usually easier to broadcast to all and have sender handle it locally or via ack.
      // We'll broadcast to the room.
      io.to(bookingId).emit("new_message", { bookingId, message });
    });

    socket.on("booking_update", (data) => {
      // Broadcast to all clients so everyone's dashboard updates
      socket.broadcast.emit("bookings_changed", data);
    });

    socket.on("user_update", (data) => {
      socket.broadcast.emit("users_changed", data);
    });

    socket.on("notification", ({ userId, notification }) => {
      io.emit("new_notification", { userId, notification });
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
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
