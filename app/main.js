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
const path = require("path");
const zlib = require("zlib");

const PORT = 4221;
const FILE_DIRECTORY = process.argv[3];

const server = net.createServer((socket) => {
  socket.on("data", (data) => handleRequest(socket, data));
});

server.listen(PORT, "localhost");

function handleRequest(socket, data) {
  const request = parseRequest(data);

  if (request.path === "/") {
    sendResponse(socket, 200);
  } else if (request.path.startsWith("/echo/")) {
    const message = request.path.slice(6);
    const acceptEncoding = request.headers["accept-encoding"] || "";
    
    if (acceptEncoding.includes("gzip")) {
      zlib.gzip(message, (err, compressed) => {
        if (err) {
          sendResponse(socket, 500);
        } else {
          sendResponse(socket, 200, {
            "Content-Type": "text/plain",
            "Content-Encoding": "gzip",
            "Content-Length": compressed.length
          }, compressed);
        }
      });
    } else {
      sendResponse(socket, 200, {
        "Content-Type": "text/plain",
        "Content-Length": Buffer.byteLength(message)
      }, message);
    }
  } else if (request.path === "/user-agent") {
    const userAgent = request.headers["user-agent"] || "";
    sendResponse(socket, 200, { 
      "Content-Type": "text/plain",
      "Content-Length": Buffer.byteLength(userAgent)
    }, userAgent);
  } else if (request.path.startsWith("/files/")) {
    const filePath = path.join(FILE_DIRECTORY, request.path.slice(7));
    if (request.method === "GET") {
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath);
        sendResponse(socket, 200, { 
          "Content-Type": "application/octet-stream",
          "Content-Length": content.length
        }, content);
      } else {
        sendResponse(socket, 404);
      }
    } else if (request.method === "POST") {
      fs.writeFileSync(filePath, request.body);
      sendResponse(socket, 201);
    }
  } else {
    sendResponse(socket, 404);
  }
}

function parseRequest(data) {
  const [requestLine, ...lines] = data.toString().split("\r\n");
  const [method, path] = requestLine.split(" ");
  const headers = {};
  let bodyStart = lines.indexOf("") + 1;
  
  for (let i = 0; i < bodyStart - 1; i++) {
    const [key, value] = lines[i].split(": ");
    headers[key.toLowerCase()] = value;
  }

  const body = lines.slice(bodyStart).join("\r\n");

  return { method, path, headers, body };
}

function sendResponse(socket, statusCode, headers = {}, body = "") {
  const statusText = {
    200: "OK",
    201: "Created",
    404: "Not Found",
    500: "Internal Server Error",
  }[statusCode];

  let response = `HTTP/1.1 ${statusCode} ${statusText}\r\n`;
  
  for (const [key, value] of Object.entries(headers)) {
    response += `${key}: ${value}\r\n`;
  }
  
  response += "\r\n";

  socket.write(response);
  if (body) {
    socket.write(body);
  }
  socket.end();
}