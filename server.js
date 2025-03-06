const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const path = require("path");
const dotenv = require("dotenv");
const cors = require("cors");
const fs = require("fs");
const https = require("https");

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

// Redirect HTTPS (443) requests to HTTP (80)
const httpsApp = express();
httpsApp.use((req, res) => {
  res.redirect(`http://${req.headers.host}${req.url}`);
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
const httpPort = process.env.API_GATEWAY_PORT || 80;
app.listen(httpPort, "0.0.0.0", () => {
  console.log(`API Gateway is running on port ${httpPort}`);
});

// Start the HTTPS server on port 443 with a self-signed SSL certificate
const httpsPort = 443;
const sslOptions = {
  key: fs.readFileSync("/etc/ssl/private/server.key"),
  cert: fs.readFileSync("/etc/ssl/certs/server.crt"),
};

https.createServer(sslOptions, httpsApp).listen(httpsPort, () => {
  console.log(`HTTPS redirect server is running on port ${httpsPort}`);
});
