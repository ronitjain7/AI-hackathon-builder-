const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const repoRoot = path.resolve(__dirname, "..");

const jsFiles = [];

function collectJsFiles(dirPath) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === ".git" || entry.name === "node_modules") {
        continue;
      }
      collectJsFiles(fullPath);
      continue;
    }
    if (entry.name.endsWith(".js")) {
      jsFiles.push(fullPath);
    }
  }
}

collectJsFiles(repoRoot);

let hadError = false;

for (const filePath of jsFiles) {
  const rel = path.relative(repoRoot, filePath);
  const check = spawnSync(process.execPath, ["--check", filePath], {
    encoding: "utf8",
  });
  if (check.status !== 0) {
    hadError = true;
    console.error(`Syntax error: ${rel}`);
    if (check.stderr) {
      console.error(check.stderr.trim());
    }
  }
}

const indexHtml = path.join(repoRoot, "index.html");
if (fs.existsSync(indexHtml)) {
  const html = fs.readFileSync(indexHtml, "utf8");
  if (!html.includes("app-utils.js")) {
    hadError = true;
    console.error("index.html must include app-utils.js before the React app script.");
  }
}

if (hadError) {
  process.exit(1);
}

console.log(`Lint checks passed (${jsFiles.length} JavaScript files syntax-checked).`);
