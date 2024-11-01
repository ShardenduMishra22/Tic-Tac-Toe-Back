"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
dotenv_1.default.config();
const PORT = process.env.PORT || 5000;
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: "https://tic-tac-toe-front-oix5.onrender.com",
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    },
});
app.use((0, cors_1.default)());
let waitingPlayer = null;
io.on("connection", (socket) => {
    console.log("User connected:", socket.id);
    socket.on("findMatch", () => {
        if (waitingPlayer) {
            const opponent = waitingPlayer;
            waitingPlayer = null;
            const isFirstPlayerX = Math.random() < 0.5;
            const gameData = {
                playerX: isFirstPlayerX ? socket.id : opponent.id,
                playerO: isFirstPlayerX ? opponent.id : socket.id,
            };
            socket.join(gameData.playerX);
            socket.join(gameData.playerO);
            io.to(gameData.playerX).emit("matchFound", {
                symbol: "X",
                opponentId: gameData.playerO,
            });
            io.to(gameData.playerO).emit("matchFound", {
                symbol: "O",
                opponentId: gameData.playerX,
            });
        }
        else {
            waitingPlayer = socket;
        }
    });
    socket.on("makeMove", ({ index, symbol, room }) => {
        io.to(room).emit("moveMade", { index, symbol });
    });
    socket.on("disconnect", () => {
        if ((waitingPlayer === null || waitingPlayer === void 0 ? void 0 : waitingPlayer.id) === socket.id) {
            waitingPlayer = null;
        }
        console.log("User disconnected:", socket.id);
    });
});
httpServer.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
