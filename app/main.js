const net = require('net');

// Logs from your program will appear here!
console.log("Server is starting...");

const server = net.createServer((socket) => {
    // Listen for data from the client
    socket.on('data', (data) => {
        const request = data.toString();
        console.log('Received request:', request);

        // Match the request to check if it follows the pattern GET /echo/{str} HTTP/1.1
        const match = request.match(/^GET \/echo\/([^ ]+) HTTP\/1.1/);

        if (match) {
            const echoStr = match[1];  // Extracted string to be echoed
            const contentLength = Buffer.byteLength(echoStr);  // Calculate the length of the string in bytes
            
            // Construct the HTTP response
            const httpResponse = `HTTP/1.1 200 OK\r\n` +
                                 `Content-Type: text/plain\r\n` +
                                 `Content-Length: ${contentLength}\r\n\r\n` +
                                 `${echoStr}`;

            // Send the HTTP response to the client
            socket.write(httpResponse);
        } else {
            // Respond with 404 Not Found if the pattern doesn't match
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
