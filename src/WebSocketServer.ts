import ws from "ws";

declare class CustomSocket extends ws.WebSocket {
    id: string;
}

class WebSocketServer {
    private static wss: ws.WebSocketServer;
    private static rooms: Map<string, ws.WebSocket[]> = new Map();
    private static clients: Map<string, ws.WebSocket> = new Map();

    static init(server: any) {
        this.wss = new ws.WebSocketServer({ server });
        this.registerEvents();
    }

    static registerEvents() {
        this.wss.on("connection", (ws: CustomSocket) => {
            if(!this.clients.has(ws.id)) {
                this.clients.set(ws.id, ws);
            }

            ws.on("join", (room: string) => {
                if (!this.rooms.has(room)) {
                    this.rooms.set(room, []);
                }

                this.rooms.get(room)?.push(ws);
            });

            ws.on("leave", (room: string) => {
                if (this.rooms.has(room)) {
                    this.rooms.set(
                        room,
                        this.rooms.get(room)!.filter((client: ws.WebSocket) => client !== ws)
                    );
                }
            });

            ws.on("broadcast", (message: string) => {
                this.clients.forEach((client: ws.WebSocket) => {
                    client.send(message);
                });
            });

            ws.on("invite", (message: string) => {
                const { room, data } = JSON.parse(message);

                // Get recipient from data
                const recipient = data["recipient"];

                // Look up recipient in clients
                const recipientClient = this.clients.get(recipient);

                // Add recipient to room
                this.rooms.get(room)?.push(recipientClient!);
            });

            ws.on("message", (message: string) => {
                const { room, data } = JSON.parse(message);
                if (this.rooms.has(room)) {
                    this.rooms.get(room)?.forEach((client: ws.WebSocket) => {
                        client.send(data);
                    });
                }
            });

            ws.on("close", () => {
                this.rooms.forEach((clients: ws.WebSocket[], room: string) => {
                    this.rooms.set(
                        room,
                        clients.filter((client: ws.WebSocket) => client !== ws)
                    );
                });

                // Remove room if no clients are present
                this.rooms.forEach((clients: ws.WebSocket[], room: string) => {
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

export default WebSocketServer;