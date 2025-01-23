import { Server } from "socket.io";
import http from "http";
import express from "express";
import { Message } from "../models/message.model.mjs";
import { Conversation } from "../models/conversation.model.mjs";
const app = express();
const server = http.createServer(app);
//now comes the socket server
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PATCH", "DELETE"],
  },
});

// A hash map to track online users and their clientIDs
const userIdSocketIdHashMap = {};

export const getClientId = (username) => {
  try {
    return userIdSocketIdHashMap[username];
  } catch (error) {
    console.log("Error getting the client ID from the username");
    console.log(error);
  }
};

io.on("connection", (socket) => {
  console.log("client connected and the client id is : ", socket.id);
  const { username } = socket.handshake.query;
  if (username !== "undefined") userIdSocketIdHashMap[username] = socket.id;
  //notify the clients on the new online user
  io.emit("onlineUsersEvent", Object.keys(userIdSocketIdHashMap));
  // register an event listener for when a message has been seen
  socket.on(
    "seenMessageEvent",
    async ({ conversationId, sender, lastSeenMessageId }) => {
      try {
        //update the particular conversation Id
        console.log(
          `Captured a seenMessageEvent on the client for the sender ${sender}`
        );
        await Message.updateMany(
          {
            conversationId,
          },
          {
            $set: {
              seen: true,
            },
          }
        );
        //update the last message in the conversation as seen or not
        await Conversation.findByIdAndUpdate(
          conversationId,
          {
            $set: {
              "lastMessage.seen": true,
            },
          },
          { new: true }
        );
        //emit an event to the message sender the sender comes in as a username
        const clientId = getClientId(sender);
        io.to(clientId).emit("seenMessageEvent", {
          conversationId,
          lastSeenMessageId,
        });
      } catch (error) {
        console.log(error);
      }
    }
  );
  //on disconnect
  socket.on("disconnect", () => {
    console.log("client disconnected and the client id is : ", socket.id);
    delete userIdSocketIdHashMap[username];
    io.emit("onlineUsersEvent", Object.keys(userIdSocketIdHashMap));
  });
});

export { io, server, app };
