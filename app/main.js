
const net = require('net');

// Logs from your program will appear here!
console.log("Server is starting...");

const server = net.createServer((socket) => {
    // Listen for data from the client

    socket.on('data', (data) => {
        const request = data.toString();
        if (request.startsWith('GET / ')) {
          
            const httpResponse = 'HTTP/1.1 200 OK\r\n\r\n';
            socket.write(httpResponse);
        } else {
          const httpResponse = 'HTTP/1.1 404 Not Found\r\n\r\n';
            socket.write(httpResponse);
        }
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
