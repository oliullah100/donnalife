import { Server } from "http";
//import { Server as IOServer } from "socket.io";
import app from "./app";
//import { initChatSocket } from "./app/modules/Chat/chat.socket"; // ✅ use register function
//import { registerAdminNotificationSocket } from "./app/modules/Meta/adminNotification";
//import { connectWebSocketServer } from "./app/modules/Chats/chat.webSocket";

const port = 5000;

//let io: IOServer;

async function main() {
  const server: Server = app.listen(port, () => {
    console.log("Server is running on port:", port);
  });

//   connectWebSocketServer(server);

//   io = new IOServer(server, {
//     cors: {
//       origin: ["http://localhost:5173"],
//       methods: ["GET", "POST"],
//     },
//   });

  // Register notification module with Socket.IO instance
//   registerAdminNotificationSocket(io);

//   // Initialize chat sockets
//   initChatSocket(io);

  const exitHandler = () => {
    if (server) {
      server.close(() => {
        console.info("Server closed!");
      });
    }
    process.exit(1);
  };

  process.on("uncaughtException", (error) => {
    console.log(error);
    exitHandler();
  });

  process.on("unhandledRejection", (error) => {
    console.log(error);
    exitHandler();
  });
}

main();
