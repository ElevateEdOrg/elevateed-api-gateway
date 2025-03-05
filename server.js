// server.js
const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const path = require("path");
const dotenv = require("dotenv");
// Use cors
const cors = require("cors");

dotenv.config(); // Load environment variables

const app = express();

// Use cors
app.use(cors());

//logger
app.all("*", (req, res, next) => {
  const date = new Date();
  console.log(
    `--> url:${req.url} status:${res.statusCode} ${date.toLocaleTimeString(
      "en-IN",
      {
        timeZone: "Asia/Kolkata", // Indian Standard Time (IST)
        hour12: false, // Use 24-hour format
        weekday: "short", // Show abbreviated weekday name
        year: "numeric", // Show full year
        month: "short", // Show abbreviated month name
        day: "numeric", // Show day of the month
        hour: "2-digit", // Show hours in 2-digit format
        minute: "2-digit", // Show minutes in 2-digit format
        second: "2-digit", // Show seconds in 2-digit format
      }
    )}`
  );
  next();
});

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
  "/api/courses",
  createProxyMiddleware({
    target: "http://localhost:8000/api/courses", // Backend service for courses
    changeOrigin: true,
  })
);

app.use(
  "/api",
  createProxyMiddleware({
    target: "http://localhost:8001", // Backend service for courses
    changeOrigin: true,
    pathRewrite: {
      "^/api": "", // Remove '/api' prefix before forwarding to course backend
    },
  })
);

// Start the server
const port = process.env.API_GATEWAY_PORT || 80;

app.use(express.static(path.join(__dirname, "/dist")));

app.get("*", (req, res) => {
  // res.status(200).json({ message: "connected to server successfully" });
   res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});
app.listen(port, () => {
  console.log(`API Gateway is running on port ${port}`);
});
