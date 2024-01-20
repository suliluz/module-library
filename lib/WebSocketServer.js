"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = __importDefault(require("ws"));
class WebSocketServer {
    static wss;
    static rooms = new Map();
    static clients = new Map();
    static init(server) {
        this.wss = new ws_1.default.WebSocketServer({ server });
        this.registerEvents();
    }
    static registerEvents() {
        this.wss.on("connection", (ws) => {
            if (!this.clients.has(ws.id)) {
                this.clients.set(ws.id, ws);
            }
            ws.on("join", (room) => {
                if (!this.rooms.has(room)) {
                    this.rooms.set(room, []);
                }
                this.rooms.get(room)?.push(ws);
            });
            ws.on("leave", (room) => {
                if (this.rooms.has(room)) {
                    this.rooms.set(room, this.rooms.get(room).filter((client) => client !== ws));
                }
            });
            ws.on("broadcast", (message) => {
                this.clients.forEach((client) => {
                    client.send(message);
                });
            });
            ws.on("invite", (message) => {
                const { room, data } = JSON.parse(message);
                // Get recipient from data
                const recipient = data["recipient"];
                // Look up recipient in clients
                const recipientClient = this.clients.get(recipient);
                // Add recipient to room
                this.rooms.get(room)?.push(recipientClient);
            });
            ws.on("message", (message) => {
                const { room, data } = JSON.parse(message);
                if (this.rooms.has(room)) {
                    this.rooms.get(room)?.forEach((client) => {
                        client.send(data);
                    });
                }
            });
            ws.on("close", () => {
                this.rooms.forEach((clients, room) => {
                    this.rooms.set(room, clients.filter((client) => client !== ws));
                });
                // Remove room if no clients are present
                this.rooms.forEach((clients, room) => {
                    if (clients.length === 0) {
                        this.rooms.delete(room);
                    }
                });
                // Remove client
                this.clients.delete(ws.id);
            });
        });
    }
}
exports.default = WebSocketServer;
//# sourceMappingURL=WebSocketServer.js.map