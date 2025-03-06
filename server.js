const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const path = require("path");
const dotenv = require("dotenv");
const cors = require("cors");


dotenv.config(); // Load environment variables

const app = express();

// Use CORS
app.use(cors());

// Logger middleware
app.all("*", (req, res, next) => {
  const date = new Date();
  console.log(
    `--> url:${req.url} status:${res.statusCode} ${date.toLocaleTimeString(
      "en-IN",
      {
        timeZone: "Asia/Kolkata",
        hour12: false,
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }
    )}`
  );
  next();
});



// Proxy routes
app.use(
  "/api/chat",
  createProxyMiddleware({
    target: "http://localhost:8002",
    changeOrigin: true,
    pathRewrite: {
      "^/api/chat": "",
    },
    onProxyReq: (proxyReq, req, res) => {
      console.log(`Proxying /api/chat request to backend at port 8002`);
    },
  })
);

app.use(
  "/api/courses",
  createProxyMiddleware({
    target: "http://localhost:8000/api/courses",
    changeOrigin: true,
  })
);

app.use(
  "/api",
  createProxyMiddleware({
    target: "http://localhost:8001",
    changeOrigin: true,
    pathRewrite: {
      "^/api": "",
    },
  })
);

// Serve static frontend files
app.use(express.static(path.join(__dirname, "/dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

// Start the HTTP server on port 80

app.listen(80, "0.0.0.0", () => {
  console.log(`API Gateway is running on port`);
});

