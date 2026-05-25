const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || "127.0.0.1";
const WEBHOOK_TIMEOUT_MS = 10_000;

const rootDir = __dirname;

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".ico": "image/x-icon",
};

function sendJson(res, statusCode, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  res.end(body);
}

function sendText(res, statusCode, text) {
  res.writeHead(statusCode, {
    "Content-Type": "text/plain; charset=utf-8",
    "Cache-Control": "no-store",
  });
  res.end(text);
}

function safeResolvePath(urlPathname) {
  const pathname = urlPathname === "/" ? "/index.html" : urlPathname;
  const decodedPath = decodeURIComponent(pathname);
  const cleaned = decodedPath.replace(/^\/+/, "");
  const absolutePath = path.resolve(rootDir, cleaned);

  if (!absolutePath.startsWith(rootDir)) {
    return null;
  }
  return absolutePath;
}

function validateSlackWebhook(urlString) {
  try {
    const parsed = new URL(urlString);
    if (parsed.protocol !== "https:") {
      return false;
    }
    if (parsed.hostname !== "hooks.slack.com") {
      return false;
    }
    return parsed.pathname.startsWith("/services/");
  } catch (_error) {
    return false;
  }
}

function getRequestBody(req, limitBytes = 256_000) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let total = 0;

    req.on("data", (chunk) => {
      total += chunk.length;
      if (total > limitBytes) {
        reject(new Error("Request body too large"));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });

    req.on("end", () => {
      resolve(Buffer.concat(chunks).toString("utf8"));
    });

    req.on("error", (error) => {
      reject(error);
    });
  });
}

async function handleSlackRelay(req, res) {
  let rawBody;
  try {
    rawBody = await getRequestBody(req);
  } catch (error) {
    sendJson(res, 413, { ok: false, error: error.message });
    return;
  }

  let body;
  try {
    body = JSON.parse(rawBody || "{}");
  } catch (_error) {
    sendJson(res, 400, { ok: false, error: "Invalid JSON payload." });
    return;
  }

  const webhookUrl = body.webhookUrl;
  const payload = body.payload;

  if (!validateSlackWebhook(webhookUrl)) {
    sendJson(res, 400, { ok: false, error: "Invalid Slack webhook URL." });
    return;
  }

  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    sendJson(res, 400, { ok: false, error: "Invalid Slack payload object." });
    return;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), WEBHOOK_TIMEOUT_MS);

  try {
    const slackResponse = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    const responseText = (await slackResponse.text()).trim();
    clearTimeout(timeoutId);

    if (!slackResponse.ok || responseText.toLowerCase() !== "ok") {
      sendJson(res, 502, {
        ok: false,
        error: "Slack rejected the webhook request.",
        status: slackResponse.status,
        responseText: responseText.slice(0, 200),
      });
      return;
    }

    sendJson(res, 200, { ok: true });
  } catch (error) {
    clearTimeout(timeoutId);
    sendJson(res, 502, {
      ok: false,
      error: error.name === "AbortError" ? "Slack timeout." : error.message,
    });
  }
}

function handleStatic(req, res, pathname) {
  const filePath = safeResolvePath(pathname);
  if (!filePath) {
    sendText(res, 400, "Bad request");
    return;
  }

  fs.stat(filePath, (statError, stats) => {
    if (statError || !stats.isFile()) {
      sendText(res, 404, "Not found");
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = contentTypes[ext] || "application/octet-stream";
    res.writeHead(200, {
      "Content-Type": contentType,
      "Cache-Control": ext === ".html" ? "no-store" : "public, max-age=300",
    });
    fs.createReadStream(filePath).pipe(res);
  });
}

const server = http.createServer(async (req, res) => {
  const method = req.method || "GET";
  const parsedUrl = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
  const pathname = parsedUrl.pathname;

  if (method === "GET" && pathname === "/api/health") {
    sendJson(res, 200, { ok: true, service: "incidentiq-server" });
    return;
  }

  if (method === "POST" && pathname === "/api/slack-relay") {
    await handleSlackRelay(req, res);
    return;
  }

  if (method !== "GET" && method !== "HEAD") {
    sendText(res, 405, "Method not allowed");
    return;
  }

  handleStatic(req, res, pathname);
});

server.listen(PORT, HOST, () => {
  console.log(`IncidentIQ server running at http://${HOST}:${PORT}`);
});
