// server.js
const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const dotenv = require("dotenv");
// Use cors
const cors = require("cors");

dotenv.config(); // Load environment variables

const app = express();

// Use cors
app.use(cors());

// Proxy routes
app.use(
  "/api/chat",
  createProxyMiddleware({
    target: "http://192.168.10.65:8002", // Backend service for chat
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
  "/api/courses",
  createProxyMiddleware({
    target: "http://192.168.10.49:8000/api/courses", // Backend service for courses
    changeOrigin: true,
  })
);

app.use(
  "/api",
  createProxyMiddleware({
    target: "http://192.168.10.111:8001", // Backend service for courses
    changeOrigin: true,
    pathRewrite: {
      "^/api": "", // Remove '/api' prefix before forwarding to course backend
    },
  })
);

// Start the server
const port = process.env.API_GATEWAY_PORT || 8000;
app.listen(port, () => {
  console.log(`API Gateway is running on port ${port}`);
});
