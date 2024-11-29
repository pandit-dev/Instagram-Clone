import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

const userSocketMap = {}; //this map stores socket id corresponding the user id : userid->socketid

export const getReciverSocketId = (receiverId) => userSocketMap[receiverId];

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  if (userId) {
    userSocketMap[userId] = socket.id;
    console.log(`user connected: userId = ${userId} ,socketId = ${socket.id}`);

    // Notify all clients about the updated list of online users
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  }


  socket.on("disconnect", () => {
    if (userId) {
      console.log(`user disconnected: userId = ${userId} ,socketId = ${socket.id}`);
      delete userSocketMap[userId];

      // Notify all clients about the updated list of online users
      io.emit("getOnlineUsers", Object.keys(userSocketMap));
    }
  });

});
export { app, server, io };
