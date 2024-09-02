const net = require("net");

const server = net.createServer((socket) => {
    // Handle incoming data
    socket.on("data", (data) => {
        const request = data.toString();
        console.log("Request: \n" + request);

        // Parse URL and headers
        const lines = request.split('\r\n');
        const url = lines[0].split(' ')[1]; // First line contains the URL
        const headers = lines.slice(1, -2); // Extract headers excluding request line and empty line

        // Handle different endpoints
        if (url === "/") {
            socket.write("HTTP/1.1 200 OK\r\n\r\n");
        } else if (url.startsWith("/echo/")) {
            const content = url.split('/echo/')[1];
            socket.write(`HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${content.length}\r\n\r\n${content}`);
        } else if (url === "/user-agent") {
            // Find User-Agent header
            const userAgentHeader = headers.find(header => header.startsWith('User-Agent: '));
            const userAgent = userAgentHeader ? userAgentHeader.split('User-Agent: ')[1] : '';
            socket.write(`HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${userAgent.length}\r\n\r\n${userAgent}`);
        } else {
            socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
        }

        // Close the connection after responding
        socket.end();
    });

    // Handle socket errors
    socket.on("error", (err) => {
        console.error("Socket error:", err);
    });
});

// Start the server and listen on port 4221
server.listen(4221, "localhost", () => {
    console.log("Server is listening on port 4221");
});
