// const net = require("net");
// const fs = require("fs");

// // You can use print statements as follows for debugging, they'll be visible when running tests.
// console.log("Logs from your program will appear here!");

// // Parse the HTTP request
// const parseRequest = (requestData) => {
//   const request = requestData.toString().split("\r\n");
//   const [method, path, protocol] = request[0].split(" ");

//   const headers = {};
//   request.slice(1, -2).forEach((header) => { // Exclude last two lines which are empty or body
//     const [key, ...value] = header.split(": ");
//     if (key && value.length > 0) {
//       headers[key] = value.join(": ");
//     }
//   });

//   return { method, path, protocol, headers };
// };

// const OK_RESPONSE = "HTTP/1.1 200 OK\r\n\r\n";
// const ERROR_RESPONSE = "HTTP/1.1 404 Not Found\r\n\r\n";

// const server = net.createServer((socket) => {
//   socket.on("data", (data) => {
//     const request = parseRequest(data);
//     const { method, path, headers } = request;

//     if (path === "/") {
//       socket.write(OK_RESPONSE);
//     } else if (path.startsWith("/echo")) {
//       const randomString = path.substring(6);
//       socket.write(
//         `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${randomString.length}\r\n\r\n${randomString}`
//       );
//     } else if (path.startsWith("/user-agent")) {
//       const userAgent = headers["User-Agent"];
//       if (userAgent) {
//         socket.write(
//           `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${userAgent.length}\r\n\r\n${userAgent}`
//         );
//       } else {
//         socket.write("HTTP/1.1 400 Bad Request\r\n\r\n");
//       }
//     } else if (path.startsWith("/files/")) {
//       const fileName = path.replace("/files/", "").trim();
//       const filePath = `${process.argv[3] || '.'}/${fileName}`;

//       if (method === "GET") {
//         if (fs.existsSync(filePath)) {
//           const content = fs.readFileSync(filePath);
//           socket.write(
//             `HTTP/1.1 200 OK\r\nContent-Type: application/octet-stream\r\nContent-Length: ${content.length}\r\n\r\n`
//           );
//           socket.write(content);
//         } else {
//           socket.write(ERROR_RESPONSE);
//         }
//       } else if (method === "POST") {
//         const content = data.toString().split("\r\n\r\n")[1] || ''; // Extract body
//         fs.writeFileSync(filePath, content);
//         socket.write("HTTP/1.1 201 Created\r\n\r\n");
//       } else {
//         socket.write(ERROR_RESPONSE);
//       }
//     } else {
//       socket.write(ERROR_RESPONSE);
//     }

//     socket.end();
//   });

//   socket.on("error", (err) => {
//     console.error("Socket error:", err);
//   });
// });

// server.listen(4221, "localhost", () => {
//   console.log("Server is listening on port 4221");
// });



const net = require("net");
const fs = require("fs");
const zlib = require("zlib"); // Required for gzip compression

console.log("Logs from your program will appear here!");

// Parse the request and headers
const parseRequest = (requestData) => {
  const request = requestData.toString().split("\r\n");
  const [method, path, protocol] = request[0].split(" ");
  const headers = {};
  request.slice(1).forEach((header) => {
    const [key, ...value] = header.split(": ");
    if (key) {
      headers[key] = value.join(": ");
    }
  });
  return { method, path, protocol, headers };
};

const OK_RESPONSE = "HTTP/1.1 200 OK\r\n";
const ERROR_RESPONSE = "HTTP/1.1 404 Not Found\r\n";

const server = net.createServer((socket) => {
  socket.on("data", (data) => {
    const request = parseRequest(data);
    const { method, path, headers } = request;

    // Determine whether to compress the response
    const acceptEncoding = headers["Accept-Encoding"] || "";
    const isGzipRequested = acceptEncoding.includes("gzip");
    let responseHeaders = OK_RESPONSE;

    if (path === "/") {
      socket.write(responseHeaders + "\r\n");
    } else if (path.startsWith("/echo")) {
      const responseBody = path.substring(6);
      responseHeaders += "Content-Type: text/plain\r\n";
      responseHeaders += `Content-Length: ${responseBody.length}\r\n`;

      if (isGzipRequested) {
        // Simulate gzip compression by including Content-Encoding header
        responseHeaders += "Content-Encoding: gzip\r\n";
      }

      responseHeaders += "\r\n";
      socket.write(responseHeaders);
      socket.write(responseBody);
    } else if (path.startsWith("/user-agent")) {
      const userAgent = headers["User-Agent"] || "";
      responseHeaders += "Content-Type: text/plain\r\n";
      responseHeaders += `Content-Length: ${userAgent.length}\r\n`;

      if (isGzipRequested) {
        // Simulate gzip compression by including Content-Encoding header
        responseHeaders += "Content-Encoding: gzip\r\n";
      }

      responseHeaders += "\r\n";
      socket.write(responseHeaders);
      socket.write(userAgent);
    } else if (path.startsWith("/files/") && method === "GET") {
      const fileName = path.replace("/files/", "").trim();
      const filePath = process.argv[3] + fileName;

      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath);
        responseHeaders += "Content-Type: application/octet-stream\r\n";
        responseHeaders += `Content-Length: ${content.length}\r\n`;

        if (isGzipRequested) {
          // Simulate gzip compression by including Content-Encoding header
          responseHeaders += "Content-Encoding: gzip\r\n";
        }

        responseHeaders += "\r\n";
        socket.write(responseHeaders);
        socket.write(content);
      } else {
        socket.write(ERROR_RESPONSE + "\r\n");
      }
    } else if (path.startsWith("/files/") && method === "POST") {
      const filename = process.argv[3] + "/" + path.substring(7);
      const req = data.toString().split("\r\n");
      const body = req[req.length - 1];
      fs.writeFileSync(filename, body);
      socket.write("HTTP/1.1 201 Created\r\n\r\n");
    } else {
      socket.write(ERROR_RESPONSE + "\r\n");
    }

    socket.end();
  });

  socket.on("error", (err) => {
    console.error("Socket error:", err);
  });
});

// Start the server and listen on port 4221
server.listen(4221, "localhost", () => {
  console.log("Server is listening on port 4221");
});
