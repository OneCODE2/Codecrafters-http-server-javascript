const net = require('net');

// Logs from your program will appear here!
console.log("Server is starting...");

const server = net.createServer((socket) => {
    // Listen for data from the client
    socket.on('data', (data) => {
        const request = data.toString();
        console.log('Received request:', request);

        if (request.startsWith('GET / ')) {
            // Respond to root path with 200 OK
            const httpResponse = 'HTTP/1.1 200 OK\r\n\r\n';
            socket.write(httpResponse);
        } else if (request.startsWith('GET /echo/')) {
            // Extract the string from the /echo/ endpoint
            const content = request.split(' ')[1].split('/echo/')[1].split(' ')[0];
            const contentLength = Buffer.byteLength(content);

            // Respond to /echo/{str} with 200 OK and the string
            const httpResponse = `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${contentLength}\r\n\r\n${content}`;
            socket.write(httpResponse);
        } else {
            // Respond with 404 Not Found for any other requests
            const httpResponse = 'HTTP/1.1 404 Not Found\r\n\r\n';
            socket.write(httpResponse);
        }
        
        // Close the socket after sending the response
        socket.end();
    });

    // Handle socket errors
    socket.on('error', (err) => {
        console.error('Socket error:', err);
    });
});

// Start the server and listen on port 4221
server.listen(4221, 'localhost', () => {
    console.log("Server is listening on port 4221");
});
