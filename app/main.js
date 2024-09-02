// const net = require("net");

// // You can use print statements as follows for debugging, they'll be visible when running tests.
// console.log("Logs from your program will appear here!");

// // Uncomment this to pass the first stage
// const server = net.createServer((socket) => {
//     socket.on("data",(buffer)=>{
//      socket.write("HTTP/1.1 200 OK\r\n\r\n");
//      socket.end();
//     });
//     socket.on("close", () => {
//       socket.end();
//       server.close();
//   });
// });


// server.listen(4221, "localhost");



const net = require('net');

// Logs from your program will appear here!
console.log("Server is starting...");

const server = net.createServer((socket) => {
    // Listen for data from the client
    socket.on('data', (data) => {
        console.log('Received data:', data.toString());

        // Write a simple HTTP 200 response
        const response = 'HTTP/1.1 200 OK\r\n' +
                         'Content-Length: 13\r\n' +
                         'Content-Type: text/plain\r\n\r\n' +
                         'Hello, World!';
        
        // Send the HTTP response to the client
        socket.write(response);
        
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
