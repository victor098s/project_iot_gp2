"use strict";

const http = require("http");
const fs = require("fs");
const path = require("path");
const root = __dirname;
const types = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "application/javascript; charset=utf-8", ".svg": "image/svg+xml", ".png": "image/png" };

http.createServer((request, response) => {
  let requestPath = decodeURIComponent(request.url.split("?")[0]);
  if (requestPath === "/") requestPath = "/index.html";
  const filePath = path.resolve(root, `.${requestPath}`);
  if (!filePath.startsWith(root)) { response.writeHead(403); return response.end("Acesso negado"); }
  fs.readFile(filePath, (error, file) => {
    if (error) { response.writeHead(404); return response.end("Arquivo não encontrado"); }
    response.writeHead(200, { "Content-Type": types[path.extname(filePath)] || "application/octet-stream" });
    response.end(file);
  });
}).listen(8080, "127.0.0.1", () => console.log("Dashboard: http://127.0.0.1:8080"));
