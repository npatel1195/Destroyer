import 'dotenv/config';
import http from 'http';
import app from './app.js';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import projectModel from './models/project.model.js';
import { generateResult } from './services/ai.service.js';

const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

const server = http.createServer(app);

server.keepAliveTimeout = 120 * 1000; // 120s
server.headersTimeout   = 125 * 1000; // must be > keepAliveTimeout

const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
const io = new Server(server, {
  cors: { origin: CLIENT_ORIGIN, methods: ['GET', 'POST'] }
});

io.use(async (socket, next) => {
  try {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers.authorization?.split(' ')[1];

    const projectId = socket.handshake.query.projectId;

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return next(new Error(JSON.stringify({ error: 'Invalid projectId' })));
    }

    socket.project = await projectModel.findById(projectId);

    if (!token) {
      return next(new Error(JSON.stringify({ error: 'Authentication error' })));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded) {
      return next(new Error(JSON.stringify({ error: 'Authentication error' })));
    }

    socket.user = decoded;
    next();
  } catch (error) {
    next(new Error(JSON.stringify({ error: error.message })));
  }
});

io.on('connection', socket => {
  socket.roomId = socket.project._id.toString();

  console.log('a user connected');
  socket.join(socket.roomId);

  socket.on('project-message', async data => {
    const message = data.message;
    const aiIsPresentInMessage = message.includes('@ai');

    // Always emit a string for every message
    socket.broadcast.to(socket.roomId).emit(
      'project-message',
      JSON.stringify(data)
    );

    if (aiIsPresentInMessage) {
      const prompt = message.replace('@ai', '').trim();
      let result = await generateResult(prompt);
      result = typeof result === 'string' ? result : JSON.stringify(result);

      io.to(socket.roomId).emit('project-message',
        JSON.stringify({
          message: result,
          sender: {
            _id: 'ai',
            email: 'AI'
          }
        })
      );

      return;
    }
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
    socket.leave(socket.roomId);
  });
});

server.listen(PORT, HOST, () => {
  console.log(`✅ Server listening on http://${HOST}:${PORT}`);
});