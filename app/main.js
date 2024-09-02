const fs = require("fs");
const net = require("net");

console.log("Logs from your program will appear here!");

// Create server
const server = net.createServer((socket) => {
    socket.on("data", (data) => {
        const req = data.toString();
        console.log("Request: \n" + req);

        const path = req.split(" ")[1];
        const headers = req.split("\r\n");

        if (path === "/") {
            socket.write("HTTP/1.1 200 OK\r\n\r\n");
        } else if (path.startsWith("/files/")) {
            const directory = process.argv[3] || '.';
            const filename = path.split("/files/")[1];
            const filePath = `${directory}/${filename}`;

            if (fs.existsSync(filePath)) {
                const content = fs.readFileSync(filePath);
                const contentLength = content.length;
                const res = `HTTP/1.1 200 OK\r\nContent-Type: application/octet-stream\r\nContent-Length: ${contentLength}\r\n\r\n`;
                socket.write(res);
                socket.write(content);
            } else {
                socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
            }
        } else if (path === "/user-agent") {
            const userAgent = headers.find(line => line.startsWith("User-Agent: "));
            if (userAgent) {
                const res = userAgent.split("User-Agent: ")[1];
                socket.write(`HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${res.length}\r\n\r\n${res}`);
            } else {
                socket.write("HTTP/1.1 400 Bad Request\r\n\r\n");
            }
        } else if (path.startsWith("/echo/")) {
            const res = path.split("/echo/")[1];
            socket.write(`HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${res.length}\r\n\r\n${res}`);
        } else {
            socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
        }
        socket.end();
    });

    socket.on("error", (err) => {
        console.error("Socket error:", err);
    });
});

// Start server and listen on port 4221
server.listen(4221, "localhost", () => {
    console.log("Server is listening on port 4221");
});
