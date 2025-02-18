// server.js
const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const dotenv = require("dotenv");

dotenv.config(); // Load environment variables

const app = express();

// Proxy routes
app.use(
  "/api/chat",
  createProxyMiddleware({
    target: "http://localhost:8002", // Backend service for chat
    changeOrigin: true,
    pathRewrite: {
      "^/api/chat": "", // Remove '/api/chat' prefix before forwarding to chat backend
    },
    onProxyReq: (proxyReq, req, res) => {
      console.log(`Proxying /api/chat request to backend at port 8002`);
    },
  })
);

app.use(
  "/api/course",
  createProxyMiddleware({
    target: "http://localhost:8003", // Backend service for courses
    changeOrigin: true,
    pathRewrite: {
      "^/api/course": "", // Remove '/api/course' prefix before forwarding to course backend
    },
    onProxyReq: (proxyReq, req, res) => {
      console.log(`Proxying /api/course request to backend at port 8003`);
    },
  })
);

// Start the server
const port = process.env.API_GATEWAY_PORT || 8000;
app.listen(port, () => {
  console.log(`API Gateway is running on port ${port}`);
});
